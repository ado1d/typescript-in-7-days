"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/curriculum/types";

interface QuizProps {
  dayId: number;
  questions: QuizQuestion[];
  onComplete?: (score: { correct: number; total: number }) => void;
}

export function Quiz({ dayId, questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const answeredCount = Object.keys(answered).length;
  const correctCount = useMemo(
    () =>
      questions.reduce(
        (sum, q) => sum + (answered[q.id] && answers[q.id] === q.answerIndex ? 1 : 0),
        0
      ),
    [questions, answers, answered]
  );

  const pick = (question: QuizQuestion, index: number) => {
    if (answered[question.id]) return;
    const nextAnswers = { ...answers, [question.id]: index };
    const nextAnswered = { ...answered, [question.id]: true };
    setAnswers(nextAnswers);
    setAnswered(nextAnswered);
    if (Object.keys(nextAnswered).length === questions.length) {
      setFinished(true);
    }
  };

  const reset = () => {
    setAnswers({});
    setAnswered({});
    setFinished(false);
  };

  useEffect(() => {
    if (finished && onComplete) {
      onComplete({ correct: correctCount, total: questions.length });
    }
  }, [finished]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {answeredCount}/{questions.length} answered
          {answeredCount > 0 && (
            <span className="ml-2 font-medium text-foreground">
              · {correctCount} correct
            </span>
          )}
        </p>
        {answeredCount > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset quiz
          </Button>
        )}
      </div>

      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        const isAnswered = answered[q.id] ?? false;
        const isCorrect = isAnswered && chosen === q.answerIndex;
        return (
          <div
            key={q.id}
            className="rounded-xl border bg-card p-4 sm:p-5"
            aria-label={`Question ${qi + 1}`}
          >
            <p className="mb-3 flex items-start gap-2.5 text-sm font-medium leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] text-primary">
                {qi + 1}
              </span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oi) => {
                const isChosen = chosen === oi;
                const isRight = q.answerIndex === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(q, oi)}
                    disabled={isAnswered}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors",
                      !isAnswered && "hover:border-primary/40 hover:bg-primary/5",
                      !isAnswered && isChosen === undefined && "border-border",
                      isAnswered && isRight && "border-emerald-500/50 bg-emerald-500/10",
                      isAnswered && !isRight && isChosen && "border-rose-500/50 bg-rose-500/10",
                      isAnswered && !isRight && !isChosen && "border-border opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                        isAnswered && isRight && "border-emerald-500 text-emerald-600 dark:text-emerald-400",
                        isAnswered && isChosen && !isRight && "border-rose-500 text-rose-600 dark:text-rose-400",
                        !(isAnswered && (isRight || isChosen)) && "border-muted-foreground/40"
                      )}
                      aria-hidden="true"
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isAnswered && isRight && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    )}
                    {isAnswered && isChosen && !isRight && (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "mt-3 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
                      isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    <span className="font-semibold">
                      {isCorrect ? "Correct. " : "Not quite. "}
                    </span>
                    {q.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4",
              correctCount === questions.length
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-primary/30 bg-primary/5"
            )}
            role="status"
          >
            <Trophy
              className={cn(
                "h-6 w-6 shrink-0",
                correctCount === questions.length ? "text-emerald-500" : "text-primary"
              )}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                Day {dayId} quiz: {correctCount}/{questions.length} correct
              </p>
              <p className="text-xs text-muted-foreground">
                {correctCount === questions.length
                  ? "Perfect — this day's concepts are locked in. Mark the day complete and move on."
                  : "Missed ones are your review list — reread the matching section above, then reset and retry."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
