"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
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
import { useT, useLocalizedExamples } from "@/lib/i18n";
import type { TsEditorApi } from "./ts-editor";

const TsEditor = dynamic(() => import("./ts-editor").then((m) => m.TsEditor), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-950/60" />,
});

/* ---- user-resizable editor height (persisted) ---- */
const EDITOR_H_KEY = "ts7-editor-height-v1";
const EDITOR_H_MIN = 320;

function clampEditorHeight(h: number): number {
  const max = Math.max(EDITOR_H_MIN, Math.floor(window.innerHeight * 0.85));
  return Math.min(Math.max(Math.round(h), EDITOR_H_MIN), max);
}

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

export function Playground() {
  const { lang, t } = useT();
  const localizedExamples = useLocalizedExamples();
  const bn = lang === "bn";
  const bengaliClass = bn ? "font-bengali" : undefined;
  const [code, setCode] = useState(defaultPlaygroundCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [activeErrorLine, setActiveErrorLine] = useState<number | null>(null);

  const editorApi = useRef<TsEditorApi | null>(null);

  const [editorHeight, setEditorHeight] = useState<number | null>(null);
  const editorWrapRef = useRef<HTMLDivElement | null>(null);
  const editorHRef = useRef<number | null>(null);
  const editorDragRef = useRef<{ y: number; h: number } | null>(null);

  /* hydrate saved editor height once, clamped to the current viewport */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(EDITOR_H_KEY);
        if (raw) {
          const n = Number(raw);
          if (Number.isFinite(n) && n >= EDITOR_H_MIN) {
            const clamped = clampEditorHeight(n);
            editorHRef.current = clamped;
            setEditorHeight(clamped);
          }
        }
      } catch {
        // storage unavailable — keep the default height
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const saveEditorHeight = (h: number | null) => {
    editorHRef.current = h;
    try {
      if (h == null) window.localStorage.removeItem(EDITOR_H_KEY);
      else window.localStorage.setItem(EDITOR_H_KEY, String(h));
    } catch {
      // ignore storage failures
    }
  };

  const onEditorResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = editorWrapRef.current;
    if (!el) return;
    editorDragRef.current = { y: e.clientY, h: el.getBoundingClientRect().height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onEditorResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorDragRef.current) return;
    const dy = e.clientY - editorDragRef.current.y;
    const next = clampEditorHeight(editorDragRef.current.h + dy);
    editorHRef.current = next;
    setEditorHeight(next);
  };

  const onEditorResizeEnd = () => {
    if (!editorDragRef.current) return;
    editorDragRef.current = null;
    try {
      if (editorHRef.current == null) window.localStorage.removeItem(EDITOR_H_KEY);
      else window.localStorage.setItem(EDITOR_H_KEY, String(editorHRef.current));
    } catch {
      // ignore storage failures
    }
  };

  const resetEditorHeight = () => {
    editorDragRef.current = null;
    saveEditorHeight(null);
    setEditorHeight(null);
  };

  const onEditorResizeKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const base =
      editorHeight ??
      (editorWrapRef.current ? editorWrapRef.current.getBoundingClientRect().height : 420);
    const next = clampEditorHeight(base + (e.key === "ArrowUp" ? 60 : -60));
    saveEditorHeight(next);
    setEditorHeight(next);
  };

  const lineCount = useMemo(() => code.split("\n").length, [code]);

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
      const first =
        data.diagnostics.find((d) => d.category === "error") ?? data.diagnostics[0] ?? null;
      setActiveErrorLine(first ? first.line : null);
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

  const loadExample = (exampleId: string) => {
    if (exampleId === "default") {
      setCode(defaultPlaygroundCode);
    } else {
      const example = localizedExamples.find((e) => e.id === exampleId);
      if (example) setCode(example.code);
    }
    setResult(null);
    setActiveErrorLine(null);
  };

  const errorCount = result?.diagnostics.filter((d) => d.category === "error").length ?? 0;
  const warningCount = result?.diagnostics.filter((d) => d.category === "warning").length ?? 0;

  const jumpToLine = (line: number) => {
    setActiveErrorLine(line);
    editorApi.current?.jumpToLine(line);
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
                  <SelectValue placeholder={t.playground.loadExample} />
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="default" className={cn("text-xs", bengaliClass)}>
                    {bn ? "ডিফল্ট ট্যুর — এখান থেকে শুরু" : "Default tour — start here"}
                  </SelectItem>
                  {localizedExamples.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id} className={cn("text-xs", bengaliClass)}>
                      {bn ? "দিন" : "Day"} {ex.day} · {ex.title}
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
              <span className={bengaliClass}>{running ? t.playground.running : t.playground.run}</span>
            </Button>
          </div>
        </div>

        <div
          ref={editorWrapRef}
          className="h-[420px] sm:h-[520px]"
          style={editorHeight ? { height: editorHeight } : undefined}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void run();
            }
          }}
        >
          <TsEditor
            value={code}
            onChange={setCode}
            errorLine={activeErrorLine}
            onReady={(api) => {
              editorApi.current = api;
            }}
          />
        </div>

        {/* Drag handle — resize the editor vertically */}
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label={t.playground.resizeEditor}
          title={t.playground.resizeEditorHint}
          tabIndex={0}
          onPointerDown={onEditorResizeStart}
          onPointerMove={onEditorResizeMove}
          onPointerUp={onEditorResizeEnd}
          onLostPointerCapture={onEditorResizeEnd}
          onDoubleClick={resetEditorHeight}
          onKeyDown={onEditorResizeKey}
          className="group flex h-4 cursor-ns-resize touch-none select-none items-center justify-center border-t border-zinc-800/80 bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-emerald-500/60"
        >
          <span
            className="h-[3px] w-12 rounded-full bg-zinc-700 transition-colors group-hover:bg-emerald-500/70"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5">
          <p className={cn("font-mono text-[10px] text-zinc-500", bengaliClass)}>
            {t.playground.meta(lineCount)}
          </p>
          <p className={cn("hidden font-mono text-[10px] text-zinc-500 sm:block", bengaliClass)}>
            {t.playground.editorHint}
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
            <p className={cn("max-w-xs text-sm text-zinc-400", bengaliClass)}>
              {t.playground.press}{" "}
              <span className="font-semibold text-emerald-400">{t.playground.pressRun}</span>{" "}
              {t.playground.pressTo}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="errors" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-3 my-2 grid w-auto grid-cols-3 bg-zinc-900">
              <TabsTrigger value="errors" className={cn("text-xs text-zinc-400 data-[state=active]:text-zinc-100", bengaliClass)}>
                {t.playground.tabErrors}
              </TabsTrigger>
              <TabsTrigger value="console" className={cn("text-xs text-zinc-400 data-[state=active]:text-zinc-100", bengaliClass)}>
                {t.playground.tabConsole}
              </TabsTrigger>
              <TabsTrigger value="js" className={cn("text-xs text-zinc-400 data-[state=active]:text-zinc-100", bengaliClass)}>
                {t.playground.tabJs}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {result.diagnostics.length === 0 ? (
                <p className={cn("rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400", bengaliClass)}>
                  {t.playground.noErrors}
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
                            {d.category === "error" ? t.playground.tsError : "TS warning"}
                          </span>
                          <span className={cn("text-zinc-500", bengaliClass)}>
                            {t.playground.lineCol(d.line, d.character)}
                          </span>
                          <span className={cn("ml-auto text-zinc-600", bengaliClass)}>{t.playground.clickToJump}</span>
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
                <p className={cn("rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 font-mono text-xs text-zinc-500", bengaliClass)}>
                  {t.playground.emptyConsole}
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
              <p className={cn("mb-2 font-mono text-[10px] text-zinc-500", bengaliClass)}>
                {bn
                  ? "tsc দিয়ে কম্পাইল হয়েছে (target ES2020, module CommonJS) — আসলে এটাই চলে"
                  : "compiled with tsc (target ES2020, module CommonJS) — this is what actually runs"}
              </p>
              <pre className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-400">
                {result.js || (bn ? "(কিছু বানানো হয়নি — আগে সিনট্যাক্স এররগুলো ঠিক করুন)" : "(nothing emitted — fix the syntax errors first)")}
              </pre>
            </TabsContent>
          </Tabs>
        )}

        <div className="border-t border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5">
          <p className={cn("flex items-center gap-1.5 font-mono text-[10px] text-zinc-500", bengaliClass)}>
            <FileCode2 className="h-3 w-3" aria-hidden="true" />
            {bn
              ? "আউটপুটে টাইপ মুছে যায় · strict মোড চালু · রানটাইমে নেটওয়ার্ক নেই"
              : "types erased in output · strict mode on · no network access at runtime"}
          </p>
        </div>
      </div>
    </div>
  );
}
