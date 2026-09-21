# TypeScript in 7 Days — Learn by Browsing

An interactive, self-contained web guide that teaches you TypeScript in 7 days — no book, no course signup, no setup required. Everything you need lives in the app: lessons, runnable code, quizzes, a live playground, and interview prep.

## What's inside

- **7-day curriculum** — 38 lesson sections covering the full path from primitive types to generics, utility types, classes, modules, `tsconfig.json`, and migrating a real JS project.
  - **Day 1:** Setup, compilation, primitives, arrays, tuples, enums, `any`/`unknown`/`void`/`never`
  - **Day 2:** Functions, objects, `interface` vs `type`, extension & intersections
  - **Day 3:** Unions, narrowing, discriminated unions, assertions, `?.` and `??`
  - **Day 4:** Generics, constraints, `keyof`, `typeof`, typed promises & arrays
  - **Day 5:** Utility types (`Partial`, `Pick`, `Omit`, `Record`, …), mapped & conditional types
  - **Day 6:** Classes, modifiers, `implements`, modules, `import type`, `tsconfig.json`, `.d.ts`
  - **Day 7:** Migrating JS → TS, reading real open-source TS, mock interview
- **70+ code examples** — each with syntax highlighting and copy button; "broken" examples show the *real* compiler errors you'll meet in the wild.
- **Live playground** — type-check *and run* TypeScript in the browser, powered by the real `tsc` compiler on the server (`/api/ts-check`) with a sandboxed executor and instant error feedback.
- **35 quiz questions** with explanations, scored per day and saved locally.
- **15 interview questions** in reveal-first study mode with model answers.
- **Searchable cheatsheet** — 8 categories of quick-reference syntax.
- **Progress tracking** — days completed, quiz scores, and current streak stored in `localStorage`. No account needed.
- **Light/dark theme**, fully responsive, works great on mobile.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript (strict) — the app teaches the language it's written in
- Tailwind CSS 4 + shadcn/ui + Radix primitives
- [Prism.js](https://prismjs.com) for syntax highlighting
- The real [`typescript`](https://www.npmjs.com/package/typescript) compiler package running server-side in `/api/ts-check`, executing user code in a `node:vm` sandbox with a timeout guard

## Getting started

```bash
npm install      # or: bun install
npm run dev      # or: bun run dev
```

Open http://localhost:3000 and start with Day 1.

> No environment variables are needed — all progress is stored client-side.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Deploying to Vercel

The fastest way: click the button below.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fado1d%2Ftypescript-in-7-days)

Or from the CLI:

```bash
npx vercel        # preview deployment
npx vercel --prod # production deployment
```

The `/api/ts-check` route runs on the Node.js runtime and bundles the `typescript` package (~50 MB unpacked) — it fits comfortably within Vercel's serverless function limits.

## Project structure

```
src/
  app/
    page.tsx                  # single-page app shell + view router
    layout.tsx                # root layout, fonts, theme provider
    globals.css               # Tailwind + custom Prism theme
    api/ts-check/route.ts     # real tsc type-check + sandboxed execution
  components/learning/        # home, day, quiz, playground, interview, cheatsheet views
  components/ui/              # shadcn/ui primitives used by the app
  lib/curriculum/             # all course content (data-driven, easy to edit)
  lib/progress.ts             # localStorage-backed progress store
```

All lesson content is plain TypeScript data in `src/lib/curriculum/` — extend or translate the course by editing those files, no component changes required.

## License

MIT
