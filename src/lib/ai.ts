import { openai } from "@ai-sdk/openai";

// Default OpenAI model using Responses API (supports file search, web search)
export const defaultModel = openai.responses("gpt-5.1");

// File search tool factory for RAG with OpenAI vector stores
export function createFileSearchTool(vectorStoreIds: string[]) {
  return openai.tools.fileSearch({
    vectorStoreIds,
    maxNumResults: 50,
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
