import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * TEMPORARY debug route — validates the Groq model + params for /api/ai-chat.
 * Tests a 1-shot chat completion with reasoning_effort and reports the shape
 * of the response. Never exposes the key. Will be removed after validation.
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "no key configured" }, { status: 503 });
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are a TypeScript tutor. Answer in max 2 sentences." },
          { role: "user", content: "What does the `unknown` type do?" },
        ],
        stream: false,
        temperature: 0.4,
        max_tokens: 300,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text) as {
        choices?: { message?: { role?: string; content?: string; reasoning?: string } }[];
        error?: { message?: string };
      };
      const msg = json.choices?.[0]?.message;
      return Response.json({
        status: res.status,
        ok: res.ok,
        errorMessage: json.error?.message ?? null,
        role: msg?.role ?? null,
        contentPreview: msg?.content?.slice(0, 300) ?? null,
        contentLen: msg?.content?.length ?? 0,
        reasoningLen: msg?.reasoning?.length ?? 0,
        usage: (json as { usage?: unknown }).usage ?? null,
      });
    } catch {
      return Response.json({ status: res.status, raw: text.slice(0, 500) });
    }
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  }
}
