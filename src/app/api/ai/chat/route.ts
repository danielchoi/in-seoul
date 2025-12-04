import { streamText, convertToModelMessages } from "ai";
import { defaultModel, createFileSearchTool } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

  const result = streamText({
    model: defaultModel,
    messages: convertToModelMessages(messages),
    // Enable file search if vector store is configured
    ...(vectorStoreId && {
      tools: {
        file_search: createFileSearchTool([vectorStoreId]),
      },
    }),
    // Include search results in response
    providerOptions: {
      openai: {
        include: ["file_search_call.results"],
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
