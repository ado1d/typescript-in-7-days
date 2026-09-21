import type { Day } from "./types";

export const day6: Day = {
  id: 6,
  title: "Classes, Modules & Config",
  subtitle: "Object-oriented TypeScript, code organization, and the tsconfig switches that matter",
  hours: "~3 hours",
  goal: "Write class-based modules split across files, understand what `strict` actually enables, and type real async code and API responses.",
  icon: "layers",
  intro: [
    "Day 6 is the bridge from language features to real projects. Classes are how many Node services and Angular apps are structured; ES modules with `import type` are how every codebase is organized; and tsconfig's `strict` flag is the single switch that separates toy projects from professional ones.",
    "You will also finally type a full async flow — fetch, typed responses, error handling — which is the last piece before Day 7's conversion exercise and interview rehearsal.",
  ],
  sections: [
    {
      id: "d6-classes",
      title: "Classes: modifiers, constructor shorthand, abstract, implements",
      minutes: 35,
      paragraphs: [
        "TypeScript adds a compile-time member-visibility layer on top of JavaScript classes. `private` members only exist inside the class — the compiler enforces it (JavaScript's `#private` adds true runtime privacy; `private` is purely type-level). `protected` extends access to subclasses. `readonly` properties can only be assigned in the constructor. The constructor shorthand — `constructor(public title: string)` — declares the field AND assigns it in one line; it is the idiomatic way to write data classes.",
        "Two inheritance keywords finish the picture: `abstract` classes define a partial template that subclasses must complete (abstract methods have no body in the base), and `implements` is a *type-level only* contract between a class and an interface — the class promises to have the interface's members, but inherits nothing. That distinction (extends = inheritance of behavior, implements = promise of shape) is a classic interview follow-up.",
      ],
      examples: [
        {
          title: "A full-featured class",
          variant: "good",
          code: `interface Printable {
  summarize(): string
}

abstract class Account implements Printable {
  // constructor shorthand: declare + assign in one line
  constructor(
    public readonly owner: string,
    protected balance: number = 0,
  ) {}

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("amount must be positive")
    this.balance += amount
  }

  // abstract: a body that subclasses MUST provide
  abstract monthlyFee(): number

  applyFees(): void {
    this.balance -= this.monthlyFee()
  }

  summarize(): string {
    return \`\${this.owner}: $\${this.balance.toFixed(2)}\`
  }
}

class CheckingAccount extends Account {
  constructor(owner: string, private freeChecksPerMonth = 10) {
    super(owner, 100)
  }

  monthlyFee(): number {
    return 5
  }

  get checksLeft(): number {
    return this.freeChecksPerMonth
  }
}

const acct = new CheckingAccount("Ada")
acct.deposit(250)
acct.applyFees()

console.log(acct.summarize())
console.log(acct.owner)        // public: readable
// acct.balance               // private-ish: compile error
// acct.deposit(-5)           // throws at runtime — guarded`,
          output: `Ada: $345.00
10`,
          caption:
            "Modifiers are compile-time: strip the types and this is an ordinary JS class. `implements Printable` guarantees summarize() exists — the abstract class itself can never be instantiated.",
        },
        {
          title: "extends vs implements",
          variant: "neutral",
          code: `interface Serializable {
  toJSON(): string
}

class Store {}                  // a concrete base class

// extends: INHERITS implementation (code reuse)
class Cache extends Store {
  hit() { return "hit" }
}

// implements: TYPE CONTRACT only (nothing inherited)
class Session implements Serializable {
  toJSON(): string { return "{}" }
}

// A class can do both, and implement several interfaces:
class ApiStore
  extends Store
  implements Serializable, Printable2
{
  toJSON(): string { return "{}" }
  summarize(): string { return "api" }
}

interface Printable2 { summarize(): string }`,
          caption:
            "Interview soundbite: \"extends gives you code and couples you to a base class; implements only checks the shape — prefer implements for contracts, extends only for real is-a reuse.\"",
        },
      ],
      keyPoints: [
        "Constructor shorthand (`constructor(public title: string)`) declares + assigns in one line — the idiomatic data-class pattern.",
        "`private` / `protected` / `readonly` are compile-time checks; JS `#field` is the runtime-private alternative.",
        "`abstract` = incomplete template class; `implements` = type-level contract with zero inheritance.",
      ],
    },
    {
      id: "d6-modules",
      title: "ES modules: import / export, import type",
      minutes: 25,
      paragraphs: [
        "Module syntax is JavaScript's, plus one TypeScript-specific addition: `import type`. When you import ONLY types (an interface, a type alias) and the import gets erased anyway, `import type { User } from \"./types\"` makes that explicit — the compiler guarantees the import disappears entirely from the compiled output, which matters for circular imports and for code that runs where the module has no runtime side effects.",
        "The organization convention that scales: one `types.ts` (or `types/` folder) holding the domain model, feature modules importing types with `import type`, and a barrel `index.ts` re-exporting the public surface. Today's practice uses exactly that layout.",
      ],
      examples: [
        {
          title: "A three-file module layout",
          variant: "good",
          code: `// ---- types.ts — the domain model ----
export interface Todo {
  id: number
  title: string
  done: boolean
}

export type TodoFilter = "all" | "active" | "done"

// ---- todo-service.ts — the behavior ----
import type { Todo, TodoFilter } from "./types"

export class TodoService {
  constructor(private todos: Todo[] = []) {}

  filter(kind: TodoFilter): Todo[] {
    switch (kind) {
      case "active": return this.todos.filter((t) => !t.done)
      case "done":   return this.todos.filter((t) => t.done)
      default:       return this.todos
    }
  }
}

// ---- index.ts — the public surface ----
export * from "./types"
export { TodoService } from "./todo-service"`,
          caption:
            "In the app's Playground (single-file), simulate this by pasting all parts into one file — the import lines are what you would write across files. Try it in your editor with real files!",
        },
        {
          title: "import type vs plain import",
          variant: "neutral",
          code: `import type { Todo, TodoFilter } from "./types"   // ERASED at compile time
import { TodoService } from "./todo-service"      // real runtime import

// Mixing both in one line:
import { TodoService, type Todo } from "./index"

// Value import of a type-only export would keep a (dead) runtime
// import in older emit targets — \`type\` keyword avoids that.`,
        },
      ],
      keyPoints: [
        "`import type { X }` is fully erased — no runtime import remains. Use it for type-only imports.",
        "Inline mixed form works too: `import { service, type Model } from \"./mod\"`.",
        "Convention: `types.ts` holds the domain model; feature files `import type` from it; `index.ts` re-exports the public surface.",
      ],
    },
    {
      id: "d6-tsconfig",
      title: "tsconfig.json: the flags that matter",
      minutes: 30,
      paragraphs: [
        "`tsc --init` scaffolds a tsconfig with ~100 commented options; about six matter daily. `strict: true` is the master switch that turns on the whole family of soundness checks — strictNullChecks (null/undefined are their own types — the single biggest behavior change), noImplicitAny (parameters can't silently be any), and several friends. `target` sets the emitted JS version (ES2020 is a safe modern default); `module` sets the module system (ESNext for bundlers, CommonJS for plain Node); `outDir` and `rootDir` control where output lands; `esModuleInterop` makes CJS/ESM imports interoperate sanely.",
        "The professional default: strict on from day one. Turning it on later in a codebase is a genuine migration project; starting strict costs a few extra minutes now and saves entire bug classes forever.",
      ],
      examples: [
        {
          title: "A tsconfig you can actually use",
          variant: "good",
          language: "json",
          code: `{
  "compilerOptions": {
    "strict": true,               // master switch — see below
    "target": "ES2020",           // emitted JS version
    "module": "ESNext",           // for bundlers; "CommonJS" for plain Node
    "moduleResolution": "bundler",// or "node" for older setups
    "outDir": "./dist",           // where .js files land
    "rootDir": "./src",           // where your .ts files live
    "esModuleInterop": true,      // sane interop between module systems
    "skipLibCheck": true,         // don't type-check .d.ts of dependencies
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}`,
        },
        {
          title: "What strict actually enables",
          variant: "neutral",
          code: `// strict: true is shorthand for AT LEAST:
//   strictNullChecks        null/undefined are distinct types (the big one)
//   noImplicitAny           un-annotated params are errors, not any
//   strictFunctionTypes     function params checked contravariantly
//   strictBindCallApply     bind/call/apply checked precisely
//   strictPropertyInitialization  class fields must be definitely assigned
//   noImplicitThis          no untyped 'this'
//   useUnknownInCatchVariables  catch (e) is unknown, not any

// Without strictNullChecks, this compiles (and crashes):
const user: { name: string } | null = null
console.log(user.name)   // with strict: "user is possibly 'null'" — caught

// Without noImplicitAny, this compiles silently:
function double(x) { return x * 2 }  // strict: "x implicitly has an 'any' type"`,
          caption:
            "Interview soundbite for question #9: \"strict enables strictNullChecks and noImplicitAny among others — it is the difference between TypeScript as autocomplete and TypeScript as a safety net.\"",
        },
      ],
      keyPoints: [
        "The 6 daily flags: `strict`, `target`, `module`, `outDir`/`rootDir`, `esModuleInterop`.",
        "`strict` ≈ strictNullChecks + noImplicitAny + more. Never start a project without it.",
        "`target` = JS version of output; `module` = module system of output — they are independent.",
      ],
      callouts: [
        {
          kind: "info",
          title: "This app runs on strict TypeScript",
          body: "The web app you are using right now is a Next.js project compiled with strict mode — and it type-checks on every save. You are inside the tool you are learning.",
        },
      ],
    },
    {
      id: "d6-declaration-files",
      title: ".d.ts files and @types/* packages",
      minutes: 20,
      paragraphs: [
        "TypeScript consumes types from two places: your code and *declaration files* (`.d.ts`) — type-only files with no runtime code. When you install `@types/express`, you are installing a big `.d.ts` bundle describing Express's API, so the compiler understands `app.get(...)`. The DefinitelyTyped repository hosts these for thousands of packages that don't ship their own types.",
        "Modern packages ship their types inside the package itself (look for `\"types\"` in its package.json) — those need no `@types/*` install at all. When types are missing entirely, TypeScript falls back to `any` and warns \"Could not find a declaration file\" — the quick fix is a local `declare module \"pkg\"` shim or a small `.d.ts` of your own.",
      ],
      examples: [
        {
          title: "The ecosystem pattern",
          variant: "neutral",
          language: "bash",
          code: `# Express ships NO types — install the community ones:
npm install express
npm install --save-dev @types/express

# Now this type-checks fully:
# app.get("/users", (req: Request, res: Response) => { ... })

# Many modern packages ship their own types (check package.json):
#   "types": "./dist/index.d.ts"   -> nothing extra to install`,
        },
        {
          title: "Writing a tiny declaration",
          variant: "good",
          code: `// global.d.ts — augment your project's environment
declare module "analytics-tracker" {
  export function track(event: string, data?: Record<string, unknown>): void
}

// Now imports of that (untyped) package are fully typed:
import { track } from "analytics-tracker"
track("signup", { plan: "pro" })
track("signup", 42)   // error: data must be a Record<string, unknown>

// Ambient globals (e.g. injected by a script tag):
declare global {
  interface Window {
    __APP_VERSION__: string
  }
}
export {}`,
        },
      ],
      keyPoints: [
        "`.d.ts` = type declarations with zero runtime code; the compiler reads them, the output ignores them.",
        "`@types/pkg` = community types from DefinitelyTyped, installed as devDependencies.",
        "\"Could not find a declaration file\" → install @types, or shim with `declare module`.",
      ],
    },
    {
      id: "d6-async-types",
      title: "Async/await with typed Promises, and typing API responses",
      minutes: 30,
      paragraphs: [
        "Async TypeScript is mostly about giving `Promise<T>` a real T and then letting `await` unwrap it. The pattern for real API work: define response interfaces (narrowed, honest shapes), type the fetch flow, and handle the two failure modes — the fetch-level throw and the application-level error status — with a discriminated union (Day 3) as the return type. That combination is the standard \"typed data fetching\" recipe in every production codebase.",
        "Be honest at the boundary: `res.json()` returns `any`/`unknown` by design — the server's word is not a guarantee. Type the parsed shape, and if the data is critical, validate it at runtime (Zod) before trusting the annotation. Types are claims; validation is proof.",
      ],
      examples: [
        {
          title: "The typed fetch recipe",
          variant: "good",
          code: `interface User {
  id: number
  name: string
}

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const res = await fetch(\`https://api.example.com/users/\${id}\`)

    if (!res.ok) {
      return { ok: false, error: \`HTTP \${res.status}\` }
    }

    // json() is any/unknown — we ASSERT a shape at the boundary.
    // (For critical data, validate with Zod instead of asserting.)
    const data = (await res.json()) as User
    return { ok: true, data }

  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "network failure",
    }
  }
}

async function main() {
  const result = await fetchUser(1)
  if (result.ok) {
    console.log(\`loaded: \${result.data.name}\`) // data is User here
  } else {
    console.log(\`failed: \${result.error}\`)     // error is string here
  }
}

main()`,
          output: "failed: fetch failed (sandboxed playground has no network) — but note HOW it failed: a typed Result, not a crash",
          caption:
            "The playground has no network access, so you will see the typed catch branch fire — which is exactly the resilience this recipe exists for. Paste it into your editor with a real URL to see the success branch.",
        },
        {
          title: "Sequencing and parallelism with typed promises",
          variant: "good",
          code: `async function loadConfig(): Promise<{ retries: number }> {
  return { retries: 3 }
}

async function loadFeatures(): Promise<string[]> {
  return ["dark-mode", "beta"]
}

async function bootstrap(): Promise<void> {
  // Sequential — each waits for the previous:
  const config = await loadConfig()
  console.log(\`retries: \${config.retries}\`)

  // Parallel — all at once, still fully typed:
  const [a, b] = await Promise.all([loadConfig(), loadFeatures()])
  console.log(a.retries, b.join("+"))

  // Promise.all on heterogeneous types infers the tuple:
  // [ { retries: number }, string[] ]
}

bootstrap()`,
          output: `retries: 3
3 dark-mode+beta`,
        },
      ],
      keyPoints: [
        "Type the async boundary: annotate return `Promise<T>`, assert/validate the parsed JSON shape.",
        "Return a discriminated union (`Result<T>`) so callers must handle both branches.",
        "`await Promise.all([...])` infers a typed tuple for parallel, heterogeneous work.",
      ],
    },
  ],
  quiz: [
    {
      id: "d6-q1",
      question: "What does the constructor shorthand `constructor(public title: string)` do?",
      options: [
        "Only types the parameter — you still declare the field manually",
        "Declares a public field AND assigns the parameter to it, in one line",
        "Makes the class abstract",
        "Creates a getter named title",
      ],
      answerIndex: 1,
      explanation:
        "Parameter properties: the modifier in the constructor signature generates the field declaration and assignment for you. It is the idiomatic data-class pattern.",
    },
    {
      id: "d6-q2",
      question: "The key difference between `extends` and `implements`?",
      options: [
        "implements inherits code; extends only checks shape",
        "extends inherits implementation and members; implements is a type-level contract only, nothing is inherited",
        "They are interchangeable",
        "implements only works with abstract classes",
      ],
      answerIndex: 1,
      explanation:
        "extends = runtime inheritance + coupling. implements = compile-time promise that the class has the interface's members — a class can implement many interfaces but extend only one base.",
    },
    {
      id: "d6-q3",
      question: "Which two flags does `strict: true` enable that change daily life the most?",
      options: [
        "decorators and experimentalDecorators",
        "strictNullChecks and noImplicitAny",
        "skipLibCheck and forceConsistentCasingInFileNames",
        "outDir and rootDir",
      ],
      answerIndex: 1,
      explanation:
        "strictNullChecks makes null/undefined their own types (killing \"possibly null\" bugs at compile time); noImplicitAny forces you to type (or consciously escape) every parameter — together they convert TS from autocomplete to safety net.",
    },
    {
      id: "d6-q4",
      question: "Why use `import type { Todo } from \"./types\"` instead of a plain import?",
      options: [
        "It imports the types faster",
        "The import is fully erased at compile time, guaranteeing no runtime import remains",
        "It allows importing private members",
        "It makes the types readonly",
      ],
      answerIndex: 1,
      explanation:
        "Type-only imports are guaranteed to vanish from the emitted JavaScript — useful for circular dependency situations and clarity about what is runtime vs compile-time.",
    },
    {
      id: "d6-q5",
      question: "You install `express` but forget `@types/express`. What happens?",
      options: [
        "Importing express fails at runtime",
        "TypeScript types it as `any` and flags \"Could not find a declaration file\" for the module",
        "The dev server refuses to start",
        "Express stops working in production",
      ],
      answerIndex: 1,
      explanation:
        "Without declarations the module silently degrades to any — imports still run fine, you just lose all checking. Install @types/express (or a shim) to restore it.",
    },
  ],
  practice: {
    intro:
      "The plan's capstone build: a small class-based TodoService split across files. Do it in your editor with real files (that's the point of today); use the Playground to prototype each file's logic single-file first.",
    steps: [
      "Create `types.ts` exporting `Todo` (id, title, done, readonly createdAt) and `TodoFilter = \"all\" | \"active\" | \"done\"`.",
      "Create `todo-service.ts` with `TodoService` — constructor takes a seed array (use the parameter-property shorthand), with methods `add(title)`, `toggle(id)`, `filter(kind)`, and a `get count` getter.",
      "Make `add` throw on empty titles; make `toggle` return boolean (found or not).",
      "Create `index.ts` re-exporting both files' public surface.",
      "Create `main.ts` importing from the barrel, run the full flow with `tsx main.ts`.",
      "Break it: mark `filter` param as `any` and notice noImplicitAny's error; access a private member from main.ts; forget `super()` in a subclass if you make one.",
    ],
    starter: `// Day 6 practice — prototype the service here single-file,
// then split it into real files in your editor.

interface Todo {
  id: number
  title: string
  done: boolean
}

type TodoFilter = "all" | "active" | "done"

class TodoService {
  // constructor parameter properties + private seed
  // add / toggle / filter / count getter
}

const service = new TodoService([])
console.log(service)`,
    solution: `// Day 6 practice — reference solution
// (split: types.ts | todo-service.ts | index.ts | main.ts)

interface Todo {
  id: number
  title: string
  done: boolean
  readonly createdAt: string
}

type TodoFilter = "all" | "active" | "done"

class TodoService {
  private nextId = 1

  constructor(private todos: Todo[] = []) {}

  add(title: string): Todo {
    if (!title.trim()) throw new Error("title required")
    const todo: Todo = {
      id: this.nextId++,
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    }
    this.todos.push(todo)
    return todo
  }

  toggle(id: number): boolean {
    const todo = this.todos.find((t) => t.id === id)
    if (!todo) return false
    todo.done = !todo.done
    return true
  }

  filter(kind: TodoFilter): Todo[] {
    switch (kind) {
      case "active": return this.todos.filter((t) => !t.done)
      case "done": return this.todos.filter((t) => t.done)
      default: return [...this.todos]
    }
  }

  get count(): number {
    return this.todos.length
  }
}

const service = new TodoService()
service.add("Learn types")
service.add("Learn generics")
service.toggle(1)

console.log(service.filter("done"))   // the completed one
console.log(service.filter("active")) // the open one
console.log(service.count)            // 2

// --- file split for your editor ---
// types.ts:            Todo + TodoFilter
// todo-service.ts:     import type { Todo, TodoFilter } from "./types"
// index.ts:            export * from "./types"; export { TodoService } from "./todo-service"
// main.ts:             import { TodoService } from "./index"; run with \`tsx main.ts\``,
    solutionNote:
      "Everything from the week shows up here: parameter properties, literal unions, a discriminated filter switch, readonly on createdAt, and the barrel re-export pattern.",
  },
};
