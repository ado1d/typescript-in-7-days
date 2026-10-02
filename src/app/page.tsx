"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  FlaskConical,
  MessageSquareQuote,
  BookMarked,
  Home,
  Moon,
  Sun,
  Braces,
  CheckCircle2,
  Menu,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { curriculum } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useIsClient } from "@/hooks/use-is-client";
import { useT, useLocalizedCurriculum, type Lang } from "@/lib/i18n";
import { HomeView } from "@/components/learning/home-view";
import { DayView } from "@/components/learning/day-view";
import { Playground } from "@/components/learning/playground";
import { InterviewView } from "@/components/learning/interview-view";
import { CheatsheetView } from "@/components/learning/cheatsheet-view";
import { AiAssistant } from "@/components/learning/ai-assistant";

type View = "home" | "day" | "playground" | "interview" | "cheatsheet";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-9 w-9 text-muted-foreground"
    >
      {isClient && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const next: Lang = lang === "bn" ? "en" : "bn";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label="Switch language"
      title={lang === "bn" ? "Switch to English" : "বাংলায় চালান"}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors",
        lang === "bn"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className={lang === "bn" ? "font-bengali" : undefined}>
        {lang === "bn" ? "বাং" : "EN"}
      </span>
    </button>
  );
}

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [currentDay, setCurrentDay] = useState(1);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { progress, ready, toggleDayComplete, recordQuiz, trackVisit } = useProgress();
  const { lang, t, setLang } = useT();
  const localized = useLocalizedCurriculum();

  const day = localized.find((d) => d.id === currentDay) ?? localized[0];

  useEffect(() => {
    trackVisit(view, view === "day" ? currentDay : undefined);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view, currentDay, trackVisit]);

  const goHome = () => setView("home");
  const openDay = (dayId: number) => {
    setMobileNavOpen(false);
    setCurrentDay(dayId);
    setView("day");
  };

  const completedCount = ready ? progress.completedDays.length : 0;

  const navItems: { view: View; label: string; icon: typeof Home }[] = [
    { view: "home", label: t.nav.roadmap, icon: Home },
    { view: "playground", label: t.nav.playground, icon: FlaskConical },
    { view: "interview", label: t.nav.interview, icon: MessageSquareQuote },
    { view: "cheatsheet", label: t.nav.cheatsheet, icon: BookMarked },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-2.5 text-left"
              aria-label={t.nav.goHome}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Braces className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-bold tracking-tight">TS in 7 Days</span>
                <span
                  className={cn("text-[11px] text-muted-foreground", lang === "bn" && "font-bengali")}
                >
                  {t.nav.tagline}
                </span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => setView(item.view)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    view === item.view || (view === "day" && item.view === "home")
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                  aria-current={view === item.view ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span className={lang === "bn" ? "font-bengali" : undefined}>
                    {item.label}
                  </span>
                </button>
              ))}
              <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              <LangToggle lang={lang} setLang={setLang} />
              <ThemeToggle />
            </nav>

            {/* Mobile controls */}
            <div className="ml-auto flex items-center gap-1 md:hidden">
              <LangToggle lang={lang} setLang={setLang} />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                aria-label={mobileNavOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen((o) => !o)}
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5 rotate-90" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Mobile nav drawer */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border bg-background md:hidden"
                aria-label="Mobile"
              >
                <div className="space-y-1 px-4 py-3">
                  {navItems.map((item) => (
                    <button
                      key={item.view}
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        setView(item.view);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                        view === item.view
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  ))}
                  {/* Day quick access */}
                  <p className="px-3 pt-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.nav.jumpToDay}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 pb-1">
                    {curriculum.map((d) => {
                      const complete = ready && progress.completedDays.includes(d.id);
                      const local = localized.find((ld) => ld.id === d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => openDay(d.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                            view === "day" && currentDay === d.id
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              lang === "bn" && "font-bengali"
                            )}
                          >
                            {lang === "bn"
                              ? ["১", "২", "৩", "৪", "৫", "৬", "৭"][d.id - 1]
                              : d.id}
                            {complete && (
                              <CheckCircle2
                                className="h-3 w-3 text-emerald-500"
                                aria-label={t.home.completed}
                              />
                            )}
                          </span>
                          <span
                            className={cn(
                              "line-clamp-1 text-[9px] font-normal leading-none text-muted-foreground",
                              lang === "bn" && "font-bengali"
                            )}
                          >
                            {(local ?? d).title.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        {/* Progress strip */}
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-4 text-xs text-muted-foreground sm:px-6">
            <Map className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-1.5">
              {curriculum.map((d) => {
                const complete = ready && progress.completedDays.includes(d.id);
                const isCurrent = view === "day" && currentDay === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => openDay(d.id)}
                    title={t.strip.dayBadge(d.id, (localized.find((ld) => ld.id === d.id) ?? d).title)}
                    className={cn(
                      "h-1.5 w-6 shrink-0 rounded-full transition-colors",
                      complete
                        ? "bg-emerald-500"
                        : isCurrent
                          ? "bg-emerald-600/70"
                          : "bg-muted-foreground/25 hover:bg-muted-foreground/40"
                    )}
                    aria-label={`${lang === "bn" ? "দিন" : "Day"} ${d.id}${complete ? ` · ${t.home.completed}` : ""}`}
                  />
                );
              })}
              <span
                className={cn(
                  "ml-1 hidden whitespace-nowrap sm:inline",
                  lang === "bn" && "font-bengali"
                )}
              >
                {t.strip.daysComplete(completedCount, curriculum.length)}
              </span>
            </div>
            <span
              className={cn(
                "ml-auto hidden max-w-[50%] truncate whitespace-nowrap sm:inline",
                lang === "bn" && "font-bengali"
              )}
            >
              {view === "day"
                ? t.strip.dayBadge(currentDay, day.title)
                : view === "playground"
                  ? t.strip.playground
                  : view === "interview"
                    ? t.strip.interview(15)
                    : view === "cheatsheet"
                      ? t.strip.cheatsheet
                      : t.strip.home}
            </span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view === "day" ? `day-${currentDay}` : view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {view === "home" && (
                <HomeView
                  progress={progress}
                  ready={ready}
                  onStartDay={openDay}
                  onOpenView={(v) => setView(v)}
                />
              )}
              {view === "day" && (
                <DayView
                  key={day.id}
                  day={day}
                  completed={ready && progress.completedDays.includes(day.id)}
                  quizScore={progress.quizScores[String(day.id)]}
                  onToggleComplete={toggleDayComplete}
                  onRecordQuiz={recordQuiz}
                  onNavigateDay={openDay}
                />
              )}
              {view === "playground" && (
                <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
                  <header className="mb-6">
                    <h1 className={cn("text-3xl font-bold tracking-tight text-foreground sm:text-4xl", lang === "bn" && "font-bengali")}>
                      {t.playground.title}
                    </h1>
                    <p className={cn("mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground", lang === "bn" && "font-bengali")}>
                      {t.playground.bodyA}{" "}
                      <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">tsc</span>{" "}
                      {t.playground.bodyB}
                    </p>
                  </header>
                  <Playground />
                </div>
              )}
              {view === "interview" && <InterviewView />}
              {view === "cheatsheet" && <CheatsheetView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer (sticky) */}
        <footer className="mt-auto border-t border-border bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p className={cn("flex items-center gap-1.5", lang === "bn" && "font-bengali")}>
              <Braces className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {t.footer.line}
            </p>
            <p className={cn("flex items-center gap-3", lang === "bn" && "font-bengali")}>
              <span>{t.footer.strict}</span>
              <span aria-hidden="true">·</span>
              <span>{t.footer.saved}</span>
            </p>
          </div>
        </footer>

        {/* AI tutor */}
        <AiAssistant
          context={{ view, dayId: view === "day" ? currentDay : undefined, dayTitle: day?.title, lang }}
        />
      </div>
    </ThemeProvider>
  );
}
