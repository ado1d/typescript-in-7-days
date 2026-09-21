import type { Day } from "./types";

export const day7: Day = {
  id: 7,
  title: "Real Code & Interview Prep",
  subtitle: "Convert a real JS file, read real projects, and rehearse the answers out loud",
  hours: "~2.5 hours",
  goal: "Perform the plan's final routine: migrate real JavaScript to TypeScript, read an open-source repo without drowning, and deliver every interview answer in 2-3 sentences.",
  icon: "target",
  intro: [
    "Day 7 has no new syntax — it converts knowledge into skill. The three tasks: take real JavaScript and migrate it (the fastest way to find your gaps), read a real TS codebase (pattern recognition), and rehearse the 15 interview questions out loud with a code example for each — because \"I knew it\" and \"I can say it\" are different skills.",
    "If you know your target stack (React, Node, or Angular), spend the last hour on its TS specifics — the React/Node starter below covers the high-frequency 80%.",
  ],
  sections: [
    {
      id: "d7-convert-js",
      title: "Convert a JavaScript project to TypeScript",
      minutes: 40,
      paragraphs: [
        "The migration recipe that keeps you sane: rename and loosen, then tighten in passes. Start by renaming `.js` → `.ts` (or `.jsx` → `.tsx`) one file at a time with `allowJs: true` and `checkJs: false` in tsconfig so the un-migrated files keep working. First pass: fix syntax errors only (missing imports, implicit any) by adding minimal types. Second pass: turn on `strict` for real annotations. Third pass: hunt the remaining `any`s and replace them with real types or `unknown` + narrowing.",
        "The mechanical tips that save an hour: let inference do most typing (Day 1); type the data shapes first (Day 2 interfaces) and functions almost type themselves; when you hit a third-party module without types, `declare module` it (Day 6) and move on. Do NOT try to make everything perfect in one pass — an 80%-typed strict file beats a perfect type system you gave up on.",
      ],
      examples: [
        {
          title: "Before — plain JavaScript",
          variant: "neutral",
          language: "javascript",
          code: `// cart.js — before
const TAX = 0.08

function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function checkout(cart, promo) {
  let total = subtotal(cart.items)
  if (promo && promo.percent) {
    total = total * (1 - promo.percent / 100)
  }
  total = total * (1 + TAX)
  return { total: Math.round(total * 100) / 100, count: cart.items.length }
}

const cart = { items: [{ price: 19.99, qty: 2 }] }
console.log(checkout(cart, { percent: 10 }))`,
          output: "{ total: 38.78, count: 1 }",
          caption:
            "Nothing tells you `items` is an array, `promo` may be undefined, or that `promo.percent` should be a number between 0 and 100. Every one of those is a production incident waiting.",
        },
        {
          title: "After — strict TypeScript",
          variant: "good",
          code: `// cart.ts — after (strict mode)
interface LineItem {
  price: number
  qty: number
}

interface Cart {
  items: LineItem[]
}

interface Promo {
  percent: number // 0–100
}

const TAX = 0.08

function subtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function checkout(cart: Cart, promo?: Promo): { total: number; count: number } {
  let total = subtotal(cart.items)
  if (promo) {
    total *= 1 - promo.percent / 100
  }
  total *= 1 + TAX
  return {
    total: Math.round(total * 100) / 100,
    count: cart.items.length,
  }
}

const cart: Cart = { items: [{ price: 19.99, qty: 2 }] }
console.log(checkout(cart, { percent: 10 }))`,
          output: "{ total: 38.78, count: 1 }",
          caption:
            "Notice how little changed: shapes for the data, annotations on function boundaries, `?` for the optional promo. The compiler now catches `checkout(cart, { persent: 10 })` typos, missing items, and string qty — all for ~10 lines of types.",
        },
        {
          title: "The migration checklist",
          variant: "neutral",
          language: "bash",
          code: `# 1. Enable incremental adoption:
#    tsconfig: { "allowJs": true, "checkJs": false, "strict": true }
# 2. Rename ONE file: cart.js -> cart.ts (jsx -> tsx for components)
# 3. Fix syntax-level errors (imports, implicit any)
# 4. Model the data shapes (interfaces) — then functions follow
# 5. Repeat per file; delete allowJs when the last .js is gone
#
# Useful one-liners:
npx tsc --noEmit            # type-check without writing output
npx tsc --noEmit --strict   # see what strict would flag before enabling
npx tsx cart.ts              # run without a build step`,
        },
      ],
      keyPoints: [
        "Migrate incrementally: `allowJs: true`, one file at a time, strict from the first renamed file.",
        "Type the data shapes first — once interfaces exist, function annotations nearly write themselves.",
        "`npx tsc --noEmit` is your full-project check; run it constantly.",
      ],
    },
    {
      id: "d7-read-real-code",
      title: "Reading an open-source TS project",
      minutes: 30,
      paragraphs: [
        "Reading real code trains the pattern-recognition half of fluency. Good small targets: a tiny Express API, a state-management library's source, or any repo's `src/` folder under ~2000 lines. You are not reading to understand every line — you are cataloging patterns: how types are organized, where generics appear, which utilities the team leans on, and how they handle the untyped boundaries.",
        "The method: start at the entry point, follow one request path end-to-end, and keep a notebook of patterns you don't recognize. Every unfamiliar pattern becomes tomorrow's study topic — and 80% of them will be things you learned this week: a discriminated union for the state, generics on a repository class, Pick/Omit for the DTO layer.",
      ],
      examples: [
        {
          title: "Patterns you will meet (and now recognize)",
          variant: "good",
          code: `// 1. Domain types in one place (Day 2):
//    src/types.ts — the model everything imports

// 2. Result/Either unions at boundaries (Day 3):
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// 3. Generic repositories (Day 4):
interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>
  findAll(): Promise<T[]>
  save(entity: T): Promise<T>
}

// 4. DTOs via utility types (Day 5):
//    type UserDTO = Omit<User, "passwordHash">

// 5. Zod at the network edge (Day 6):
//    const UserSchema = z.object({ id: z.number(), ... })
//    type User = z.infer<typeof UserSchema>

// 6. Discriminated state in stores/hooks (Day 3):
//    status: "idle" | "loading" | { ok: true } | { ok: false }`,
          caption:
            "Take this checklist into the repo you read — tick off each pattern as you find it, and note the ones you can't explain yet. Those notes are your personal syllabus.",
        },
      ],
      keyPoints: [
        "Read entry-point → one full path, not every file. Catalog patterns, don't memorize lines.",
        "Expect: central types file, Result unions, generic repositories, DTOs via Pick/Omit, Zod at the edge.",
        "Keep a \"didn't recognize\" list — it becomes your next study plan.",
      ],
    },
    {
      id: "d7-react-node",
      title: "React & Node — the hour that pays off immediately",
      minutes: 35,
      paragraphs: [
        "If your next job touches React or Node, one hour here saves your first week. In React: type props with an `interface` (not `React.FC` — the community has moved away from it for its implicit-children quirk), let `useState` infer when the initial value tells the truth and specify `useState<T>` when it can't (nullable initial state, unions), and type event handlers inline where they're used.",
        "In Node/Express: the types come from `@types/express` — annotate `Request` and `Response` (with generics for URL params and response payloads), type the middleware chain's `next`, and type your data layer's return types as `Promise<T[]>` style contracts. The common thread in both: annotate the boundaries (props, handlers, routes), infer inside.",
      ],
      examples: [
        {
          title: "React — the 80% you need",
          variant: "good",
          language: "tsx",
          code: `import { useState } from "react"

// Props: plain interface + destructuring (not React.FC)
interface TodoListProps {
  title: string
  initialTodos: string[]
  onAdd?: (todo: string) => void
}

export function TodoList({ title, initialTodos, onAdd }: TodoListProps) {
  // Inferred: string[] from the initial value
  const [todos, setTodos] = useState(initialTodos)

  // useState<T> when the initial value can't tell the truth:
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <section>
      <h2>{title} ({todos.length})</h2>
      <ul>
        {todos.map((t) => (
          <li
            key={t}
            onClick={() => setSelected(t)}          // handler typed by context
            aria-current={selected === t}
          >
            {t}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {                            // React.FormEvent inferred
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem("todo") as HTMLInputElement
          if (input.value.trim()) {
            setTodos([...todos, input.value])
            onAdd?.(input.value)
          }
        }}
      >
        <input name="todo" />
      </form>
    </section>
  )
}`,
          caption:
            "The interview-friendly line: \"I type props as interfaces, use useState<T> for unions and nullable state, and let handlers infer from JSX context — React's synthetic events are fully typed by @types/react.\"",
        },
        {
          title: "Node/Express — the 80% you need",
          variant: "good",
          code: `import express, { type Request, type Response } from "express"

interface CreateUserBody {
  name: string
  email: string
}

interface UserRow {
  id: number
  name: string
  email: string
}

// A typed data layer:
async function insertUser(body: CreateUserBody): Promise<UserRow> {
  // ...db insert
  return { id: 1, ...body }
}

const app = express()
app.use(express.json())

// Request/Response generics: params + body + response payload
app.post(
  "/users",
  async (req: Request<{}, UserRow, CreateUserBody>, res: Response<UserRow>) => {
    const { name, email } = req.body // typed as CreateUserBody

    if (!name || !email) {
      res.status(400)
      return res.json({ id: 0, name: "", email: "" }) // must be UserRow
    }

    const user = await insertUser({ name, email })
    res.status(201).json(user)
  }
)

app.listen(3000, () => console.log("listening"))`,
          caption:
            "With @types/express, `req.body` is typed by the third generic, URL params by the first. `import { type Request }` keeps the type-only import erased — exactly Day 6's module hygiene.",
        },
      ],
      keyPoints: [
        "React: interface for props (not React.FC), `useState<T>` for nullable/union state, inferred event handlers.",
        "Node: @types/express generics type params and bodies; annotate route boundaries, infer internals.",
        "Both stacks: type the boundaries, infer the inside — the week's whole philosophy in one line.",
      ],
    },
    {
      id: "d7-interview-strategy",
      title: "The out-loud interview rehearsal",
      minutes: 25,
      paragraphs: [
        "The plan's protocol: go through all 15 questions out loud, 2-3 sentences each, with a code example. Speaking matters — interviews happen in speech, not reading. For each question follow the same three-beat shape: definition in one sentence, why it matters in one, tiny example in one. Vague answers fail; structured three-beat answers pass.",
        "Open the Interview tab of this app (all 15 questions with model answers live there) and do one full pass today: attempt the answer out loud FIRST, then reveal the model answer, then grade yourself on the three beats. Anything you fumbled gets a second pass tomorrow morning — spaced repetition beats cramming.",
      ],
      examples: [
        {
          title: "The three-beat answer shape",
          variant: "neutral",
          code: `// Q: "What is type narrowing?"

// Beat 1 — define (one sentence):
"Type narrowing is the compiler refining a union type based on
runtime checks, so a value has a more specific type inside the
checked branch."

// Beat 2 — why it matters (one sentence):
"It's what makes unions practical — you can accept broad input
like string | number and still handle each case safely."

// Beat 3 — tiny example (say it as code):
"After typeof value === 'string', value is a string in that
branch — no assertion needed."

// Total: ~15 seconds spoken. Every one of the 15 questions
// fits this shape. Practice until each feels automatic.`,
        },
      ],
      keyPoints: [
        "Answer aloud, in the 3-beat shape: define → why it matters → tiny example.",
        "Attempt before revealing — the struggle is what encodes the answer.",
        "Fumbled questions get a spaced second pass tomorrow.",
      ],
      callouts: [
        {
          kind: "interview",
          title: "The Interview tab is your rehearsal room",
          body: "All 15 questions with model answers, category filters, and a self-grade flow. One full pass today, one refresh pass tomorrow morning before any call.",
        },
      ],
    },
  ],
  quiz: [
    {
      id: "d7-q1",
      question: "When migrating a JS project to TS, the recommended first step is…",
      options: [
        "Rename every .js file to .ts in one commit",
        "Enable allowJs and rename one file at a time, keeping strict on from the start",
        "Turn off strict until everything is migrated",
        "Rewrite the project from scratch",
      ],
      answerIndex: 1,
      explanation:
        "Incremental migration with allowJs keeps the app runnable throughout. Strict-from-the-start avoids the painful second migration of retrofitting null checks later.",
    },
    {
      id: "d7-q2",
      question: "In React, the modern convention for typing component props is…",
      options: [
        "React.FC<Props>",
        "A plain interface + destructured props parameter",
        "PropTypes",
        "Type the props object as any and cast",
      ],
      answerIndex: 1,
      explanation:
        "The community moved from React.FC to plain interfaces: fewer quirks (FC used to imply children, complicates generics and defaults) and identical type safety.",
    },
    {
      id: "d7-q3",
      question: "Which tsconfig pair lets a mixed JS/TS project compile during migration?",
      options: [
        "\"strict\": false, \"target\": \"ES5\"",
        "\"allowJs\": true, \"checkJs\": false",
        "\"skipLibCheck\": true, \"outDir\": \"./dist\"",
        "\"noImplicitAny\": false, \"module\": \"CommonJS\"",
      ],
      answerIndex: 1,
      explanation:
        "allowJs lets .js files be imported from .ts; checkJs:false stops the compiler from type-checking the not-yet-migrated JavaScript.",
    },
    {
      id: "d7-q4",
      question: "The three-beat structure recommended for interview answers is…",
      options: [
        "History → opinions → future",
        "Definition → why it matters → tiny example",
        "Apologize → answer → ask a question back",
        "Definition → three counterexamples → performance notes",
      ],
      answerIndex: 1,
      explanation:
        "Definition proves you know the term, relevance proves you understand the tradeoff, and the example proves you have written it. Fifteen seconds, no rambling.",
    },
    {
      id: "d7-q5",
      question: "When reading an open-source TS project, the recommended approach is…",
      options: [
        "Read every file alphabetically for full coverage",
        "Follow one path from the entry point and catalog patterns, noting what you don't recognize",
        "Only read the tests",
        "Start with the tsconfig and never look at src/",
      ],
      answerIndex: 1,
      explanation:
        "Entry-point-to-one-path gives context; pattern cataloging builds recognition; the unknowns list becomes your personal syllabus. Full coverage is neither possible nor useful.",
    },
  ],
  practice: {
    intro:
      "The final routine from the plan: convert, read, rehearse. This practice spans your editor, a real repo, and this app's Interview tab.",
    steps: [
      "Pick one real JS file you wrote (or a small utility from a project of yours — 50-150 lines is ideal) and migrate it with the checklist: rename, model shapes, annotate boundaries, strict on.",
      "Run `npx tsc --noEmit` until it's clean, then note every place you were tempted to use `any` — those are your gap list.",
      "Pick a small open-source TS repo (a tiny Express API, a state library, a CLI tool). Follow one path from entry point and catalog at least 5 patterns you recognize from this week.",
      "Write down 2-3 patterns you did NOT recognize — those are tomorrow's study topics.",
      "Open the Interview tab and do one full out-loud pass of all 15 questions, grading yourself on the three beats. Fumbled ones get a morning-after second pass.",
    ],
    starter: `// Day 7 practice — your own JS file goes here.
// If you need one, migrate this:

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function paginate(items, page, perPage) {
  const start = (page - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    page,
    perPage,
    total: items.length,
    hasMore: start + perPage < items.length,
  }
}

console.log(slugify("Hello, TypeScript World!"))
console.log(paginate([1, 2, 3, 4, 5, 6, 7], 2, 3))`,
    solution: `// Day 7 practice — slugify/paginate migrated

interface Paginated<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  hasMore: boolean
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const start = (page - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    page,
    perPage,
    total: items.length,
    hasMore: start + perPage < items.length,
  }
}

console.log(slugify("Hello, TypeScript World!"))
// hello-typescript-world

console.log(paginate([1, 2, 3, 4, 5, 6, 7], 2, 3))
// { items: [ 4, 5, 6 ], page: 2, perPage: 3, total: 7, hasMore: true }`,
    solutionNote:
      "Two small upgrades hide in this migration: `Paginated<T>` is a generic (a reusable shape for any list endpoint), and the regex replaces chained cleanly. Small files, migrated well, teach more than big ones.",
  },
};
