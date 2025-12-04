#!/usr/bin/env tsx
// Usage: pnpm vs:query "<prompt>"
import { config } from "dotenv";
config({ path: ".env.local" });
import { generateText } from "ai";
import { openai, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";

const STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

async function main() {
  const prompt = process.argv.slice(2).join(" ");

  if (!prompt) {
    console.error('Usage: pnpm vs:query "<prompt>"');
    console.error('Example: pnpm vs:query "What does the guide say about authentication?"');
    process.exit(1);
  }

  if (!STORE_ID) {
    console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env.local");
    process.exit(1);
  }

  try {
    console.log(`Querying vector store ${STORE_ID}...`);
    console.log(`Prompt: "${prompt}"\n`);

    const result = await generateText({
      model: openai.responses("gpt-5.1"),
      system: "You are a helpful expert in college admissions assistance that can answer questions using the latest documents university has provided in the vector store. Try to answer the question with the most relevant information from the vector store. If you don't know the answer, say 'I don't know'. When answering the question, you should use the following format: [Answer] [Source] [Source] [Source] ... [Source]. Answer in Korean",
      prompt,
      tools: {
        file_search: openai.tools.fileSearch({ vectorStoreIds: [STORE_ID] }),
      },
      providerOptions: {
        openai: { include: ["file_search_call.results"] } satisfies OpenAIResponsesProviderOptions,
      },
    });

    console.log("=== ALL RESULT PROPERTIES ===");
    console.log("Keys:", Object.keys(result));
    console.log("\n--- Content ---");
    console.log(JSON.stringify(result.content, null, 2));
    console.log("\n--- Text ---");
    console.log(result.text);
    console.log("\n--- Reasoning ---");
    console.log(JSON.stringify(result.reasoning, null, 2));
    console.log("\n--- Reasoning Text ---");
    console.log(result.reasoningText);
    console.log("\n--- Files ---");
    console.log(JSON.stringify(result.files, null, 2));
    console.log("\n--- Sources ---");
    console.log(JSON.stringify(result.sources, null, 2));
    console.log("\n--- Tool Calls ---");
    console.log(JSON.stringify(result.toolCalls, null, 2));
    console.log("\n--- Static Tool Calls ---");
    console.log(JSON.stringify(result.staticToolCalls, null, 2));
    console.log("\n--- Dynamic Tool Calls ---");
    console.log(JSON.stringify(result.dynamicToolCalls, null, 2));
    console.log("\n--- Tool Results ---");
    console.log(JSON.stringify(result.toolResults, null, 2));
    console.log("\n--- Static Tool Results ---");
    console.log(JSON.stringify(result.staticToolResults, null, 2));
    console.log("\n--- Dynamic Tool Results ---");
    console.log(JSON.stringify(result.dynamicToolResults, null, 2));
    console.log("\n--- Finish Reason ---");
    console.log(result.finishReason);
    console.log("\n--- Usage ---");
    console.log(JSON.stringify(result.usage, null, 2));
    console.log("\n--- Total Usage ---");
    console.log(JSON.stringify(result.totalUsage, null, 2));
    console.log("\n--- Warnings ---");
    console.log(JSON.stringify(result.warnings, null, 2));
    console.log("\n--- Request ---");
    console.log(JSON.stringify(result.request, null, 2));
    console.log("\n--- Response ---");
    console.log(JSON.stringify(result.response, null, 2));
    console.log("\n--- Provider Metadata ---");
    console.log(JSON.stringify(result.providerMetadata, null, 2));
    console.log("\n=== COMPLETE RESULT OBJECT ===");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error querying vector store:", error);
    process.exit(1);
  }
}

main();
