"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Terminal, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeExample, CodeLanguage } from "@/lib/curriculum/types";
import { useIsClient } from "@/hooks/use-is-client";

// Prism core + languages (side-effect imports)
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

const prismLanguage: Record<CodeLanguage, string> = {
  typescript: "typescript",
  javascript: "javascript",
  bash: "bash",
  json: "json",
  tsx: "tsx",
  text: "none",
};

export function highlightCode(code: string, language: CodeLanguage): string {
  const lang = prismLanguage[language] ?? "typescript";
  const grammar = Prism.languages[lang];
  if (!grammar) return escapeHtml(code);
  try {
    return Prism.highlight(code, grammar, lang);
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const variantStyles = {
  good: { header: "text-emerald-500", border: "border-emerald-500/30", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "compiles" },
  bad: { header: "text-rose-500", border: "border-rose-500/30", badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400", label: "broken on purpose" },
  neutral: { header: "text-zinc-400", border: "border-zinc-700", badge: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400", label: "example" },
} as const;

interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  variant?: "good" | "bad" | "neutral";
  title?: string;
  className?: string;
  /** Show line-number gutter */
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  variant = "neutral",
  title,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const mounted = useIsClient();
  const [copied, setCopied] = useState(false);
  const styles = variantStyles[variant];

  const lineCount = useMemo(() => code.replace(/\n$/, "").split("\n").length, [code]);

  const html = useMemo(
    () => (mounted ? highlightCode(code.replace(/\n$/, ""), language) : escapeHtml(code.replace(/\n$/, ""))),
    [code, language, mounted]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-zinc-950 shadow-sm",
        styles.border,
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/70 px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className={cn("h-2.5 w-2.5 rounded-full", variant === "bad" ? "bg-rose-500/70" : variant === "good" ? "bg-emerald-500/70" : "bg-zinc-700")} />
        </span>
        {title ? (
          <span className={cn("truncate font-mono text-xs font-medium", styles.header)}>{title}</span>
        ) : (
          <span className="font-mono text-xs text-zinc-500">{language}</span>
        )}
        <span
          className={cn(
            "ml-auto hidden rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-block",
            styles.badge
          )}
        >
          {styles.label}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="relative overflow-x-auto code-scroll">
        <div className="flex">
          {showLineNumbers && (
            <pre
              aria-hidden="true"
              className="code-gutter select-none border-r border-zinc-800/60 bg-zinc-900/40 px-3 py-4 text-right font-mono text-[13px] leading-[1.65] text-zinc-600"
            >
              {Array.from({ length: lineCount }, (_, i) => `${i + 1}`).join("\n")}
            </pre>
          )}
          <pre className="min-w-0 flex-1 px-4 py-4 font-mono text-[13px] leading-[1.65] text-zinc-200">
            <code
              className="language-ts block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </pre>
        </div>
      </div>
    </figure>
  );
}

/** Renders a curriculum CodeExample with error / output annotations */
export function ExampleBlock({ example }: { example: CodeExample }) {
  const variant = example.variant ?? "neutral";
  return (
    <div className="space-y-2">
      <CodeBlock
        code={example.code}
        language={example.language ?? "typescript"}
        variant={variant}
        title={example.title}
        showLineNumbers={variant !== "neutral"}
      />
      {example.tsError && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2.5 font-mono text-xs leading-relaxed",
            "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          )}
        >
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" aria-hidden="true" />
          <pre className="min-w-0 whitespace-pre-wrap font-mono">{example.tsError}</pre>
        </div>
      )}
      {example.output && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2.5",
            "text-zinc-300 dark:bg-zinc-900"
          )}
        >
          <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          <pre className="min-w-0 whitespace-pre-wrap font-mono text-xs leading-relaxed">{example.output}</pre>
        </div>
      )}
      {example.caption && (
        <figcaption className="px-1 text-xs leading-relaxed text-muted-foreground">
          {example.caption.split("`").map((part, i) =>
            i % 2 === 1 ? (
              <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                {part}
              </code>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </figcaption>
      )}
    </div>
  );
}
