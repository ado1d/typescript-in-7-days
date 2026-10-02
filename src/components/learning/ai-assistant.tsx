"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X, Trash2, CircleAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/use-is-client";
import { useT, type Lang } from "@/lib/i18n";
import { clearSeed, closeAssistant, openAssistant, useAssistant } from "@/lib/assistant-store";

/* ------------------------------------------------------------------ */
/* Markdown-lite rendering: fenced code blocks + `inline code` + bold  */
/* ------------------------------------------------------------------ */

function splitFences(text: string): { type: "text" | "code"; content: string }[] {
  const parts: { type: "text" | "code"; content: string }[] = [];
  const fence = /```(?:[a-zA-Z]+)?\n?([\s\S]*?)(?:```|$)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", content: text.slice(last, match.index) });
    }
    parts.push({ type: "code", content: match[1].replace(/\n$/, "") });
    last = fence.lastIndex;
  }
  if (last < text.length) {
    parts.push({ type: "text", content: text.slice(last) });
  }
  return parts;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-emerald-700 dark:text-emerald-400"
        >
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MessageBody({ text }: { text: string }) {
  const parts = splitFences(text);
  return (
    <div className="space-y-2.5">
      {parts.map((part, i) =>
        part.type === "code" ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-[12px] leading-relaxed text-zinc-200"
          >
            <code>{part.content}</code>
          </pre>
        ) : (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {renderInline(part.content.trim())}
          </p>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "ts7-ai-chat-v1";
const MAX_STORED = 30;

function loadMessages(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(0, MAX_STORED);
  } catch {
    return [];
  }
}

export interface AssistantContextInfo {
  view: string;
  dayId?: number;
  dayTitle?: string;
  lang: Lang;
}

interface AiAssistantProps {
  context: AssistantContextInfo;
}

export function AiAssistant({ context }: AiAssistantProps) {
  const { t, lang } = useT();
  const { open, seed } = useAssistant();
  const isClient = useIsClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef(context);
  const handledSeedRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  /* hydrate from localStorage once — deferred a tick so the effect never
   * calls setState synchronously (avoids cascading renders) */
  useEffect(() => {
    const t = setTimeout(() => setMessages(loadMessages()), 0);
    return () => clearTimeout(t);
  }, []);

  const persist = useCallback((next: ChatMessage[]) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next.slice(-MAX_STORED))
      );
    } catch {
      // storage full/unavailable — chat just won't persist
    }
  }, []);

  /* autoscroll on new content */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, open]);

  /* focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setError(null);
      setInput("");

      const history = [...messages, { role: "user" as const, content: trimmed }];
      setMessages(history);
      persist(history);
      setStreaming(true);
      setStreamText("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            context: {
              lang: contextRef.current.lang,
              view: contextRef.current.view,
              dayId: contextRef.current.dayId,
              dayTitle: contextRef.current.dayTitle,
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        if (!res.body) throw new Error("No response stream.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setStreamText(acc);
        }
        acc += decoder.decode();
        setStreamText("");

        if (acc.trim()) {
          const next = [...history, { role: "assistant" as const, content: acc.trim() }];
          setMessages(next);
          persist(next);
        } else {
          throw new Error("Empty response.");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setStreamText("");
          return;
        }
        setError(t.assistant.error);
        setStreamText("");
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, persist, streaming, t.assistant.error]
  );

  /* consume seeded questions from lessons. Deferred via setTimeout both to
   * satisfy set-state-in-effect hygiene and because clearSeed() re-renders
   * this component — a cleanup would cancel the send before it fires. */
  useEffect(() => {
    if (!seed || seed.id === handledSeedRef.current) return;
    handledSeedRef.current = seed.id;
    clearSeed();
    if (!open) return; // opened via openAssistant anyway; guard for safety
    setTimeout(() => void send(seed.text), 0);
  }, [seed]);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreamText("");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  if (!isClient) return null;

  const suggestions = lang === "bn" ? t.assistant.suggestionsBn : t.assistant.suggestions;
  const placeholder =
    lang === "bn" ? t.assistant.placeholderBn : t.assistant.placeholder;
  const empty = messages.length === 0 && !streaming;

  return (
    <>
      {/* Floating launch button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => openAssistant()}
            aria-label={t.assistant.open}
            className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-emerald-600 pl-4 pr-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 sm:bottom-6 sm:right-6"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {t.assistant.title}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={t.assistant.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-4 right-4 z-50 flex max-h-[min(72vh,560px)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:bottom-6 sm:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Bot className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {t.assistant.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {t.assistant.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={clearChat}
                aria-label={t.assistant.clear}
                title={t.assistant.clear}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={closeAssistant}
                aria-label={t.assistant.close}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {empty && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.assistant.title}
                    </p>
                    <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                      {t.assistant.disclaimer}
                    </p>
                  </div>
                  <div className="w-full space-y-1.5">
                    <p className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.assistant.suggestionsTitle}
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="w-full rounded-lg border bg-card px-3 py-2 text-left text-xs leading-relaxed text-foreground transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!empty && (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn("flex gap-2", m.role === "user" && "justify-end")}
                    >
                      {m.role === "assistant" && (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                          m.role === "user"
                            ? "rounded-br-md bg-emerald-600 text-white"
                            : "rounded-bl-md border bg-card text-foreground/90"
                        )}
                      >
                        {m.role === "user" ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        ) : (
                          <MessageBody text={m.content} />
                        )}
                      </div>
                      {m.role === "user" && (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  ))}

                  {(streaming || error) && (
                    <div className="flex gap-2">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md border bg-card px-3.5 py-2.5 text-sm">
                        {error ? (
                          <p className="flex items-center gap-2 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                            <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {error}
                          </p>
                        ) : streamText ? (
                          <div className="text-foreground/90">
                            <MessageBody text={streamText} />
                            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-emerald-500 align-text-bottom" />
                          </div>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="flex gap-1" aria-hidden="true">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:120ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:240ms]" />
                            </span>
                            {t.assistant.thinking}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value.slice(0, 2000));
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 110) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={1}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  disabled={streaming}
                  className="max-h-[110px] min-h-[38px] w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label={t.assistant.send}
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <p className="mt-1.5 px-1 text-[10px] leading-tight text-muted-foreground">
                {t.assistant.disclaimer}
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiAssistant;
