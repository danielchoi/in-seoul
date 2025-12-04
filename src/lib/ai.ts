import { openai } from "@ai-sdk/openai";

// Default OpenAI model configuration
export const defaultModel = openai("gpt-4o");

// Alternative models for different use cases
export const models = {
  // Best for complex reasoning and generation
  gpt4o: openai("gpt-4o"),
  // Fast and cost-effective for simpler tasks
  gpt4oMini: openai("gpt-4o-mini"),
};
