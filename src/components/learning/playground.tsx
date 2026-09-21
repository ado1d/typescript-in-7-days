"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Loader2,
  TriangleAlert,
  Terminal,
  FileCode2,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { playgroundExamples, defaultPlaygroundCode } from "@/lib/curriculum/examples";
import { highlightCode } from "./code-block";
import { useIsClient } from "@/hooks/use-is-client";

interface DiagnosticItem {
  line: number;
  character: number;
  message: string;
  category: "error" | "warning";
}

interface CheckResponse {
  diagnostics: DiagnosticItem[];
  js: string;
  logs: string[];
  runtimeError: string | null;
  compileMs?: number;
}

const EDITOR_METRICS =
  "font-mono text-[13px] leading-[1.65] tracking-normal whitespace-pre";

export function Playground() {
  const [code, setCode] = useState(defaultPlaygroundCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [activeErrorLine, setActiveErrorLine] = useState<number | null>(null);
  const mounted = useIsClient();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);

  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const html = useMemo(
    () => (mounted ? highlightCode(code, "typescript") : null),
    [code, mounted]
  );

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setActiveErrorLine(null);
    try {
      const res = await fetch("/api/ts-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setResult({
          diagnostics: [
            {
              line: 1,
              character: 1,
              message: `The compiler service failed (HTTP ${res.status}). Check your code for extremely long lines or unusual syntax and try again.`,
              category: "error",
            },
          ],
          js: "",
          logs: [],
          runtimeError: null,
        });
        return;
      }
      const data = (await res.json()) as CheckResponse;
      setResult(data);
    } catch {
      setResult({
        diagnostics: [
          {
            line: 1,
            character: 1,
            message: "Could not reach the compiler service. Check your connection and try again.",
            category: "error",
          },
        ],
        js: "",
        logs: [],
        runtimeError: null,
      });
    } finally {
      setRunning(false);
    }
  }, [code, running]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd } = ta;
      const next = code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 2;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void run();
    }
  };

  const loadExample = (exampleId: string) => {
    if (exampleId === "default") {
      setCode(defaultPlaygroundCode);
    } else {
      const example = playgroundExamples.find((e) => e.id === exampleId);
      if (example) setCode(example.code);
    }
    setResult(null);
    setActiveErrorLine(null);
  };

  const errorCount = result?.diagnostics.filter((d) => d.category === "error").length ?? 0;
  const warningCount = result?.diagnostics.filter((d) => d.category === "warning").length ?? 0;

  const jumpToLine = (line: number) => {
    setActiveErrorLine(line);
    const ta = textareaRef.current;
    if (ta) {
      // scroll textarea so that the line is visible (approximate line height 21.45px)
      const lineHeight = 13 * 1.65;
      ta.scrollTop = Math.max(0, (line - 3) * lineHeight);
      syncScroll();
      ta.focus();
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Editor */}
      <div className="overflow-hidden rounded-xl border border-zinc-700/70 bg-zinc-950 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/70 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </span>
          <span className="font-mono text-xs font-medium text-emerald-500">playground.ts</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-[180px] sm:w-[230px]">
              <Select onValueChange={loadExample}>
                <SelectTrigger className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-300">
                  <SelectValue placeholder="Load an example" />
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="default" className="text-xs">
                    Default tour — start here
                  </SelectItem>
                  {playgroundExamples.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id} className="text-xs">
                      Day {ex.day} · {ex.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={() => void run()}
              disabled={running}
              className="h-8 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Run
            </Button>
          </div>
        </div>

        <div className="relative h-[420px] sm:h-[520px] overflow-hidden">
          <div className="absolute inset-0 flex">
            <pre
              ref={gutterRef}
              aria-hidden="true"
              className={cn(
                EDITOR_METRICS,
                "code-gutter w-11 shrink-0 overflow-hidden border-r border-zinc-800/60 bg-zinc-900/40 py-4 text-right text-zinc-600 select-none"
              )}
            >
              {Array.from({ length: lineCount }, (_, i) => `${i + 1}`).join("\n")}
            </pre>
            <div className="relative min-w-0 flex-1">
              <pre
                ref={preRef}
                aria-hidden="true"
                className={cn(
                  EDITOR_METRICS,
                  "pointer-events-none absolute inset-0 overflow-hidden px-4 py-4 text-zinc-200"
                )}
              >
                <code
                  className="block"
                  dangerouslySetInnerHTML={{ __html: html ?? escapeForFallback(code) }}
                />
              </pre>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="TypeScript code editor"
                className={cn(
                  EDITOR_METRICS,
                  "absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-4 py-4 text-transparent caret-emerald-400 outline-none"
                )}
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5">
          <p className="font-mono text-[10px] text-zinc-500">
            {lineCount} lines · Ctrl/Cmd+Enter to run · Tab indents 2 spaces
          </p>
          <p className="hidden font-mono text-[10px] text-zinc-500 sm:block">
            checked by a real tsc on the server
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-700/70 bg-zinc-950 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/70 px-3 py-2">
          <ListChecks className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <span className="font-mono text-xs font-medium text-zinc-300">compiler output</span>
          {result && (
            <span className="ml-auto flex items-center gap-2 font-mono text-[10px]">
              {errorCount > 0 && (
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-400">
                  {errorCount} error{errorCount > 1 ? "s" : ""}
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-400">
                  {warningCount} warning{warningCount > 1 ? "s" : ""}
                </span>
              )}
              {errorCount === 0 && warningCount === 0 && result.logs.length > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-400">
                  clean · ran successfully
                </span>
              )}
              {errorCount === 0 && warningCount === 0 && result.logs.length === 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-400">
                  clean
                </span>
              )}
            </span>
          )}
        </div>

        {!result ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Terminal className="h-10 w-10 text-zinc-700" aria-hidden="true" />
            </motion.div>
            <p className="max-w-xs text-sm text-zinc-400">
              Press <span className="font-semibold text-emerald-400">Run</span> to compile and
              execute this code with a real TypeScript compiler — errors, emitted JavaScript, and
              console output appear here.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="errors" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-3 my-2 grid w-auto grid-cols-3 bg-zinc-900">
              <TabsTrigger value="errors" className="text-xs text-zinc-400 data-[state=active]:text-zinc-100">
                Errors
              </TabsTrigger>
              <TabsTrigger value="console" className="text-xs text-zinc-400 data-[state=active]:text-zinc-100">
                Console
              </TabsTrigger>
              <TabsTrigger value="js" className="text-xs text-zinc-400 data-[state=active]:text-zinc-100">
                JS output
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {result.diagnostics.length === 0 ? (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
                  No type errors — the compiler is happy. Check the Console tab for your program's
                  output.
                </p>
              ) : (
                <ul className="space-y-2">
                  {result.diagnostics.map((d, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => jumpToLine(d.line)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                          d.category === "error"
                            ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                            : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                        )}
                      >
                        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold">
                          <TriangleAlert
                            className={cn(
                              "h-3 w-3",
                              d.category === "error" ? "text-rose-500" : "text-amber-500"
                            )}
                            aria-hidden="true"
                          />
                          <span className={d.category === "error" ? "text-rose-400" : "text-amber-400"}>
                            TS{d.category === "error" ? " error" : " warning"}
                          </span>
                          <span className="text-zinc-500">
                            line {d.line}, col {d.character}
                          </span>
                          <span className="ml-auto text-zinc-600">click to jump</span>
                        </p>
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
                          {d.message}
                        </pre>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="console" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {result.runtimeError ? (
                <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2.5 font-mono text-xs leading-relaxed text-rose-400">
                  {result.runtimeError}
                </pre>
              ) : result.logs.length === 0 ? (
                <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 font-mono text-xs text-zinc-500">
                  (no output — add a console.log() and run again)
                </p>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  {result.logs.map((line, i) => (
                    <pre
                      key={i}
                      className="whitespace-pre-wrap border-b border-zinc-800/50 py-1 font-mono text-xs leading-relaxed text-zinc-300 last:border-0"
                    >
                      <span className="mr-2 select-none text-zinc-600" aria-hidden="true">
                        {">"}
                      </span>
                      {line}
                    </pre>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="js" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              <p className="mb-2 font-mono text-[10px] text-zinc-500">
                compiled with tsc (target ES2020, module CommonJS) — this is what actually runs
              </p>
              <pre className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-400">
                {result.js || "(nothing emitted — fix the syntax errors first)"}
              </pre>
            </TabsContent>
          </Tabs>
        )}

        <div className="border-t border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <FileCode2 className="h-3 w-3" aria-hidden="true" />
            types erased in output · strict mode on · no network access at runtime
          </p>
        </div>
      </div>
    </div>
  );
}

function escapeForFallback(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
