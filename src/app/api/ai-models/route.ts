import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * TEMPORARY debug route — lists model IDs available to GROQ_API_KEY.
 * Safe: returns only model ids/owners, never the key. Will be removed
 * once the production model is confirmed.
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "no key configured" }, { status: 503 });
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    // Parse and strip everything except ids so the response stays small.
    try {
      const json = JSON.parse(text) as { data?: { id?: string; owner?: string; context_window?: number }[] };
      const models = (json.data ?? []).map((m) => ({ id: m.id, owner: m.owner, ctx: m.context_window }));
      return Response.json({ status: res.status, count: models.length, models });
    } catch {
      return Response.json({ status: res.status, raw: text.slice(0, 500) });
    }
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  }
}
