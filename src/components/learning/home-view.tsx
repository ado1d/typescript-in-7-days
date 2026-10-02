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
  Sparkles,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { curriculum, totalSections, totalCodeExamples, totalQuizQuestions } from "@/lib/curriculum";
import { useT, useLocalizedCurriculum } from "@/lib/i18n";
import type { ProgressState } from "@/lib/progress";

const featureIcons = [Keyboard, Compass, BookOpen, ShieldAlert, Sparkles, Languages];

const dayIconMap = {
  setup: TerminalSquare,
  braces: Braces,
  gitbranch: GitBranch,
  boxes: Boxes,
  wand: WandSparkles,
  layers: FolderTree,
  target: Target,
} as const;

interface HomeViewProps {
  progress: ProgressState;
  ready: boolean;
  onStartDay: (dayId: number) => void;
  onOpenView: (view: "playground" | "interview" | "cheatsheet") => void;
}

export function HomeView({ progress, ready, onStartDay, onOpenView }: HomeViewProps) {
  const { lang, t } = useT();
  const localized = useLocalizedCurriculum();

  const completedCount = ready ? progress.completedDays.length : 0;
  const overallPercent = Math.round((completedCount / curriculum.length) * 100);
  const nextDay = localized.find((d) => !progress.completedDays.includes(d.id)) ?? localized[0];

  const bn = lang === "bn";
  const bengaliClass = bn ? "font-bengali" : undefined;

  const features = t.homeFeatures.map((f, i) => ({ ...f, icon: featureIcons[i] ?? Keyboard }));
  const tips = t.homeTips.map((tip, i) => ({ ...tip, icon: [Keyboard, Clock, ShieldAlert, ExternalLink][i] ?? Keyboard }));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      {/* Hero */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className={cn("mb-4 gap-1.5 rounded-full px-3 py-1 text-xs", bengaliClass)}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {t.home.badge}
          </Badge>
          <h1 className={cn("mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl", bengaliClass)}>
            {t.home.titleA}{" "}
            <span className="text-emerald-600 dark:text-emerald-400">{t.home.titleB}</span>{" "}
            {t.home.titleC}
          </h1>
          <p className={cn("mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg", bengaliClass)}>
            {t.home.body}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => onStartDay(nextDay.id)}
              className={cn("h-11 gap-2 bg-emerald-600 px-6 text-white hover:bg-emerald-500", bengaliClass)}
            >
              {completedCount === 0 ? t.home.start : t.home.continue(nextDay.id)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenView("playground")}
              className={cn("h-11 gap-2 px-6", bengaliClass)}
            >
              {t.home.tryPlayground}
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
          {[
            { label: bn ? "দিন" : "days", value: curriculum.length },
            { label: bn ? "পাঠ" : "lessons", value: totalSections },
            { label: bn ? "কোড উদাহরণ" : "code examples", value: totalCodeExamples },
            { label: bn ? "কুইজ প্রশ্ন" : "quiz questions", value: totalQuizQuestions },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn("rounded-xl border bg-card px-3 py-4 text-center", bengaliClass)}
            >
              <p className="text-2xl font-bold text-foreground">
                {bn ? String(stat.value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : stat.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Progress */}
      {ready && completedCount > 0 && (
        <section className="mt-12" aria-label={t.home.progress}>
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className={cn("mb-2 flex items-center justify-between text-sm", bengaliClass)}>
                  <span className="font-medium">{t.home.progress}</span>
                  <span className="text-muted-foreground">
                    {t.home.progressCount(completedCount, curriculum.length, overallPercent)}
                  </span>
                </div>
                <Progress value={overallPercent} className="h-2" />
              </div>
              <Button
                onClick={() => onOpenView("interview")}
                variant="outline"
                className={cn("gap-2", bengaliClass)}
              >
                <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                {t.home.interviewPrep}
                <span className="text-muted-foreground">{t.home.qs(15)}</span>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Roadmap */}
      <section className="mt-14" aria-label={t.home.roadmapTitle}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className={cn("text-2xl font-bold tracking-tight text-foreground", bengaliClass)}>
              {t.home.roadmapTitle}
            </h2>
            <p className={cn("mt-1 text-sm text-muted-foreground", bengaliClass)}>
              {t.home.roadmapSub}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {localized.map((day, i) => {
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
                      <span className={cn("font-mono text-xs font-semibold text-muted-foreground", bengaliClass)}>
                        {t.home.dayLabel(day.id)}
                      </span>
                      <span className={cn("flex items-center gap-1 text-xs text-muted-foreground", bengaliClass)}>
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {day.hours}
                      </span>
                      {complete && (
                        <CheckCircle2
                          className="ml-auto h-4 w-4 shrink-0 text-emerald-500"
                          aria-label={t.home.completed}
                        />
                      )}
                    </div>
                    <h3 className={cn("mt-1 font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400", bengaliClass)}>
                      {day.title}
                    </h3>
                    <p className={cn("mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground", bengaliClass)}>
                      {day.subtitle}
                    </p>
                    <p className={cn("mt-3 flex flex-wrap gap-1.5", bengaliClass)}>
                      {day.sections.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {s.title.split(":")[0]}
                        </span>
                      ))}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t.home.more(Math.max(day.sections.length - 3, 0))}
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
      <section className="mt-14" aria-label={t.home.insideTitle}>
        <h2 className={cn("text-2xl font-bold tracking-tight text-foreground", bengaliClass)}>
          {t.home.insideTitle}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="border-border/70">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-foreground", bengaliClass)}>{f.title}</h3>
                  <p className={cn("mt-1 text-sm leading-relaxed text-muted-foreground", bengaliClass)}>
                    {f.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-14" aria-label={t.home.tipsTitle}>
        <h2 className={cn("text-2xl font-bold tracking-tight text-foreground", bengaliClass)}>
          {t.home.tipsTitle}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <tip.icon
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <h3 className={cn("font-semibold text-foreground", bengaliClass)}>{tip.title}</h3>
              </div>
              <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", bengaliClass)}>
                {tip.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
