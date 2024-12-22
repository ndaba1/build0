import { bedrock } from "@ai-sdk/amazon-bedrock";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: bedrock("us.anthropic.claude-3-5-sonnet-20241022-v2:0"),
    messages,
  });

  return result.toDataStreamResponse();
}
