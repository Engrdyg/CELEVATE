import Anthropic from "@anthropic-ai/sdk";
import { connection } from "next/server";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutor/prompt";

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 20;
const MAX_CHARS = 4000;

function configured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/** Lets the UI know whether a live AI provider is connected. */
export async function GET() {
  await connection();
  return Response.json({ available: configured(), model: configured() ? MODEL : null });
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  await connection();
  if (!configured()) {
    return Response.json({ error: "No AI provider is configured on this server." }, { status: 503 });
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[0].role !== "user" || messages.at(-1)!.role !== "user") {
    return Response.json({ error: "Conversation must start and end with a user message." }, { status: 400 });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: [{ type: "text", text: TUTOR_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    },
    { signal: req.signal },
  );

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nI can't help with that request. Try rephrasing it as a civil engineering study question."));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n(Response truncated — ask me to continue.)"));
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.enqueue(encoder.encode("\n\nThe AI service is busy right now. Please try again in a moment."));
          controller.close();
        } else if (error instanceof Anthropic.APIUserAbortError) {
          controller.close();
        } else {
          controller.error(error);
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Tutor-Model": MODEL },
  });
}
