import { openai } from "@ai-sdk/openai";

// Default OpenAI model using Responses API (supports file search, web search)
export const defaultModel = openai.responses("gpt-4o");

// Alternative models for different use cases
export const models = {
  // Best for complex reasoning and generation (Responses API)
  gpt4o: openai.responses("gpt-4o"),
  // Fast and cost-effective for simpler tasks (Responses API)
  gpt4oMini: openai.responses("gpt-4o-mini"),
  // Legacy Completions API (if needed for backward compatibility)
  gpt4oLegacy: openai("gpt-4o"),
};

// File search tool factory for RAG with OpenAI vector stores
export function createFileSearchTool(vectorStoreIds: string[]) {
  return openai.tools.fileSearch({
    vectorStoreIds,
  });
}

// Web search tool factory for grounding responses with real-time information
export function createWebSearchTool(options?: {
  searchContextSize?: "low" | "medium" | "high";
  userLocation?: {
    type: "approximate";
    country?: string;
    city?: string;
    region?: string;
  };
}) {
  return openai.tools.webSearchPreview(options ?? {});
}
