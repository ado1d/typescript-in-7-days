"use client";

import { motion } from "framer-motion";
import {
  TerminalSquare,
  Braces,
  GitBranch,
  Boxes,
  WandSparkles,
  FolderTree,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  Keyboard,
  Compass,
  BookOpen,
  ShieldAlert,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { curriculum, courseStats, interviewQuestions } from "@/lib/curriculum";
import type { ProgressState } from "@/lib/progress";

const dayIconMap = {
  setup: TerminalSquare,
  braces: Braces,
  gitbranch: GitBranch,
  boxes: Boxes,
  wand: WandSparkles,
  layers: FolderTree,
  target: Target,
} as const;

const features = [
  {
    icon: Keyboard,
    title: "Type, break, fix",
    body: "Every lesson pairs compilable examples with deliberately broken ones. You learn by reading real tsc errors — exactly the plan's method.",
  },
  {
    icon: Compass,
    title: "The full 7-day path",
    body: "Setup, types, interfaces, narrowing, generics, utilities, classes, and interview prep — every bullet from the plan expanded into lessons.",
  },
  {
    icon: BookOpen,
    title: "15 interview questions",
    body: "Model answers in the 2-3 sentence format, with code and gotchas. Study mode: attempt out loud, then reveal.",
  },
  {
    icon: ShieldAlert,
    title: "A real compiler playground",
    body: "The playground type-checks your code with actual tsc on the server, shows the emitted JavaScript, and runs your console output.",
  },
];

const tips = [
  {
    icon: Keyboard,
    title: "Type everything by hand",
    body: "Reading is not learning. Copy nothing — retype every example, then break it on purpose and fix the red squiggles. That struggle is where the learning happens.",
  },
  {
    icon: Clock,
    title: "2–3 hours a day is enough",
    body: "The plan is calibrated for a week of evenings. Consistency beats marathons: 20 minutes of typing code beats 3 hours of reading docs.",
  },
  {
    icon: ShieldAlert,
    title: "Skip the advanced rabbit hole",
    body: "Complex conditional types, template literal types, decorators — they rarely appear in basic interviews. Recognize them; do not master them.",
  },
  {
    icon: ExternalLink,
    title: "Free resources",
    body: "The official TypeScript Handbook (typescriptlang.org/docs), Matt Pocock's free tutorials (totaltypescript.com), and the Playground (typescriptlang.org/play).",
  },
];

interface HomeViewProps {
  progress: ProgressState;
  ready: boolean;
  onStartDay: (dayId: number) => void;
  onOpenView: (view: "playground" | "interview" | "cheatsheet") => void;
}

export function HomeView({ progress, ready, onStartDay, onOpenView }: HomeViewProps) {
  const completedCount = ready ? progress.completedDays.length : 0;
  const overallPercent = Math.round((completedCount / curriculum.length) * 100);
  const nextDay = curriculum.find((d) => !progress.completedDays.includes(d.id)) ?? curriculum[0];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      {/* Hero */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4 gap-1.5 rounded-full px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            7 days · 2–3 hours a day · assumes basic JavaScript
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Learn <span className="text-emerald-600 dark:text-emerald-400">TypeScript</span> in
            7 Days
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A complete, self-contained course: every concept from the plan expanded into lessons
            with good code, deliberately broken code, quizzes, and a live compiler playground.
            Learn just by browsing — no setup required to start.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => onStartDay(nextDay.id)}
              className="h-11 gap-2 bg-emerald-600 px-6 text-white hover:bg-emerald-500"
            >
              {completedCount === 0 ? "Start Day 1" : `Continue with Day ${nextDay.id}`}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenView("playground")}
              className="h-11 gap-2 px-6"
            >
              Try the playground
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {courseStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card px-3 py-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Progress */}
      {ready && completedCount > 0 && (
        <section className="mt-12" aria-label="Your progress">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Your progress</span>
                  <span className="text-muted-foreground">
                    {completedCount}/{curriculum.length} days · {overallPercent}%
                  </span>
                </div>
                <Progress value={overallPercent} className="h-2" />
              </div>
              <Button
                onClick={() => onOpenView("interview")}
                variant="outline"
                className="gap-2"
              >
                <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Interview prep
                <span className="text-muted-foreground">
                  {interviewQuestions.length} Qs
                </span>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Roadmap */}
      <section className="mt-14" aria-label="The 7-day roadmap">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">The roadmap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each day: lessons → code you can break → quiz → practice exercise.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {curriculum.map((day, i) => {
            const Icon = dayIconMap[day.icon];
            const complete = ready && progress.completedDays.includes(day.id);
            return (
              <motion.button
                key={day.id}
                type="button"
                onClick={() => onStartDay(day.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-all hover:border-emerald-500/50 hover:shadow-md",
                  complete && "border-emerald-500/40"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                      complete
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        DAY {day.id}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {day.hours}
                      </span>
                      {complete && (
                        <CheckCircle2
                          className="ml-auto h-4 w-4 shrink-0 text-emerald-500"
                          aria-label="Completed"
                        />
                      )}
                    </div>
                    <h3 className="mt-1 font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {day.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {day.subtitle}
                    </p>
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      {day.sections.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {s.title.split(":")[0]}
                        </span>
                      ))}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        +{day.sections.length - 3 > 0 ? day.sections.length - 3 : 0} more
                      </span>
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* What's inside */}
      <section className="mt-14" aria-label="What is inside">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">What is inside</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="border-border/70">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-14" aria-label="Survival tips">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The plan's survival tips
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <tip.icon
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <h3 className="font-semibold text-foreground">{tip.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
