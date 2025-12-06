#!/usr/bin/env tsx
// Usage: pnpm qa:manage <command> [args]
// Commands:
//   list                    - List all questions
//   create <question>       - Create a new question
//   generate <question_id>  - Generate answer for a question
//   regenerate <question_id> - Regenerate answer with current prompt
//   show <question_id>      - Show question with answer
//   tags                    - List all tags
//   create-tag <name>       - Create a new tag
import { config } from "dotenv";
config({ path: ".env" });

import { questionRepository } from "../../src/lib/repositories/question.repository";
import { tagRepository } from "../../src/lib/repositories/tag.repository";
import { promptRepository } from "../../src/lib/repositories/prompt.repository";
import { qaGenerationService } from "../../src/lib/services/qa-generation.service";

function printHelp() {
  console.log(`
Usage: pnpm qa:manage <command> [args]

Commands:
  list [status]           List all questions (status: draft, active, archived)
  create <question>       Create a new question (draft status)
  generate <question_id>  Generate answer for a question
  regenerate <question_id> Regenerate answer with current active prompt
  show <question_id>      Show question with current answer

Tag Commands:
  tags                    List all tags
  create-tag <name> [slug] [parent_id]  Create a new tag

Prompt Commands:
  prompts                 List all prompts
  create-prompt <name> <content>  Create a new prompt version
  activate-prompt <id>    Set prompt as active

Examples:
  pnpm qa:manage list
  pnpm qa:manage list active
  pnpm qa:manage create "서울대 수시 지원 자격이 어떻게 되나요?"
  pnpm qa:manage generate abc123
  pnpm qa:manage show abc123
  pnpm qa:manage tags
  pnpm qa:manage create-tag "입시" admissions
`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "list": {
        const status = args[0];
        const questions = await questionRepository.findAll(status);

        if (questions.length === 0) {
          console.log("No questions found.");
        } else {
          console.log(`\nFound ${questions.length} questions:\n`);
          for (const q of questions) {
            const tags = q.questionTags?.map(qt => qt.tag?.name).filter(Boolean).join(", ") || "-";
            const parentInfo = q.parentQuestionId ? ` (follow-up of ${q.parentQuestionId})` : "";
            console.log(`[${q.status}] ${q.id}${parentInfo}`);
            console.log(`  Original: ${q.originalText.substring(0, 80)}${q.originalText.length > 80 ? "..." : ""}`);
            if (q.rephrasedText) {
              console.log(`  Rephrased: ${q.rephrasedText.substring(0, 80)}${q.rephrasedText.length > 80 ? "..." : ""}`);
            }
            console.log(`  Tags: ${tags}`);
            console.log();
          }
        }
        break;
      }

      case "create": {
        const questionText = args.join(" ");
        if (!questionText) {
          console.error("Error: question text is required");
          console.error("Usage: pnpm qa:manage create <question>");
          process.exit(1);
        }

        console.log("Creating question...");
        const result = await qaGenerationService.createQuestion(questionText, [], {
          rephrase: true,
          generateAnswer: false,
        });

        if ("question" in result && result.question) {
          console.log("\nQuestion created:");
          console.log(`  ID: ${result.question.id}`);
          console.log(`  Original: ${result.question.originalText}`);
          if (result.question.rephrasedText) {
            console.log(`  Rephrased: ${result.question.rephrasedText}`);
          }
          console.log(`  Status: ${result.question.status}`);
          console.log("\nTo generate an answer, run:");
          console.log(`  pnpm qa:manage generate ${result.question.id}`);
        }
        break;
      }

      case "generate": {
        const questionId = args[0];
        if (!questionId) {
          console.error("Error: question_id is required");
          console.error("Usage: pnpm qa:manage generate <question_id>");
          process.exit(1);
        }

        console.log(`Generating answer for question ${questionId}...`);
        const startTime = Date.now();

        const result = await qaGenerationService.generateAnswer({
          questionId,
          generateFollowUps: true,
          rephraseQuestion: true,
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n✓ Answer generated in ${duration}s`);
        console.log(`\nUsage:`);
        console.log(`  Input tokens: ${result.usage.inputTokens}`);
        console.log(`  Output tokens: ${result.usage.outputTokens}`);
        console.log(`  Cost: $${result.usage.costUsd.toFixed(4)}`);
        console.log(`  Latency: ${result.usage.latencyMs}ms`);

        if (result.answer) {
          console.log(`\nAnswer (v${result.answer.version}):`);
          console.log("-".repeat(60));
          console.log(result.answer.content?.substring(0, 500));
          if (result.answer.content && result.answer.content.length > 500) {
            console.log("...[truncated]");
          }
          console.log("-".repeat(60));

          if (result.answer.sources && result.answer.sources.length > 0) {
            console.log(`\nSources (${result.answer.sources.length}):`);
            for (const source of result.answer.sources.slice(0, 3)) {
              console.log(`  - ${source.fileName} (score: ${source.relevanceScore})`);
            }
            if (result.answer.sources.length > 3) {
              console.log(`  ... and ${result.answer.sources.length - 3} more`);
            }
          }
        }

        if (result.followUps && result.followUps.length > 0) {
          console.log(`\nFollow-up questions (${result.followUps.length}):`);
          for (const fu of result.followUps) {
            console.log(`  - [${fu.questionId}] ${fu.question.substring(0, 60)}...`);
          }
        }

        if (result.rephrasedQuestion) {
          console.log(`\nQuestion was rephrased to:`);
          console.log(`  ${result.rephrasedQuestion}`);
        }
        break;
      }

      case "regenerate": {
        const questionId = args[0];
        if (!questionId) {
          console.error("Error: question_id is required");
          console.error("Usage: pnpm qa:manage regenerate <question_id>");
          process.exit(1);
        }

        console.log(`Regenerating answer for question ${questionId}...`);
        const result = await qaGenerationService.regenerateAnswer(questionId);

        console.log(`\n✓ Answer regenerated`);
        console.log(`  Version: ${result.answer?.version}`);
        console.log(`  Cost: $${result.usage.costUsd.toFixed(4)}`);
        break;
      }

      case "show": {
        const questionId = args[0];
        if (!questionId) {
          console.error("Error: question_id is required");
          console.error("Usage: pnpm qa:manage show <question_id>");
          process.exit(1);
        }

        const question = await questionRepository.findByIdWithCurrentAnswer(questionId);
        if (!question) {
          console.error(`Question not found: ${questionId}`);
          process.exit(1);
        }

        console.log("\n" + "=".repeat(60));
        console.log("QUESTION");
        console.log("=".repeat(60));
        console.log(`ID: ${question.id}`);
        console.log(`Status: ${question.status}`);
        console.log(`Original: ${question.originalText}`);
        if (question.rephrasedText) {
          console.log(`Rephrased: ${question.rephrasedText}`);
        }

        const tags = question.questionTags?.map(qt => qt.tag?.name).filter(Boolean).join(", ") || "-";
        console.log(`Tags: ${tags}`);

        const currentAnswer = question.answers?.[0];
        if (currentAnswer) {
          console.log("\n" + "=".repeat(60));
          console.log(`ANSWER (v${currentAnswer.version})`);
          console.log("=".repeat(60));
          console.log(`Model: ${currentAnswer.model}`);
          console.log(`Generated: ${currentAnswer.generatedAt}`);
          console.log(`Cost: $${currentAnswer.costUsd}`);
          console.log("\n" + currentAnswer.content);

          if (currentAnswer.sources && currentAnswer.sources.length > 0) {
            console.log("\n" + "-".repeat(60));
            console.log("SOURCES");
            console.log("-".repeat(60));
            for (const source of currentAnswer.sources) {
              console.log(`\n[${source.fileName}] (score: ${source.relevanceScore})`);
              console.log(source.chunkText.substring(0, 200) + "...");
            }
          }
        } else {
          console.log("\n[No answer generated yet]");
        }
        break;
      }

      case "tags": {
        const tags = await tagRepository.findAll();

        if (tags.length === 0) {
          console.log("No tags found.");
        } else {
          console.log("\nTags:\n");
          for (const t of tags) {
            const parentInfo = t.parent ? ` (parent: ${t.parent.name})` : "";
            const childCount = t.children?.length || 0;
            console.log(`  ${t.id}: ${t.name} (${t.slug})${parentInfo} [${childCount} children]`);
          }
        }
        break;
      }

      case "create-tag": {
        const name = args[0];
        const slug = args[1] || name?.toLowerCase().replace(/\s+/g, "-");
        const parentId = args[2];

        if (!name) {
          console.error("Error: tag name is required");
          console.error("Usage: pnpm qa:manage create-tag <name> [slug] [parent_id]");
          process.exit(1);
        }

        const tag = await tagRepository.create({
          name,
          slug,
          parentId: parentId || null,
        });

        console.log("\nTag created:");
        console.log(`  ID: ${tag.id}`);
        console.log(`  Name: ${tag.name}`);
        console.log(`  Slug: ${tag.slug}`);
        break;
      }

      case "prompts": {
        const prompts = await promptRepository.findAll();

        if (prompts.length === 0) {
          console.log("No prompts found.");
        } else {
          console.log("\nPrompts:\n");
          for (const p of prompts) {
            const activeFlag = p.isActive ? " [ACTIVE]" : "";
            console.log(`  ${p.id}: ${p.name} v${p.version}${activeFlag}`);
            console.log(`    Created: ${p.createdAt}`);
            console.log(`    Content: ${p.content.substring(0, 100)}...`);
            console.log();
          }
        }
        break;
      }

      case "create-prompt": {
        const name = args[0];
        const content = args.slice(1).join(" ");

        if (!name || !content) {
          console.error("Error: name and content are required");
          console.error("Usage: pnpm qa:manage create-prompt <name> <content>");
          process.exit(1);
        }

        // Get next version
        const latest = await promptRepository.findLatestByName(name);
        const version = (latest?.version ?? 0) + 1;

        const prompt = await promptRepository.create({
          name,
          content,
          version,
          isActive: false,
        });

        console.log("\nPrompt created:");
        console.log(`  ID: ${prompt.id}`);
        console.log(`  Name: ${prompt.name}`);
        console.log(`  Version: ${prompt.version}`);
        console.log("\nTo activate this prompt, run:");
        console.log(`  pnpm qa:manage activate-prompt ${prompt.id}`);
        break;
      }

      case "activate-prompt": {
        const promptId = args[0];

        if (!promptId) {
          console.error("Error: prompt_id is required");
          console.error("Usage: pnpm qa:manage activate-prompt <prompt_id>");
          process.exit(1);
        }

        const prompt = await promptRepository.setActive(promptId);
        console.log(`\n✓ Prompt activated: ${prompt.name} v${prompt.version}`);
        break;
      }

      case "stats": {
        const counts = await questionRepository.countByStatus();
        console.log("\nQuestion Statistics:");
        console.log("-".repeat(30));
        for (const [status, count] of Object.entries(counts)) {
          console.log(`  ${status}: ${count}`);
        }
        break;
      }

      default:
        printHelp();
        break;
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
