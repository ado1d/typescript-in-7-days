"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, Mic, MessageSquareQuote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { interviewCategories } from "@/lib/curriculum";
import { useT, useLocalizedInterview } from "@/lib/i18n";
import { interviewCategoriesBn } from "@/lib/i18n/bn/interview";
import { renderRichText } from "@/lib/rich-text";
import { CodeBlock } from "./code-block";

export function InterviewView() {
  const { lang, t } = useT();
  const questions = useLocalizedInterview();
  const bn = lang === "bn";
  const bengaliClass = bn ? "font-bengali" : undefined;
  const [category, setCategory] = useState("All");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      category === "All"
        ? questions
        : questions.filter((q) => q.category === category),
    [category, questions]
  );

  const revealedCount = Object.values(revealed).filter(Boolean).length;

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    questions.forEach((q) => (all[q.id] = true));
    setRevealed((prev) => ({ ...prev, ...all }));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      <header>
        <Badge variant="secondary" className={cn("gap-1.5 rounded-full px-3 py-1 text-xs", bengaliClass)}>
          <Mic className="h-3 w-3" aria-hidden="true" />
          {t.interview.badge}
        </Badge>
        <h1 className={cn("mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl", bengaliClass)}>
          {t.interview.title(questions.length)}
        </h1>
        <p className={cn("mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground", bengaliClass)}>
          {t.interview.introA}{" "}
          <span className="font-semibold text-foreground">{t.interview.introB}</span>{" "}
          {t.interview.introC}
        </p>
      </header>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {interviewCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              category === cat
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-border text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
            )}
            aria-pressed={category === cat}
          >
            <span className={bengaliClass}>{bn ? (interviewCategoriesBn[cat] ?? cat) : cat}</span>
            {cat !== "All" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {questions.filter((q) => q.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <p className={cn("text-xs text-muted-foreground", bengaliClass)}>
          {t.interview.revealed(revealedCount, filtered.length, questions.length)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={revealAll}
          className={cn("h-8 gap-1.5 text-xs", bengaliClass)}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {t.interview.revealAll}
        </Button>
      </div>

      {/* Questions */}
      <div className="mt-6 space-y-4">
        {filtered.map((q, i) => {
          const open = revealed[q.id] ?? false;
          return (
            <motion.article
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
              className={cn(
                "overflow-hidden rounded-xl border bg-card transition-colors",
                open ? "border-emerald-500/40" : "border-border"
              )}
            >
              <button
                type="button"
                onClick={() => toggleReveal(q.id)}
                className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
                aria-expanded={open}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {q.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className={cn("text-[15px] font-semibold leading-snug text-foreground", bengaliClass)}>
                    {q.question}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="outline" className={cn("h-5 rounded-full px-2 text-[10px] font-normal text-muted-foreground", bengaliClass)}>
                      {bn ? (interviewCategoriesBn[q.category] ?? q.category) : q.category}
                    </Badge>
                    <span className={cn("text-[11px] text-muted-foreground", bengaliClass)}>
                      {open ? t.interview.clickHide : t.interview.clickShow}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180 text-emerald-600 dark:text-emerald-400"
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
                      {/* Model answer */}
                      <div className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3.5">
                        <MessageSquareQuote
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                        <div>
                          <p className={cn("mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400", bengaliClass)}>
                            {t.interview.model}
                          </p>
                          <p className={cn("text-sm leading-relaxed text-foreground/90", bengaliClass)}>
                            {renderRichText(q.shortAnswer)}
                          </p>
                        </div>
                      </div>

                      {/* Deeper detail */}
                      {q.detail.length > 0 && (
                        <div className="space-y-2.5 px-1">
                          {q.detail.map((paragraph, j) => (
                            <p key={j} className={cn("text-sm leading-relaxed text-muted-foreground", bengaliClass)}>
                              {renderRichText(paragraph)}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Code */}
                      {q.code && (
                        <CodeBlock code={q.code} variant="neutral" title={t.interview.answerName(q.number)} />
                      )}

                      {/* Gotcha */}
                      {q.gotcha && (
                        <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                          <Sparkles
                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                            aria-hidden="true"
                          />
                          <p className={cn("text-sm leading-relaxed text-muted-foreground", bengaliClass)}>
                            {renderRichText(q.gotcha)}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
