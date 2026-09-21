import type { Day } from "./types";

export const day5: Day = {
  id: 5,
  title: "Utility & Mapped Types",
  subtitle: "Stop re-declaring variations of the same shape — derive them instead",
  hours: "~2.5 hours",
  goal: "Derive UserUpdate, UserPreview, and UserMap from a single User interface using built-in utility types — and read other people's mapped/conditional types without fear.",
  icon: "wand",
  intro: [
    "Real codebases never declare every shape by hand. A patch payload is the model with all fields optional. A list item is the model minus the heavy fields. A lookup table is the model keyed by id. TypeScript ships ~20 built-in utility types that compute these variations from one source of truth, so a field added to the model automatically appears in every derived shape.",
    "Today you learn the high-frequency seven (Partial, Required, Readonly, Pick, Omit, Record, plus the function-reflection trio) and just enough of mapped/conditional types to read other people's code — exactly the depth the plan prescribes: recognize, don't reconstruct.",
  ],
  sections: [
    {
      id: "d5-partial-family",
      title: "Partial, Required, Readonly",
      minutes: 30,
      paragraphs: [
        "These three transform *modifiability*. `Partial<T>` makes every property optional — the exact shape of an update/patch payload. `Required<T>` is its inverse, useful when a wider type allowed optionals but your code path demands them all. `Readonly<T>` makes every property readonly — perfect for function parameters you must not mutate or for frozen state objects.",
        "The mental model that makes all of Day 5 easy: each utility is a function from type → type. You feed it one shape, it returns a computed shape. No new fields, no new facts — just a systematic transformation of the source type.",
      ],
      examples: [
        {
          title: "Partial<T> — the patch pattern",
          variant: "good",
          code: `interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string
}

// Without Partial you would redeclare with ? everywhere.
// With Partial — one word:
type UserUpdate = Partial<User>

function updateUser(id: number, patch: UserUpdate): void {
  // every field may be present or absent
  console.log(\`updating #\${id} with\`, patch)
}

updateUser(1, { name: "Ada L." })            // just a rename
updateUser(2, { email: "g@example.com" })    // just an email

// Required is the reverse — useful for config that MUST be complete:
type CompleteUser = Required<User>  // avatarUrl now required too
const full: CompleteUser = {
  id: 1, name: "ada", email: "a@example.com", avatarUrl: "/a.png",
}

console.log(full)`,
          output: `updating #1 with { name: 'Ada L.' }
updating #2 with { email: 'g@example.com' }
{ id: 1, name: 'ada', email: 'a@example.com', avatarUrl: '/a.png' }`,
        },
        {
          title: "Readonly<T> — immutability by convention",
          variant: "good",
          code: `type FrozenUser = Readonly<User>

function display(user: FrozenUser): string {
  // user.name = "hacked"
  // error TS2540: Cannot assign to 'name' because it is a read-only property.
  return \`\${user.name} <\${user.email}>\`
}

const frozen: FrozenUser = { id: 1, name: "ada", email: "a@x.com" }
console.log(display(frozen))`,
          output: "ada <a@x.com>",
          caption:
            "Readonly is compile-time only — the runtime object is still mutable JavaScript. Deep immutability needs a recursive mapped type (libraries ship `DeepReadonly`) or Object.freeze at runtime.",
        },
      ],
      keyPoints: [
        "`Partial<T>` = all properties optional — the patch/update payload shape.",
        "`Required<T>` and `Readonly<T>` are its siblings: inverse and freezing.",
        "All three are computed from the source: add a field to User, and it appears in UserUpdate automatically.",
      ],
      callouts: [
        {
          kind: "interview",
          title: "Interview question #7 is literally this section",
          body: "\"Explain Partial, Pick, Omit, Record\" — say what each transforms and give the one-line use case: patch payloads, field subsets, field removal, lookup tables.",
        },
      ],
    },
    {
      id: "d5-subsetting",
      title: "Pick, Omit, Record",
      minutes: 30,
      paragraphs: [
        "These transform *membership*. `Pick<T, K>` keeps only the listed keys — a preview/list-item shape carved out of a bigger model. `Omit<T, K>` is the inverse — drop the listed keys (great for \"the model minus the id you will generate server-side\"). `Record<K, V>` builds an object type with keys K and values V — the canonical lookup-table type, and a strict upgrade from the loose `{ [key: string]: V }`.",
        "Pick and Omit are just conveniences — each could be written by hand, but the utility version stays synchronized with the model. Record shines with literal-union keys: `Record<\"http\" | \"https\", number>` describes an object that MUST have exactly those two keys.",
      ],
      examples: [
        {
          title: "Pick and Omit — carving shapes",
          variant: "good",
          code: `interface User {
  id: number
  name: string
  email: string
  passwordHash: string
  lastLoginAt: string
}

// A list row: light fields only
type UserPreview = Pick<User, "id" | "name">

// A create-payload: everything except the server-generated id
type CreateUser = Omit<User, "id" | "lastLoginAt">

const preview: UserPreview = { id: 1, name: "ada" }
const payload: CreateUser = {
  name: "ada",
  email: "a@example.com",
  passwordHash: "…",
}

console.log(preview, payload)`,
          output: `{ id: 1, name: 'ada' } { name: 'ada', email: 'a@example.com', passwordHash: '…' }`,
        },
        {
          title: "Record — strict lookup tables",
          variant: "good",
          code: `type Endpoint = "users" | "posts" | "comments"

// Keys must be EXACTLY these three, values must be numbers:
const rateLimits: Record<Endpoint, number> = {
  users: 60,
  posts: 30,
  comments: 120,
  // admin: 999 — error: not in the key union
  // missing posts — error too: every key required
}

// Compare the loose index-signature version — no key checking at all:
const loose: { [key: string]: number } = { anything: 1 }

console.log(rateLimits.posts, loose.anything)`,
          output: "30 1",
          caption:
            "Record with a literal-union key gives you exhaustive, typo-proof key sets. This is also exactly what Day 4's `keyof typeof endpoints` sets up.",
        },
        {
          title: "Combining utilities — the real power",
          variant: "good",
          code: `interface User {
  id: number
  name: string
  email: string
  passwordHash: string
}

// A client-side user map keyed by id — three utilities, one line:
type UserMap = Record<number, Pick<User, "id" | "name" | "email">>

const users: UserMap = {
  1: { id: 1, name: "ada", email: "a@example.com" },
  2: { id: 2, name: "grace", email: "g@example.com" },
}

function lookup(map: UserMap, id: number): Pick<User, "id" | "name" | "email"> | undefined {
  return map[id]
}

console.log(lookup(users, 1)?.name)`,
          output: "ada",
        },
      ],
      keyPoints: [
        "`Pick<T, K>` keeps listed keys; `Omit<T, K>` drops them — subsets from a single source of truth.",
        "`Record<K, V>` = object with keys K and values V; with literal unions the key set is exhaustive and typo-proof.",
        "Utilities compose: `Record<number, Pick<User, ...>>` reads inside-out like nested function calls.",
      ],
    },
    {
      id: "d5-function-reflection",
      title: "ReturnType, Parameters, NonNullable, Awaited",
      minutes: 25,
      paragraphs: [
        "These four reflect on *functions and async values*, deriving types from code that already exists. `ReturnType<F>` extracts what a function returns — ideal when a factory function is the source of truth and you don't want to re-declare its result type. `Parameters<F>` extracts the parameter tuple. `NonNullable<T>` strips null/undefined from a union — the type-level equivalent of `??`. `Awaited<T>` unwraps a Promise (any nesting) to its resolution type.",
        "These shine in React/Node work: typing state initialized from a function's result, wrapping a handler's params, or typing `await` results when a promise's type is computed rather than literal.",
      ],
      examples: [
        {
          title: "Deriving instead of declaring",
          variant: "good",
          code: `function createUser(name: string, email: string) {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    createdAt: new Date().toISOString(),
  }
}

type User = ReturnType<typeof createUser>          // the whole object
type NewUserParams = Parameters<typeof createUser>  // [name: string, email: string]

const [name, email]: NewUserParams = ["ada", "a@example.com"]
console.log(name, email)`,
          output: "ada a@example.com",
          caption:
            "`ReturnType<typeof createUser>` — note the lowercase typeof turning a runtime value into its type, exactly as Day 4 taught. Change the function, the User type follows automatically.",
        },
        {
          title: "NonNullable and Awaited",
          variant: "good",
          code: `type MaybeName = string | null | undefined
type Name = NonNullable<MaybeName>   // string

// Awaited unwraps any promise nesting:
type Deep = Awaited<Promise<Promise<string>>>  // string

async function fetchUser() {
  return { id: 1, name: "ada" }
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>> // { id: number; name: string }

declare const user: FetchedUser
console.log(user.id, user.name, null ?? "fallback", undefined ?? "fallback")`,
          output: "1 ada fallback fallback",
        },
      ],
      keyPoints: [
        "`ReturnType<typeof fn>` / `Parameters<typeof fn>` — types derived from actual functions, never re-declared.",
        "`NonNullable<T>` strips null and undefined at the type level.",
        "`Awaited<T>` unwraps promises — `Awaited<ReturnType<typeof fetcher>>` types async results.",
      ],
    },
    {
      id: "d5-indexed-access",
      title: "Indexed access types — User[\"name\"]",
      minutes: 20,
      paragraphs: [
        "Square brackets on a type extract one property's type: `User[\"email\"]` is `string`. This works on interfaces, on unions (`T[K]` from Day 4), and even on arrays — `User[]` indexed by `number` yields `User`. Combined with `keyof`, you can express \"the union of all field types\" as `User[keyof User]`.",
        "Where it earns its keep: drilling into nested config types, pulling the element type out of an array-typed value (`typeof items[number]`), and building precise return types for getters.",
      ],
      examples: [
        {
          title: "Type-level property access",
          variant: "good",
          code: `interface User {
  id: number
  name: string
  tags: string[]
}

type UserId = User["id"]               // number
type UserTags = User["tags"]           // string[]
type UserTag = User["tags"][number]    // string — element of the array
type AnyUserValue = User[keyof User]   // number | string | string[]

// The runtime twin of this pattern (typeof value[number]):
const items = ["a", "b"]
type Item = typeof items[number]       // "a" | "b" (literal with as const)

declare const id: UserId
declare const tag: UserTag
console.log(id, tag)`,
          output: "(types only — this snippet has no runtime output of its own)",
        },
      ],
      keyPoints: [
        "`T[\"prop\"]` extracts a single property type; `T[keyof T]` unions all property types.",
        "`T['arrayProp'][number]` gets the element type of an array property.",
        "Same square-bracket mental model as runtime access — but at the type level.",
      ],
    },
    {
      id: "d5-mapped-conditional",
      title: "Just enough: mapped types and conditional types",
      minutes: 30,
      paragraphs: [
        "This section is deliberately recognition-level, per the plan: don't go deep on complex conditional types — you mostly need to READ them in other people's code. A mapped type loops over keys: `{ [K in keyof T]: ... }` is the for-loop of the type system — it is literally how Partial is implemented. A conditional type branches: `T extends U ? X : Y` reads as an if/else at the type level.",
        "You will encounter these in library `.d.ts` files constantly: `Partial<T> = { [K in keyof T]?: T[K] }`, `Awaited` implemented with recursion, `Exclude` with a conditional. Knowing the two shapes below converts intimidating library types into readable code.",
      ],
      examples: [
        {
          title: "The two shapes to recognize",
          variant: "good",
          code: `// 1) MAPPED TYPE — a for-loop over keys:
type MyPartial<T> = {
  [K in keyof T]?: T[K]     // for each key K of T, keep it but optional
}

// (that's the real implementation of Partial, minus modifiers)

type MyGetters<T> = {
  [K in keyof T]: () => T[K]  // wrap every field in a getter function
}

interface Point { x: number; y: number }
declare const p: MyGetters<Point>
console.log(p.x().toFixed(1)) // number — a getter returning number

// 2) CONDITIONAL TYPE — an if/else on types:
type IsString<T> = T extends string ? true : false

type A = IsString<"hello">  // true
type B = IsString<42>       // false

// The distributive behavior that explains Exclude:
type ExcludeId<T> = T extends "id" ? never : T
type Fields = ExcludeId<"id" | "name" | "email">  // "name" | "email"`,
          caption:
            "Mapped = loop, conditional = branch, `never` in a branch = \"remove this member\". With those three facts, most library types become readable.",
        },
        {
          title: "A hand-rolled utility (for reading confidence)",
          variant: "neutral",
          code: `// Read this slowly — every piece is now familiar:
type NullableFields<T> = {
  [K in keyof T]: T[K] | null       // mapped loop
}

interface Config {
  host: string
  port: number
}

type LooseConfig = NullableFields<Config>
// Result: { host: string | null; port: number | null }

declare const config: LooseConfig
const port = config.port ?? 8080   // nullish coalescing pairs naturally
console.log(port)`,
          output: "8080",
        },
      ],
      keyPoints: [
        "Mapped type `{ [K in keyof T]: X }` = per-key loop; it's how Partial/Pick/Record are built.",
        "Conditional `T extends U ? X : Y` = type-level if/else; `never` in a branch removes that member.",
        "Goal: recognition, not reconstruction. Do not chase template literal types or deep recursion — the plan explicitly parks them.",
      ],
      callouts: [
        {
          kind: "warning",
          title: "The rabbit hole the plan warns about",
          body: "Complex conditional types, template literal types, and decorators rarely appear in junior/mid interviews. If you can read the two shapes above, you have exactly enough — go practice Day 6 classes instead.",
        },
      ],
    },
  ],
  quiz: [
    {
      id: "d5-q1",
      question: "Which utility type would you use for a PATCH endpoint's request body?",
      options: ["Readonly<User>", "Partial<User>", "Record<User, string>", "Required<User>"],
      answerIndex: 1,
      explanation:
        "A patch sends only the fields being changed — every property optional is exactly `Partial<User>`. (Often combined as `Partial<Pick<User, \"name\" | \"email\">>>` when only some fields are patchable.)",
    },
    {
      id: "d5-q2",
      question: "`type X = Omit<User, \"id\">` produces…",
      options: [
        "User with id required and everything else optional",
        "User minus the id property",
        "Only the id property",
        "An error — Omit must be given a union of all keys",
      ],
      answerIndex: 1,
      explanation:
        "Omit drops the listed keys. Keeping only listed keys is Pick. Omit is the natural fit for create-payloads where the server generates the id.",
    },
    {
      id: "d5-q3",
      question: "What is the difference between `Record<\"a\" | \"b\", number>` and `{ [key: string]: number }`?",
      options: [
        "No difference — Record is just shorter syntax",
        "Record requires exactly the keys \"a\" and \"b\" (all present, no extras); the index signature accepts any string key",
        "Record works only at runtime",
        "The index signature is stricter",
      ],
      answerIndex: 1,
      explanation:
        "Record with a literal-union key set is exhaustive: missing keys and unknown keys are both compile errors. The index signature is the loose, permissive spelling.",
    },
    {
      id: "d5-q4",
      question: "`type R = ReturnType<typeof createUser>` — what does R describe?",
      options: [
        "The literal string \"createUser\"",
        "The type of createUser's parameters",
        "The type of the value createUser returns",
        "A Promise of the return type",
      ],
      answerIndex: 2,
      explanation:
        "ReturnType extracts the return type of a function type. For async functions you need `Awaited<ReturnType<typeof fn>>` because the raw return type is a Promise.",
    },
    {
      id: "d5-q5",
      question: "Reading `{ [K in keyof T]?: T[K] }` — what is it?",
      options: [
        "A conditional type that returns T or never",
        "A mapped type making every T property optional — the essence of Partial",
        "An indexed access type",
        "A generic class declaration",
      ],
      answerIndex: 1,
      explanation:
        "`[K in keyof T]` is the mapped-type loop; the `?` modifier makes each property optional and `T[K]` keeps its type — which is precisely how Partial<T> is implemented.",
    },
  ],
  practice: {
    intro:
      "The plan's exact exercise: one User interface, three derived types, zero duplicated properties. Do it in the Playground and print values from each derived shape to feel the compiler enforcing the transformations.",
    steps: [
      "Define `User` with: id, name, email, passwordHash, avatarUrl (optional), createdAt (readonly).",
      "Derive `UserUpdate = Partial<User>` — verify you can construct `{ name: \"New\" }` and nothing else that isn't a User field.",
      "Derive `UserPreview = Pick<User, \"id\" | \"name\">` and `CreateUser = Omit<User, \"id\" | \"createdAt\">`.",
      "Derive `UserMap = Record<number, UserPreview>` and build a two-entry map; write `getUser(map, id): UserPreview | undefined`.",
      "Break each on purpose: add an unknown key to UserUpdate, miss a key in UserMap, assign passwordHash into UserPreview. Read all three errors.",
    ],
    starter: `// Day 5 practice — derive, don't redeclare

interface User {
  id: number
  name: string
  email: string
  passwordHash: string
  avatarUrl?: string
  readonly createdAt: string
}

type UserUpdate = /* Partial<...> */
type UserPreview = /* Pick<...> */
type CreateUser = /* Omit<...> */
type UserMap = /* Record<...> */

const update: UserUpdate = { name: "Ada L." }

console.log(update)`,
    solution: `// Day 5 practice — reference solution

interface User {
  id: number
  name: string
  email: string
  passwordHash: string
  avatarUrl?: string
  readonly createdAt: string
}

type UserUpdate = Partial<User>
type UserPreview = Pick<User, "id" | "name">
type CreateUser = Omit<User, "id" | "createdAt">
type UserMap = Record<number, UserPreview>

const update: UserUpdate = { name: "Ada L." }
const preview: UserPreview = { id: 1, name: "ada" }
const payload: CreateUser = {
  name: "ada",
  email: "ada@example.com",
  passwordHash: "secret",
}

const users: UserMap = {
  1: { id: 1, name: "ada" },
  2: { id: 2, name: "grace" },
}

function getUser(map: UserMap, id: number): UserPreview | undefined {
  return map[id]
}

console.log(update)
console.log(preview, payload)
console.log(getUser(users, 2))
console.log(getUser(users, 99) ?? "not found")`,
    solutionNote:
      "Adding a field to User tomorrow — it flows into UserUpdate and CreateUser automatically, and UserPreview only changes if you add it to the Pick list. That is the whole maintenance argument for utility types.",
  },
};
