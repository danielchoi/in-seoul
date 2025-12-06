import { generateText, generateObject } from "ai";
import { openai, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { z } from "zod";
import { questionRepository } from "@/lib/repositories/question.repository";
import { answerRepository, type AnswerSourceInput } from "@/lib/repositories/answer.repository";
import { promptRepository } from "@/lib/repositories/prompt.repository";
import { ADMISSIONS_ASSISTANT_SYSTEM_PROMPT } from "@/lib/prompts/admissions-assistant";

// Type for file search results from OpenAI Responses API
interface FileSearchResult {
  file_id: string;
  filename: string;
  text: string;
  score?: number;
  attributes?: Record<string, unknown>;
}

interface FileSearchContent {
  type: "file_search_call";
  fileSearchCall: {
    id: string;
    status: string;
    results?: FileSearchResult[];
  };
}

// Schema for follow-up questions generation
const followUpQuestionsSchema = z.object({
  followUpQuestions: z
    .array(
      z.object({
        question: z.string().describe("A follow-up question in Korean"),
        reason: z.string().describe("Why this follow-up is relevant"),
      })
    )
    .length(5)
    .describe("5 relevant follow-up questions"),
});

// Schema for question rephrasing
const rephrasedQuestionSchema = z.object({
  rephrasedQuestion: z
    .string()
    .describe("The optimized version of the question in Korean"),
  isOptimized: z
    .boolean()
    .describe("Whether the question was actually changed"),
  reason: z.string().describe("Why the question was or was not rephrased"),
});

export interface GenerateAnswerOptions {
  questionId: string;
  promptId?: string;
  model?: string;
  generateFollowUps?: boolean;
  rephraseQuestion?: boolean;
}

export interface GenerateAnswerResult {
  answer: Awaited<ReturnType<typeof answerRepository.findById>>;
  followUps?: Array<{ question: string; questionId: string }>;
  rephrasedQuestion?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
    latencyMs: number;
  };
}

// Pricing per 1M tokens (as of Dec 2024)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4.1": { input: 2, output: 8 },
  "gpt-5.1": { input: 2, output: 8 },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["gpt-4o"];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

function extractSourcesFromContent(
  content: unknown[]
): AnswerSourceInput[] {
  const sources: AnswerSourceInput[] = [];

  for (const item of content) {
    if (
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      (item as { type: string }).type === "file_search_call"
    ) {
      const fileSearchContent = item as FileSearchContent;
      const results = fileSearchContent.fileSearchCall?.results ?? [];

      for (const result of results) {
        sources.push({
          fileId: result.file_id,
          fileName: result.filename,
          chunkText: result.text,
          relevanceScore: result.score?.toString() ?? null,
          metadata: result.attributes ?? null,
        });
      }
    }
  }

  return sources;
}

export const qaGenerationService = {
  async generateAnswer(
    options: GenerateAnswerOptions
  ): Promise<GenerateAnswerResult> {
    const {
      questionId,
      promptId,
      model = "gpt-4o",
      generateFollowUps = true,
      rephraseQuestion = true,
    } = options;

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      throw new Error("OPENAI_VECTOR_STORE_ID is not set");
    }

    // Get the question
    const question = await questionRepository.findById(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Get the prompt (use active prompt if no promptId provided)
    let systemPrompt = ADMISSIONS_ASSISTANT_SYSTEM_PROMPT;
    let resolvedPromptId = promptId;

    if (promptId) {
      const promptRecord = await promptRepository.findById(promptId);
      if (promptRecord) {
        systemPrompt = promptRecord.content;
      }
    } else {
      // Try to get active prompt
      const activePrompt = await promptRepository.findActiveByName(
        "admissions-qa"
      );
      if (activePrompt) {
        systemPrompt = activePrompt.content;
        resolvedPromptId = activePrompt.id;
      }
    }

    const questionText = question.rephrasedText ?? question.originalText;
    const startTime = Date.now();

    // Generate the answer
    const result = await generateText({
      model: openai.responses(model),
      system: systemPrompt,
      prompt: questionText,
      tools: {
        file_search: openai.tools.fileSearch({ vectorStoreIds: [vectorStoreId] }),
      },
      providerOptions: {
        openai: {
          include: ["file_search_call.results"],
        } satisfies OpenAIResponsesProviderOptions,
      },
    });

    const latencyMs = Date.now() - startTime;
    const inputTokens = result.usage?.promptTokens ?? 0;
    const outputTokens = result.usage?.completionTokens ?? 0;
    const totalTokens = inputTokens + outputTokens;
    const costUsd = calculateCost(model, inputTokens, outputTokens);

    // Extract sources from content
    const sources = extractSourcesFromContent(result.content);

    // Create the answer
    const answer = await answerRepository.create(
      {
        questionId,
        promptId: resolvedPromptId ?? null,
        content: result.text,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd: costUsd.toString(),
        latencyMs,
        generatedAt: new Date(),
      },
      sources
    );

    const resultData: GenerateAnswerResult = {
      answer: await answerRepository.findById(answer.id),
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
        latencyMs,
      },
    };

    // Generate follow-up questions if requested
    if (generateFollowUps) {
      const followUps = await this.generateFollowUpQuestions(
        questionText,
        result.text,
        model
      );

      const createdFollowUps: Array<{ question: string; questionId: string }> = [];

      for (let i = 0; i < followUps.length; i++) {
        const followUp = await questionRepository.create(
          {
            originalText: followUps[i].question,
            parentQuestionId: questionId,
            orderIndex: i + 1,
            status: "draft",
            priority: 0,
          },
          [] // No tags for follow-ups initially
        );
        createdFollowUps.push({
          question: followUps[i].question,
          questionId: followUp.id,
        });
      }

      resultData.followUps = createdFollowUps;
    }

    // Rephrase question if requested and not already rephrased
    if (rephraseQuestion && !question.rephrasedText) {
      const rephrased = await this.rephraseQuestion(question.originalText, model);
      if (rephrased.isOptimized) {
        await questionRepository.update(questionId, {
          rephrasedText: rephrased.rephrasedQuestion,
        });
        resultData.rephrasedQuestion = rephrased.rephrasedQuestion;
      }
    }

    // Update question status to active
    await questionRepository.update(questionId, { status: "active" });

    return resultData;
  },

  async generateFollowUpQuestions(
    questionText: string,
    answerText: string,
    model: string = "gpt-4o-mini"
  ): Promise<Array<{ question: string; reason: string }>> {
    const result = await generateObject({
      model: openai(model),
      schema: followUpQuestionsSchema,
      prompt: `Based on the following question and answer about Korean college admissions, generate 5 relevant follow-up questions that a user might ask next.

Original Question:
${questionText}

Answer:
${answerText}

Generate 5 follow-up questions in Korean that:
1. Dig deeper into specific details mentioned in the answer
2. Ask about related topics or requirements
3. Clarify potential edge cases or exceptions
4. Help the user make a decision or take action
5. Cover different aspects (dates, requirements, documents, etc.)`,
    });

    return result.object.followUpQuestions;
  },

  async rephraseQuestion(
    originalQuestion: string,
    model: string = "gpt-4o-mini"
  ): Promise<{ rephrasedQuestion: string; isOptimized: boolean; reason: string }> {
    const result = await generateObject({
      model: openai(model),
      schema: rephrasedQuestionSchema,
      prompt: `You are optimizing questions about Korean college admissions for better vector store search results.

Original Question:
${originalQuestion}

Analyze the question and:
1. If it's already clear and specific, keep it as is (set isOptimized to false)
2. If it can be improved, rephrase it to be more specific and searchable

Optimization guidelines:
- Add specific context if implied (e.g., "2025학년도", "수시", "정시")
- Clarify ambiguous terms
- Make the question more precise for document retrieval
- Keep the core intent the same
- Response must be in Korean`,
    });

    return result.object;
  },

  async createQuestion(
    originalText: string,
    tagIds: string[] = [],
    options: {
      rephrase?: boolean;
      generateAnswer?: boolean;
      generateFollowUps?: boolean;
    } = {}
  ) {
    const { rephrase = true, generateAnswer = false, generateFollowUps = true } = options;

    // Create the question
    const question = await questionRepository.create(
      {
        originalText,
        status: "draft",
        priority: 0,
      },
      tagIds
    );

    // Rephrase if requested
    if (rephrase) {
      const rephrased = await this.rephraseQuestion(originalText);
      if (rephrased.isOptimized) {
        await questionRepository.update(question.id, {
          rephrasedText: rephrased.rephrasedQuestion,
        });
      }
    }

    // Generate answer if requested
    if (generateAnswer) {
      return this.generateAnswer({
        questionId: question.id,
        generateFollowUps,
        rephraseQuestion: false, // Already done above
      });
    }

    return { question: await questionRepository.findById(question.id) };
  },

  async regenerateAnswer(questionId: string, promptId?: string) {
    return this.generateAnswer({
      questionId,
      promptId,
      generateFollowUps: false, // Don't regenerate follow-ups
      rephraseQuestion: false, // Question already exists
    });
  },

  async regenerateAllWithPrompt(promptId: string) {
    const questions = await questionRepository.findRootQuestions("active");

    const results: Array<{
      questionId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const question of questions) {
      try {
        await this.regenerateAnswer(question.id, promptId);
        results.push({ questionId: question.id, success: true });
      } catch (error) {
        results.push({
          questionId: question.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
};
