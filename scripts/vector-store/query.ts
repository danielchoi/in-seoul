#!/usr/bin/env bun
// Usage: bun vs:query "<prompt>"
import { config } from "dotenv";
config({ path: ".env" });
import { generateText } from "ai";
import { openai, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { ADMISSIONS_ASSISTANT_SYSTEM_PROMPT } from "../../src/lib/prompts/admissions-assistant";

const STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

async function main() {
  const prompt = process.argv.slice(2).join(" ");

  if (!prompt) {
    console.error('Usage: bun vs:query "<prompt>"');
    console.error('Example: bun vs:query "What does the guide say about authentication?"');
    process.exit(1);
  }

  if (!STORE_ID) {
    console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env");
    process.exit(1);
  }

  try {
    console.log(`Querying vector store ${STORE_ID}...`);
    console.log(`Prompt: "${prompt}"\n`);

    const result = await generateText({
      model: openai.responses("gpt-5.1"),
      system: ADMISSIONS_ASSISTANT_SYSTEM_PROMPT,
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
    console.log("\n=== COMPLETE RESULT OBJECT ===");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error querying vector store:", error);
    process.exit(1);
  }
}

main();
