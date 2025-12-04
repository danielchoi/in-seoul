import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: defaultModel,
    messages,
  });

  return result.toDataStreamResponse();
}
