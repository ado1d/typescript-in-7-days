"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shapes,
  FunctionSquare,
  Box,
  GitFork,
  Boxes,
  WandSparkles,
  Layers,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cheatsheet } from "@/lib/curriculum";
import { CodeBlock } from "./code-block";

const iconMap = {
  types: Shapes,
  functions: FunctionSquare,
  objects: Box,
  unions: GitFork,
  generics: Boxes,
  utilities: WandSparkles,
  classes: Layers,
  config: Settings,
} as const;

export function CheatsheetView() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(cheatsheet[0].id);

  const filtered = query
    ? cheatsheet
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.code.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : cheatsheet;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Cheatsheet
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The whole week compressed into copy-paste-ready snippets. Skim it before an interview,
          keep it open while coding.
        </p>
      </header>

      {/* Search */}
      <div className="relative mt-6 max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search snippets (e.g. keyof, Partial, switch…)"
          aria-label="Search cheatsheet"
          className="h-11 w-full rounded-xl border bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50"
        />
      </div>

      {query ? (
        /* Search results — flat list */
        <div className="mt-6 space-y-8">
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No snippets match &quot;{query}&quot; — try keyof, Partial, generics, enum, readonly…
            </p>
          )}
          {filtered.map((cat) => (
            <section key={cat.id}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                {(() => {
                  const Icon = iconMap[cat.icon];
                  return <Icon className="h-4 w-4" aria-hidden="true" />;
                })()}
                {cat.title}
              </h2>
              <div className="space-y-5">
                {cat.items.map((item) => (
                  <div key={item.title}>
                    <p className="mb-1.5 text-sm font-medium text-foreground">{item.title}</p>
                    <CodeBlock code={item.code} variant="neutral" />
                    {item.note && (
                      <p className="mt-1.5 px-1 text-xs text-muted-foreground">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Category nav */}
          <aside aria-label="Cheatsheet categories">
            <div className="sticky top-24 space-y-1">
              {cheatsheet.map((cat) => {
                const Icon = iconMap[cat.icon];
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      document
                        .getElementById(`cat-${cat.id}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {cat.title}
                    <span className="ml-auto font-mono text-[10px] opacity-60">
                      {cat.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Categories */}
          <div className="min-w-0 space-y-10">
            {cheatsheet.map((cat, ci) => (
              <motion.section
                key={cat.id}
                id={`cat-${cat.id}`}
                className="scroll-mt-24"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: Math.min(ci * 0.04, 0.2) }}
              >
                <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
                  {(() => {
                    const Icon = iconMap[cat.icon];
                    return (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    );
                  })()}
                  {cat.title}
                </h2>
                <div className="mt-4 space-y-5">
                  {cat.items.map((item) => (
                    <div key={item.title}>
                      <p className="mb-1.5 text-sm font-medium text-foreground">{item.title}</p>
                      <CodeBlock code={item.code} variant="neutral" />
                      {item.note && (
                        <p className="mt-1.5 px-1 text-xs text-muted-foreground">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
