import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/ai-chat
 * Streams a Groq-powered TypeScript tutor reply as plain text chunks.
 * The API key lives server-side only (GROQ_API_KEY env var).
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 6000;
const MAX_TOTAL_CHARS = 40_000;
const RATE_LIMIT = 30; // requests per window per IP
const RATE_WINDOW_MS = 60_000;

/* ---- naive in-memory rate limiting (per instance; basic abuse guard) ---- */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  lang?: "en" | "bn";
  view?: string;
  dayId?: number;
  dayTitle?: string;
  sectionTitle?: string;
}

const CURRICULUM_OUTLINE = `Day 1: Setup & Basic Types (primitives, arrays, tuples, enums, any/unknown/void/never, annotations vs inference)
Day 2: Functions, Objects & Interfaces (parameters, optional/default/rest, function types, readonly, interface vs type, extends & intersections)
Day 3: Unions, Narrowing & Assertions (literal types, typeof/instanceof/in, discriminated unions, as/!/?./??, any vs unknown)
Day 4: Generics (type parameters, generic functions/classes, constraints, keyof/typeof)
Day 5: Utility & Mapped Types (Partial, Required, Readonly, Pick, Omit, Record, ReturnType/Parameters/NonNullable/Awaited, indexed access, mapped/conditional)
Day 6: Classes, Modules & Config (modifiers, abstract/implements, import type, tsconfig strict, .d.ts, typed async/fetch)
Day 7: Real Code & Interview Prep (JS->TS migration, reading repos, React/Node specifics, 15 interview questions)`;

function buildSystemPrompt(context: ChatContext): string {
  const location = context.view
    ? context.view === "day" && context.dayId
      ? `The user is currently reading Day ${context.dayId}${
          context.dayTitle ? ` ("${context.dayTitle}")` : ""
        }${
          context.sectionTitle ? `, in the section "${context.sectionTitle}"` : ""
        }.`
      : `The user is currently on the ${context.view} view.`
    : "The user's current view is unknown.";

  const language =
    context.lang === "bn"
      ? `IMPORTANT: Reply fully in natural, warm, standard Bengali (বাংলা) — this is a Bengali-speaking learner. Keep code, identifiers, file names, and error messages exactly as they are (English). Well-known technical terms may stay in English or be transliterated naturally (e.g. টাইপ, ইন্টারফেস, জেনেরিক, narrowing). Use Bengali numerals (১২৩) in prose. Do not write long English sentences inside Bengali replies — translate everything into Bengali.`
      : "Reply in clear, simple English suitable for a learner whose first language may not be English.";

  return `You are "TS Tutor" — the built-in AI assistant of "TS in 7 Days", an interactive TypeScript course web app (7-day curriculum, runnable code examples, quizzes, a real tsc playground, interview prep).

Your job: help the user learn TypeScript as this course's tutor.

Course outline (ground your answers in this; refer to days/sections when useful):
${CURRICULUM_OUTLINE}

Current context: ${location}

${language}

Style rules:
- Be concise, friendly, and practical. Short paragraphs and bullet lists over walls of text.
- Always illustrate concepts with small TypeScript code examples in fenced \`\`\`ts blocks (5-15 lines).
- When the user shows an error or broken code, briefly explain the cause and show the fixed version.
- When asked for a quiz, ask ONE multiple-choice question at a time and wait for the answer before revealing the solution + explanation.
- Prefer unknown over any, interface/type conventions, literal unions, and strict mode — the course's recommendations.
- If a question is far outside TypeScript/JavaScript (e.g. another language or framework internals), answer briefly and steer back to TS learning.
- Keep answers under ~200 words unless the user asks for depth or a quiz.`;
}

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const messages: ChatMessage[] = [];
  let total = 0;
  for (const item of raw) {
    if (messages.length >= MAX_MESSAGES) break;
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const trimmed = content.slice(0, MAX_CONTENT_CHARS).trim();
    if (!trimmed) continue;
    total += trimmed.length;
    if (total > MAX_TOTAL_CHARS) break;
    messages.push({ role, content: trimmed });
  }
  return messages;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI is not configured on this server." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const history = sanitizeMessages(body.messages);
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "No user message provided." }, { status: 400 });
  }

  // Send at most the last 12 messages to the model.
  const window = history.slice(-12);
  const context = (body.context ?? {}) as ChatContext;

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(context) },
          ...window,
        ],
        stream: true,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });
  } catch {
    return Response.json({ error: "Could not reach the AI service." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: `AI service error (HTTP ${upstream.status}).` },
      { status: 502 }
    );
  }

  /* Transform the SSE stream into a plain-text stream. */
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const chunk = json.choices?.[0]?.delta?.content;
              if (chunk) controller.enqueue(encoder.encode(chunk));
            } catch {
              // partial JSON — ignore
            }
          }
        }
      } catch {
        // client disconnected or upstream error mid-stream
      } finally {
        controller.close();
        reader.releaseLock?.();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
