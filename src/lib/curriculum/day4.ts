import type { Day } from "./types";

export const day4: Day = {
  id: 4,
  title: "Generics",
  subtitle: "Write code once that works for every type — with full type safety intact",
  hours: "~3 hours",
  goal: "Read and write generic functions and classes, use constraints, and understand keyof/typeof — the backbone of every TS library you will use.",
  icon: "boxes",
  intro: [
    "Generics are types as parameters. Instead of writing `wrapString(s: string): string[]` and `wrapNumber(n: number): number[]`, you write one function `wrap<T>(x: T): T[]` and the caller's argument decides T. Generics are what let `Array.map`, `Promise.then`, and every ORM be both generic AND fully typed.",
    "Today you will build from the identity function up to `getProp<T, K extends keyof T>` — by the end, the signatures of utility libraries will read like plain English instead of noise.",
  ],
  sections: [
    {
      id: "d4-why-generics",
      title: "Why generics exist",
      minutes: 20,
      paragraphs: [
        "The problem generics solve: code that must work for many types without knowing which. Two bad options exist — `any` (loses all checking) and copy-pasting per-type versions (maintenance nightmare). The third option: a type parameter, written between angle brackets, that the caller fills in at each call site.",
        "Type parameters are conventionally named T (Type), K (Key), V (Value), E (Element), or descriptive names like `TResult` in bigger signatures. Unlike `any`, a generic T preserves the relationship between input and output types — that relationship is the entire value.",
      ],
      examples: [
        {
          title: "The problem, then the fix",
          variant: "good",
          code: `// Without generics — the two bad options:

function firstAny(arr: any[]): any {   // option 1: any — no checking
  return arr[0]
}

function firstNumber(arr: number[]): number {  // option 2: copy-paste
  return arr[0]
}
function firstString(arr: string[]): string {
  return arr[0]
}

// With generics — one function, full safety:

function first<T>(arr: T[]): T {
  return arr[0]
}

const n = first([1, 2, 3])          // n: number (T inferred as number)
const s = first(["a", "b"])         // s: string
n.toUpperCase()                     // error: number has no toUpperCase

console.log(n + 1, s + "!")`,
          output: "2 a!",
          caption:
            "Watch the types: `n` is number and `s` is string without any annotation at the call site — inference filled in T from the argument.",
        },
      ],
      keyPoints: [
        "A type parameter T is a placeholder the caller's argument fills in — types become arguments too.",
        "Generics preserve input↔output type relationships; `any` destroys them.",
        "Conventional names: T, K, V, E, or descriptive TResult when signatures get long.",
      ],
    },
    {
      id: "d4-generic-functions",
      title: "Generic functions",
      minutes: 30,
      paragraphs: [
        "The generic identity function `identity<T>(x: T): T` from every textbook is trivial, but real generic functions do useful work: wrapping API calls, memoizing, creating typed event maps, retrying async operations. Inference usually deduces T from arguments; you can also specify it explicitly when the call is ambiguous, like `useState<string>(...)` (you will meet exactly that in React on Day 7).",
        "Multiple type parameters are fine — `function pick<T, K extends keyof T>(obj: T, key: K)` — and arrow function generics use the same angle bracket syntax with a small JSX quirk: in `.tsx` files write `<T,>` or `<T extends unknown>` to help the parser distinguish generics from JSX tags.",
      ],
      examples: [
        {
          title: "Realistic generic helpers",
          variant: "good",
          code: `function identity<T>(x: T): T {
  return x
}

// Retry any async operation, preserving its return type:
async function retry<T>(fn: () => Promise<T>, times: number): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i >= times - 1) throw e
    }
  }
}

const user = await retry(() => fetchUser(), 3) // user: User, retries included

declare function fetchUser(): Promise<{ id: number; name: string }>
console.log(identity("kept"), identity(42))`,
          output: "kept 42",
          caption:
            "`retry<T>` keeps the promise's resolution type through all the failure logic — that is the relationship-preserving power of generics.",
        },
        {
          title: "Inference vs explicit type arguments",
          variant: "neutral",
          code: `function pairs<K, V>(entries: [K, V][]): Map<K, V> {
  return new Map(entries)
}

// Inferred: K=string, V=number from the argument
const scores = pairs([["ada", 90], ["grace", 95]])
const ada = scores.get("ada") // number | undefined

// Explicit: when the value alone can't decide
function emptyList<T>(): T[] { return [] }
const names = emptyList<string>() // T can't be inferred — must say it

const bare: Array<string | number> = [1, "a"] // Array<T> is a generic too`,
        },
      ],
      keyPoints: [
        "T is usually inferred from arguments; specify it explicitly only when inference can't know (`emptyList<string>()`).",
        "Generics flow through async code: `retry<T>` returns `Promise<T>`, not `Promise<any>`.",
        "In .tsx files, write arrow generics as `<T,>` to avoid the JSX parsing ambiguity.",
      ],
    },
    {
      id: "d4-generic-structures",
      title: "Generic interfaces and classes",
      minutes: 30,
      paragraphs: [
        "Interfaces and classes take type parameters too — `interface Box<T> { value: T }`, `class Stack<T>`. One declaration then yields infinitely many concrete types: `Box<string>`, `Box<User>`, `Stack<number>`. You already use these daily: `Array<T>`, `Promise<T>`, `Map<K, V>`, `Set<T>` are all generic interfaces from the standard library.",
        "Default type parameters (`<T = string>`) work like function defaults — used when the caller omits the parameter. Generics on classes interact with access modifiers exactly like Day 6 covers; today focus on the type-parameter mechanics.",
      ],
      examples: [
        {
          title: "Generic interface + class",
          variant: "good",
          code: `interface Box<T> {
  value: T
  isEmpty(): boolean
}

class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items.at(-1)
  }

  get size(): number {
    return this.items.length
  }
}

const stack = new Stack<number>()   // could omit <number>: inferred from usage
stack.push(1)
stack.push(2)
stack.push(3)

console.log(stack.pop(), stack.peek(), stack.size)`,
          output: "3 2 2",
        },
        {
          title: "The standard library is generic",
          variant: "neutral",
          code: `const scores: Map<string, number> = new Map()
scores.set("ada", 90)

const done: Promise<string> = Promise.resolve("ok")

const unique: Set<number> = new Set([1, 1, 2, 3])

// Arrays ARE generic: Array<T> === T[]
const names: Array<string> = ["ada"]

async function main() {
  const text: string = await done  // awaited -> unwraps Promise<string>
  console.log(text, [...unique], [...scores])
}

main()`,
          output: "ok [ 1, 2, 3 ] [ [ 'ada', 90 ] ]",
        },
      ],
      keyPoints: [
        "`Stack<T>` is ONE class, infinitely many types — `Stack<number>` and `Stack<User>` are incompatible with each other, which is correct.",
        "`Array`, `Promise`, `Map`, `Set` are generic interfaces you already use.",
        "Defaults (`interface Result<T, E = Error>`) fill in when the caller omits a parameter.",
      ],
    },
    {
      id: "d4-constraints",
      title: "Constraints with extends",
      minutes: 30,
      paragraphs: [
        "Unconstrained T is maximally generic but minimally useful — inside the function you can barely do anything with a T. A constraint `<T extends SomeType>` narrows what callers may pass and what you may do inside. The most common constraint in real code is `T extends { length: number }` (anything measurable) and `K extends keyof T` (a real key of the object — next section).",
        "Constraints are how library signatures express requirements without losing precision: `function longest<T extends { length: number }>(a: T, b: T): T` accepts strings, arrays, and any object with length, and returns the same type it was given.",
      ],
      examples: [
        {
          title: "Constrained generics",
          variant: "good",
          code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

console.log(longest("abc", "abcdef"))   // string context
console.log(longest([1, 2], [1, 2, 3])) // array context

// Without the constraint this would NOT compile:
// function bad<T>(a: T, b: T) { return a.length >= b.length ? a : b }
// error TS2339: Property 'length' does not exist on type 'T'.`,
          output: "abcdef\n[ 1, 2, 3 ]",
        },
        {
          title: "What constraints reject",
          variant: "bad",
          code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

longest(10, 20)`,
          tsError:
            "error TS2344/'2345': Type 'number' does not satisfy the constraint '{ length: number }'.",
          caption:
            "Numbers have no .length, so they are not assignable to the constraint. The error appears at the CALL SITE — the constraint is documentation the compiler enforces.",
        },
        {
          title: "keyof constraint — the crown jewel",
          variant: "good",
          code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { id: 1, name: "ada", active: true }

const id = getProp(user, "id")       // number — from T[K]
const name = getProp(user, "name")   // string
const typo = getProp(user, "nmae")   // error: not a key!
// error TS2345: Argument of type '"nmae"' is not assignable
// to parameter of type '"id" | "name" | "active".'

console.log(id, name)`,
          output: "1 ada",
          caption:
            "This signature is worth memorizing: it powers type-safe getters, pickers, and half the utility types in the standard library. The return type `T[K]` is an indexed access type (Day 5).",
        },
      ],
      keyPoints: [
        "`<T extends Shape>` limits allowed arguments AND unlocks Shape's members inside the body.",
        "`K extends keyof T` accepts only real keys of T, with full literal autocompletion.",
        "Constrained + inference means calls stay annotation-free while staying exact.",
      ],
      callouts: [
        {
          kind: "interview",
          title: "Interview question #14",
          body: "\"What is keyof?\" — keyof T produces the union of T's property names; combined with `K extends keyof T` it makes property access type-safe. `typeof` (lowercase) is its mirror: it derives the TYPE of a runtime VALUE. You will rehearse both on Day 7.",
        },
      ],
    },
    {
      id: "d4-keyof-typeof",
      title: "keyof and typeof — deriving types from code",
      minutes: 25,
      paragraphs: [
        "TypeScript can compute types from your existing code instead of forcing you to restate facts. `keyof T` turns a type's property names into a string-literal union. `typeof someValue` (lowercase, type-level) turns a runtime value's inferred type into a named type you can reuse. Together they eliminate a whole class of duplication: change the object, every derived type updates automatically.",
        "The killer combo: `keyof typeof config` — derive the key union directly from a config object. One source of truth, zero drift. This pattern appears constantly in real codebases for event maps, env validation, and route constants.",
      ],
      examples: [
        {
          title: "Types computed from values",
          variant: "good",
          code: `const endpoints = {
  users: "/api/users",
  posts: "/api/posts",
  comments: "/api/comments",
} as const

type EndpointKey = keyof typeof endpoints  // "users" | "posts" | "comments"
type EndpointPath = typeof endpoints.users // "/api/users" (literal type)

function fetchEndpoint(key: EndpointKey): string {
  return \`GET \${endpoints[key]}\`
}

console.log(fetchEndpoint("posts"))  // autocomplete for all three
// fetchEndpoint("admin") — error: not one of the keys`,
          output: "GET /api/posts",
          caption:
            "`as const` freezes the values into literal types so the derived types stay exact. Without it, `EndpointPath` would widen to plain `string`.",
        },
        {
          title: "keyof on interfaces",
          variant: "neutral",
          code: `interface User {
  id: number
  name: string
  email: string
}

type UserKey = keyof User        // "id" | "name" | "email"

function getValue(user: User, key: UserKey): string | number {
  return user[key]              // string | number — the union of all field types
}

// With generics you get the EXACT field type back (T[K]) — see getProp above.`,
        },
      ],
      keyPoints: [
        "`keyof T` = union of property names. `typeof value` = type of a runtime value.",
        "`as const` keeps derived types literal instead of widened to string.",
        "`keyof typeof obj` = one source of truth: object and key-union can never drift apart.",
      ],
    },
  ],
  quiz: [
    {
      id: "d4-q1",
      question: "What is the type of `x` in `const x = first([true, false])` where `function first<T>(arr: T[]): T`?",
      options: ["any", "boolean", "boolean[]", "unknown"],
      answerIndex: 1,
      explanation:
        "T is inferred as boolean from the array element type, and the return type T therefore resolves to boolean — the input↔output relationship survives the call.",
    },
    {
      id: "d4-q2",
      question: "Why does `function bad<T>(a: T) { return a.length }` fail to compile?",
      options: [
        "Because T cannot be used as a parameter type",
        "Because unconstrained T has no known members — nothing is guaranteed to have .length",
        "Because .length only exists on arrays",
        "Because generic functions cannot return values",
      ],
      answerIndex: 1,
      explanation:
        "An unconstrained T could be a number, a boolean, anything — and TypeScript only allows operations guaranteed for ALL possible T. Constrain it with `T extends { length: number }` to unlock .length.",
    },
    {
      id: "d4-q3",
      question: "In `getProp<T, K extends keyof T>(obj: T, key: K): T[K]`, what does `T[K]` mean?",
      options: [
        "An array of K elements",
        "The type of the specific property at key K — indexed access",
        "A tuple of T and K",
        "The key K as a string",
      ],
      answerIndex: 1,
      explanation:
        "T[K] (indexed access type) resolves to the type of obj[key] for the EXACT key you passed: getProp(user, \"id\") returns number, getProp(user, \"name\") returns string.",
    },
    {
      id: "d4-q4",
      question: "What does `keyof typeof endpoints` compute, given `const endpoints = { users: \"/api/users\", posts: \"/api/posts\" } as const`?",
      options: [
        "string",
        "\"users\" | \"posts\"",
        "The object's value types: \"/api/users\" | \"/api/posts\"",
        "An error — keyof needs an interface",
      ],
      answerIndex: 1,
      explanation:
        "typeof endpoints gets the object's type; keyof then extracts its keys as a literal union. The VALUES union would be `typeof endpoints[keyof typeof endpoints]`.",
    },
    {
      id: "d4-q5",
      question: "`new Stack<number>()` and `new Stack<string>()` produce…",
      options: [
        "The same type — generics are erased so all Stacks are identical",
        "Two distinct instantiations; pushing a string onto a Stack<number> is an error",
        "Runtime classes with separate definitions",
        "any-typed stacks",
      ],
      answerIndex: 1,
      explanation:
        "One class, many instantiations — each type argument produces a distinct static type. At runtime the type parameters are erased (both are just Stack), but the compiler keeps them incompatible, which prevents cross-contamination of element types.",
    },
  ],
  practice: {
    intro:
      "The plan's trio: a generic function, a generic class, and the keyof-constrained getter. Type them all by hand in the Playground — generics only click when you write them.",
    steps: [
      "Write `getFirst<T>(arr: T[]): T` that returns `arr[0]` (think about what happens for empty arrays — `T | undefined` is the honest answer with noUncheckedIndexedAccess).",
      "Build `Stack<T>` with push, pop, peek, and size — then instantiate it for numbers and strings and verify the compiler stops cross-type pushes.",
      "Write `getProp<T, K extends keyof T>(obj: T, key: K): T[K]` and call it with a real object; try a typo'd key and read the error.",
      "Stretch: write `pluck<T, K extends keyof T>(items: T[], key: K): T[K][]` that maps an array of objects to an array of one field — e.g. pluck(users, \"email\").",
      "Break it: remove the extends constraint from getProp and watch the body stop compiling; add it back.",
    ],
    starter: `// Day 4 practice — generics

function getFirst<T>(arr: T[]): T {
  // implement
  return arr[0]
}

class Stack<T> {
  private items: T[] = []
  // push, pop, peek, size
}

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  // implement
  return obj[key]
}

const user = { id: 1, name: "ada", email: "ada@example.com" }

console.log(getFirst([10, 20]))
console.log(getProp(user, "name"))`,
    solution: `// Day 4 practice — reference solution

function getFirst<T>(arr: T[]): T {
  return arr[0]
}

class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items.at(-1)
  }

  get size(): number {
    return this.items.length
  }
}

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

const user = { id: 1, name: "ada", email: "ada@example.com" }
const users = [
  { id: 1, name: "ada", email: "ada@example.com" },
  { id: 2, name: "grace", email: "grace@example.com" },
]

const numbers = new Stack<number>()
numbers.push(1)
numbers.push(2)
// numbers.push("3")  // error: Argument of type 'string' is not
//                    // assignable to parameter of type 'number'.

console.log(getFirst([10, 20]))       // 10
console.log(numbers.pop(), numbers.size) // 2 1
console.log(getProp(user, "name"))    // ada
console.log(pluck(users, "email"))    // ["ada@example.com", "grace@example.com"]`,
    solutionNote:
      "Notice `pluck` is getProp applied across an array — this is how libraries like lodash-es are typed. The constraint is doing all the work: without it, `item[key]` would not compile.",
  },
};
