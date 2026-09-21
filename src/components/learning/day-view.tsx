"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Target,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  TriangleAlert,
  Info,
  BadgeCheck,
  KeyRound,
  Dumbbell,
  Check,
  ListChecks,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { curriculum } from "@/lib/curriculum";
import type { Day } from "@/lib/curriculum/types";
import type { QuizScore } from "@/lib/progress";
import { renderRichText } from "@/lib/rich-text";
import { ExampleBlock } from "./code-block";
import { Quiz } from "./quiz";
import { CodeBlock } from "./code-block";

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    wrapper: "border-amber-500/30 bg-amber-500/5",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
  },
  warning: {
    icon: TriangleAlert,
    wrapper: "border-rose-500/30 bg-rose-500/5",
    iconColor: "text-rose-600 dark:text-rose-400",
    title: "text-rose-700 dark:text-rose-300",
  },
  info: {
    icon: Info,
    wrapper: "border-primary/30 bg-primary/5",
    iconColor: "text-primary",
    title: "text-foreground",
  },
  interview: {
    icon: BadgeCheck,
    wrapper: "border-emerald-500/30 bg-emerald-500/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
  },
} as const;

interface DayViewProps {
  day: Day;
  completed: boolean;
  quizScore?: QuizScore;
  onToggleComplete: (dayId: number) => void;
  onRecordQuiz: (dayId: number, score: QuizScore) => void;
  onNavigateDay: (dayId: number) => void;
}

export function DayView({
  day,
  completed,
  quizScore,
  onToggleComplete,
  onRecordQuiz,
  onNavigateDay,
}: DayViewProps) {
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(day.sections[0]?.id ?? "");

  const totalSectionMinutes = day.sections.reduce((sum, s) => sum + s.minutes, 0);
  const prevDay = curriculum.find((d) => d.id === day.id - 1);
  const nextDay = curriculum.find((d) => d.id === day.id + 1);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Section nav (desktop) */}
        <aside className="hidden lg:block" aria-label="Lesson sections">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Day {day.id} · {day.sections.length} lessons
            </p>
            {day.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    activeSection === section.id ? "bg-emerald-500" : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
                <span className="line-clamp-2 leading-snug">{section.title}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection("day-quiz")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ListChecks className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Quiz · {day.quiz.length} questions
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("day-practice")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Dumbbell className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Practice
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {/* Day header */}
          <header className="border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                Day {day.id}
              </Badge>
              <Badge variant="outline" className="gap-1.5 rounded-full font-normal text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {day.hours} · {totalSectionMinutes} min of lessons
              </Badge>
              {quizScore && (
                <Badge variant="outline" className="gap-1.5 rounded-full font-normal text-muted-foreground">
                  <ListChecks className="h-3 w-3" aria-hidden="true" />
                  Quiz best: {quizScore.correct}/{quizScore.total}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {day.title}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {day.subtitle}
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold">Goal: </span>
                {day.goal}
              </p>
            </div>
          </header>

          {/* Day intro */}
          <section className="mt-6 space-y-3">
            {day.intro.map((paragraph, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                {renderRichText(paragraph)}
              </p>
            ))}
          </section>

          {/* Lesson sections */}
          {day.sections.map((section, si) => (
            <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {section.title}
                  </h2>
                  <span className="ml-auto hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {section.minutes} min
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                      {renderRichText(paragraph)}
                    </p>
                  ))}
                </div>

                {section.examples.length > 0 && (
                  <div className="mt-5 space-y-5">
                    {section.examples.map((example, i) => (
                      <ExampleBlock key={i} example={example} />
                    ))}
                  </div>
                )}

                {section.callouts && section.callouts.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {section.callouts.map((callout, i) => {
                      const config = calloutConfig[callout.kind];
                      const Icon = config.icon;
                      return (
                        <div key={i} className={cn("flex gap-3 rounded-lg border px-4 py-3", config.wrapper)}>
                          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.iconColor)} aria-hidden="true" />
                          <div>
                            <p className={cn("text-sm font-semibold", config.title)}>
                              {callout.title}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {renderRichText(callout.body)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="mt-5 rounded-xl border bg-muted/40 p-4 sm:p-5">
                    <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                      Key points
                    </p>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                            aria-hidden="true"
                          />
                          {renderRichText(point)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </section>
          ))}

          {/* Quiz */}
          <section id="day-quiz" className="mt-14 scroll-mt-24">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {String(day.sections.length + 1).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Check yourself — Day {day.id} quiz
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Five questions on today's material. Answer, read the explanation, and let the wrong
              ones tell you which section to reread.
            </p>
            <div className="mt-5">
              <Quiz dayId={day.id} questions={day.quiz} onComplete={(score) => onRecordQuiz(day.id, score)} />
            </div>
          </section>

          {/* Practice */}
          <section id="day-practice" className="mt-14 scroll-mt-24">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {String(day.sections.length + 2).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Practice — type it by hand
              </h2>
            </div>
            <div className="mt-4 rounded-xl border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {day.practice.intro}
                </p>
              </div>
              <ol className="mt-4 space-y-2.5">
                {day.practice.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{renderRichText(step)}</span>
                  </li>
                ))}
              </ol>

              {day.practice.starter && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Starter code — paste into the Playground
                  </p>
                  <CodeBlock code={day.practice.starter} variant="neutral" title={`day${day.id}-starter.ts`} />
                </div>
              )}

              {day.practice.solution && (
                <div className="mt-4">
                  <Collapsible open={solutionOpen} onOpenChange={setSolutionOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "gap-2",
                          solutionOpen && "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                        )}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {solutionOpen ? (
                            <motion.span
                              key="hide"
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 180 }}
                              className="flex"
                            >
                              <ArrowDown className="h-4 w-4" aria-hidden="true" />
                            </motion.span>
                          ) : (
                            <motion.span key="show" className="flex">
                              <ArrowDown className="h-4 w-4" aria-hidden="true" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {solutionOpen ? "Hide solution" : "Try first, then reveal the solution"}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <CodeBlock
                        code={day.practice.solution}
                        variant="good"
                        title={`day${day.id}-solution.ts`}
                        showLineNumbers
                      />
                      {day.practice.solutionNote && (
                        <p className="mt-2 px-1 text-xs leading-relaxed text-muted-foreground">
                          {renderRichText(day.practice.solutionNote)}
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
          </section>

          {/* Day footer: complete + prev/next */}
          <footer className="mt-12 border-t border-border pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={() => onToggleComplete(day.id)}
                variant={completed ? "default" : "outline"}
                className={cn(
                  "h-11 gap-2 px-5",
                  completed && "bg-emerald-600 text-white hover:bg-emerald-500"
                )}
                aria-pressed={completed}
              >
                <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                {completed ? "Day complete — nice work" : `Mark Day ${day.id} complete`}
              </Button>
              <div className="flex items-center gap-2">
                {prevDay && (
                  <Button variant="ghost" onClick={() => onNavigateDay(prevDay.id)} className="gap-1.5">
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Day {prevDay.id}
                  </Button>
                )}
                {nextDay && (
                  <Button
                    onClick={() => onNavigateDay(nextDay.id)}
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Day {nextDay.id}: {nextDay.title}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {!nextDay && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Finish line — go crush the interview tab
                  </Button>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
