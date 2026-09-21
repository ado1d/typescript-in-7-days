import type { InterviewQuestion } from "./types";

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "iq-1",
    number: 1,
    category: "Basics",
    question: "What is TypeScript, and why use it over JavaScript?",
    shortAnswer:
      "TypeScript is JavaScript plus a static type system that is fully erased at compile time. Use it because entire bug classes (typos in property names, wrong argument types, null/undefined misuse) are caught before the code runs, and because types power editor features like autocomplete and safe refactoring across a codebase.",
    detail: [
      "The elevator pitch: TypeScript is a compile-time safety net for JavaScript — the same language, same runtime, with types the compiler checks and then deletes. It scales with you: a 200-line script gains a little, a 200,000-line codebase gains a lot, because refactors stay safe and new developers get autocomplete as documentation.",
      "Strong answers mention what TS does NOT do: it does not validate runtime data (an API can still send the wrong shape — that is Zod/validation's job), and it does not change performance (the emitted JS is standard).",
    ],
    code: `// JS: this ships and crashes for a user
const user = getUser()
console.log(user.nmae.toUpperCase())

// TS: caught before you even save
// error TS2551: Property 'nmae' does not exist.
// Did you mean 'name'?`,
    gotcha:
      "Interviewers love the follow-up \"when should you NOT use TypeScript?\" — honest answer: tiny throwaway scripts, or teams with zero JS experience (the ramp-up cost exceeds the benefit for a two-week project).",
  },
  {
    id: "iq-2",
    number: 2,
    category: "Types",
    question: "interface vs type: differences?",
    shortAnswer:
      "Both describe object shapes and are ~95% interchangeable there. The real differences: interfaces support declaration merging and are limited to object/class shapes; type aliases can express unions, tuples, primitives, and mapped/conditional types. Convention: interface for public object contracts, type for aliases and unions — consistency matters more than the choice.",
    detail: [
      "Declaration merging: two `interface Window` declarations merge into one — that is how you augment library and global types. Redeclaring a `type` alias is a compile error.",
      "Composability: interfaces extend other interfaces; types compose with intersections (`&`). Types can be conditional and mapped, interfaces cannot.",
      "Performance is effectively a non-issue in modern compilers; do not cite it as a reason.",
    ],
    code: `// Only a type can do unions / primitives:
type ID = string | number
type Status = "active" | "pending"

// Only an interface can merge:
interface Window { __debug: boolean }
interface Window { __verbose: boolean } // merged, both exist

// For plain shapes — pick one and stay consistent:
interface User { id: number }
type UserT = { id: number } // equivalent`,
    gotcha:
      "The strongest candidates state a preference AND a rule: \"interface by default for object shapes, type when I need unions or computed types\" — then note the team convention wins either way.",
  },
  {
    id: "iq-3",
    number: 3,
    category: "Types",
    question: "any vs unknown vs never?",
    shortAnswer:
      "any opts a value out of the type system — anything compiles, nothing is checked. unknown accepts any value but requires narrowing before use, making it the safe choice at system boundaries (parsed JSON, API payloads). never is the type of values that can never occur, like a function that always throws.",
    detail: [
      "Practical rule: `unknown` at the edges, real types inside, `never` for exhaustiveness checking (assign a `never` in a switch's default and the compiler errors if a case was missed).",
      "any is not evil, just viral: one any can silently disable checking for everything downstream of it. `catch (e)` blocks default to unknown under strict mode — that is the ecosystem pushing you the right way.",
    ],
    code: `function handle(payload: unknown) {
  if (typeof payload === "string") {
    return payload.toUpperCase() // narrowed: safe
  }
  return "unknown shape"
}

function fail(): never {
  throw new Error("unreachable")
}

// any: compiles, then explodes at runtime:
const loose: any = "x"; loose.foo.bar()`,
    gotcha:
      "Great bonus point: `never` enables exhaustiveness — `default: { const x: never = value }` makes adding a new union variant a compile error wherever a switch forgot to handle it.",
  },
  {
    id: "iq-4",
    number: 4,
    category: "Generics",
    question: "What are generics? Give an example.",
    shortAnswer:
      "Generics are type parameters: placeholders the caller fills in, so one function or class works for many types while keeping exact type safety. Example: `function first<T>(arr: T[]): T` returns the exact element type of whatever array it is given — `first([1,2])` is a number, `first([\"a\"])` is a string.",
    detail: [
      "The alternative to generics is either `any` (loses all checking) or copy-pasting per-type versions (maintenance nightmare). Generics preserve the input→output type relationship, which is the entire value.",
      "Constraints (`<T extends { length: number }>`) narrow what callers may pass and what the body may do — the keyof constraint (`K extends keyof T`) powers type-safe property access.",
    ],
    code: `function first<T>(arr: T[]): T {
  return arr[0]
}

const n = first([1, 2, 3])    // n: number
const s = first(["a", "b"])   // s: string

// Constraints express requirements:
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}`,
    gotcha:
      "Interviewers probe: \"where do you see generics in practice?\" — Array<T>, Promise<T>, Map<K,V>, React's useState<T>, and every ORM's find methods are all generic APIs you already use.",
  },
  {
    id: "iq-5",
    number: 5,
    category: "Types",
    question: "Union vs intersection types?",
    shortAnswer:
      "A union (A | B) means the value is ONE of the members — an OR — so you may only use what all members share, until you narrow. An intersection (A & B) means the value satisfies ALL members — an AND — so it must carry every property of both. Unions model alternatives (an ID that is string or number); intersections model composition (Named & Aged).",
    detail: [
      "Reading trick: | is or, & is and — same symbols as boolean logic. For object types, intersection stacks required properties; conflicting property types produce never.",
      "The narrowing companion: unions without narrowing are nearly unusable; Day 3's typeof/in/switch checks are what unlock them. This question often leads directly into question #6.",
    ],
    code: `type Role = "admin" | "member"      // one of these
type Person = Named & Aged & Employed // ALL of these

interface Named { name: string }
interface Aged { age: number }
interface Employed { salary: number }

const p: Person = { name: "ada", age: 36, salary: 100 }

let id: string | number = "u-1"
id = 42            // either is fine
// id.toUpperCase()  // error until narrowed`,
    gotcha:
      "Confusingly, unions of arrays and arrays of unions interact: `string | string[]` is one-or-the-other; `(string | number)[]` is an array mixing both. Parentheses carry meaning.",
  },
  {
    id: "iq-6",
    number: 6,
    category: "Narrowing",
    question: "What is type narrowing? Name a few techniques.",
    shortAnswer:
      "Narrowing is the compiler refining a value's union type based on runtime checks, so the value has a more specific type inside the checked branch. Techniques: typeof for primitives, instanceof for classes, the in operator for property presence, truthiness checks for null/undefined, switch on a discriminated union's tag, and user-defined type guards (`x is T`).",
    detail: [
      "The mechanism is control-flow analysis: TypeScript tracks your if/switch/early-returns and computes the surviving type in each scope. It is fully automatic once your checks are shaped correctly.",
      "The discriminated-union switch is the flagship technique in real projects — one check on the tag narrows the entire object shape per case.",
    ],
    code: `function format(value: string | number): string {
  if (typeof value === "string") {
    return value.trim()   // string here
  }
  return value.toFixed(2) // number here
}

// Discriminated union — the real-world workhorse:
type State =
  | { status: "loading" }
  | { status: "success"; data: string[] }

switch (state.status) {
  case "loading": return "…"
  case "success": return \`\${state.data.length} items\`
}

// User-defined guard:
const isString = (x: unknown): x is string => typeof x === "string"`,
    gotcha:
      "Truthy narrowing has a sharp edge: `if (x)` also removes 0, \"\", and false — when those are legal values, check `x !== undefined` instead.",
  },
  {
    id: "iq-7",
    number: 7,
    category: "Utilities",
    question: "What are utility types? Explain Partial, Pick, Omit, Record.",
    shortAnswer:
      "Utility types are built-in type-level functions that transform existing types, so variations stay derived from one source of truth. Partial<T> makes every property optional (patch payloads); Pick<T, K> keeps only the listed keys (preview/DTO shapes); Omit<T, K> drops the listed keys (create payloads minus server fields); Record<K, V> builds an object with exactly keys K and values V (lookup tables).",
    detail: [
      "The maintenance argument is the part that impresses: add a field to User and it automatically appears in Partial<User> and Omit<User, \"id\"> — no second shape to forget to update.",
      "They are themselves implemented with mapped types — `{ [K in keyof T]?: T[K] }` is Partial's essence — which links this question to reading library type definitions.",
    ],
    code: `interface User {
  id: number
  name: string
  email: string
}

type UserUpdate = Partial<User>              // all optional
type UserPreview = Pick<User, "id" | "name"> // subset
type CreateUser = Omit<User, "id">           // minus server field
type UserMap = Record<number, UserPreview>   // keyed lookup

const patch: UserUpdate = { name: "Ada L." } // a rename is a valid patch
const byId: UserMap = { 1: { id: 1, name: "ada" } }`,
    gotcha:
      "Bonus fluency: mention the reflection family — ReturnType, Parameters, NonNullable, Awaited — and `ReturnType<typeof fn>` deriving a type from an existing function instead of re-declaring it.",
  },
  {
    id: "iq-8",
    number: 8,
    category: "Types",
    question: "What is a tuple? An enum? When would you use a union of literals instead of an enum?",
    shortAnswer:
      "A tuple is a fixed-length array with a type per position: [string, number]. An enum is a set of named constants, often string-valued. Prefer a union of string literals (`type Status = \"active\" | \"pending\"`) when you just need a finite set of values: zero runtime code, full autocomplete, and it types plain strings coming from JSON — enums add a runtime object and (for non-string enums) surprising number semantics.",
    detail: [
      "The enum pitfalls worth naming: numeric enums are loosely bidirectionally assignable (any number may pass), and `const enum` has cross-module isolation issues. String enums avoid those but still emit a runtime object.",
      "When enums ARE right: when the mapping itself is data (Status.Active used as a value), when you need reverse mapping, or in codebases already standardized on them. `as const` objects are a third pattern: runtime values with literal types.",
    ],
    code: `// Tuple — fixed shape:
const httpOk: [number, string] = [200, "OK"]
const [code, text] = httpOk

// Enum — a real runtime object:
enum Status { Active = "ACTIVE", Pending = "PENDING" }

// Literal union — types only, zero runtime:
type StatusL = "active" | "pending"

const s: StatusL = JSON.parse('"active"') // works directly
// const e: Status = "ACTIVE"             // error — not the enum member`,
    gotcha:
      "The interview twist: \"how do you get enum-like values AND literal safety?\" — a frozen object with as const: `const STATUS = { Active: 'active' } as const` then `keyof typeof STATUS` for the keys.",
  },
  {
    id: "iq-9",
    number: 9,
    category: "Config",
    question: "What does strict mode enable?",
    shortAnswer:
      "`strict: true` is the master switch for soundness checks — most importantly strictNullChecks (null and undefined become distinct types, killing most \"cannot read property of null\" bugs at compile time) and noImplicitAny (untyped parameters error instead of silently becoming any), plus strictFunctionTypes, strictPropertyInitialization, noImplicitThis, and others. New projects should always start with it on.",
    detail: [
      "The two headline flags do the daily work: strictNullChecks changes how every nullable value is handled (optional chaining and ?? become necessary tools), and noImplicitAny surfaces every place the compiler lost track of a type.",
      "Turning strict on later in a codebase is a real migration project — which is exactly why the advice is to start strict and never look back.",
    ],
    code: `// Without strictNullChecks this compiles — and crashes:
const user = JSON.parse("null") as { name: string } | null
console.log(user.name)
// strict: error TS18047: 'user' is possibly 'null'.

// Without noImplicitAny this compiles silently:
function double(x) { return x * 2 }
// strict: error TS7006: Parameter 'x' implicitly has an 'any' type.`,
    gotcha:
      "Follow-up to expect: \"would you enable strict on a legacy codebase?\" — pragmatic answer: yes, incrementally, using tsconfig overrides per folder to avoid the big-bang freeze.",
  },
  {
    id: "iq-10",
    number: 10,
    category: "Type System",
    question: "What is structural typing?",
    shortAnswer:
      "TypeScript's type system is structural: compatibility is decided by shape, not by name or declared lineage. If an object has all the properties a type requires with the right types, it is assignable to it — no `implements` or inheritance needed. This is why plain JSON that matches an interface \"just works\".",
    detail: [
      "This is the opposite of nominal typing (Java, C#), where two classes with identical members are still incompatible without an explicit relationship.",
      "Consequence worth mentioning: excess property checks apply only to fresh object literals, so a variable with extra properties still satisfies a narrower type. And duck typing at the type level means a well-named interface documents intent, but it does not fence anything in.",
    ],
    code: `interface Loggable { message: string }

const error = { message: "boom", code: 500 } // extra prop: fine
const log = (l: Loggable) => console.log(l.message)

log(error)      // structural match: has message

class ApiError { constructor(public message: string) {} }
log(new ApiError("x")) // classes match structurally too

// Only literals get excess-property checking:
// log({ message: "x", code: 500 })  // error TS2353`,
    gotcha:
      "Fresh-literal strictness vs variable looseness (from question #2's practice) is structural typing in action — knowing both halves of it signals real understanding.",
  },
  {
    id: "iq-11",
    number: 11,
    category: "Assertions",
    question: "Type assertion (as) vs type casting?",
    shortAnswer:
      "In TypeScript, `as` is a compile-time instruction to trust you — it performs no runtime conversion or validation whatsoever. Casting in other languages (or `Number(x)` in JS) actually converts a value at runtime. So `\"42\" as unknown as number` compiles but leaves a string in memory — assertions change types, never values.",
    detail: [
      "Legitimate uses: DOM lookups (`querySelector as HTMLInputElement`), narrowing at trusted boundaries you have already validated, and interop with untyped libraries.",
      "The safer toolkit should come up unprompted: type guards (actual runtime checks), `instanceof`, and validation libraries (Zod) verify rather than trust. Every `as` is a documented assumption — the compiler will not catch it when it is wrong.",
    ],
    code: `const raw: unknown = "42"

const asNumber = raw as number   // LIE: still a string at runtime
console.log(asNumber + 1)        // "421" — string concatenation!

const casted = Number(raw)       // real runtime conversion
console.log(casted + 1)          // 43 — correct

// The honest patterns:
if (typeof raw === "string") { /* narrowed, verified */ }`,
    gotcha:
      "Double assertions (`x as unknown as T`) can force ANY type and should set off alarms in code review — they are the type system's \"I know better\" escape hatch being abused.",
  },
  {
    id: "iq-12",
    number: 12,
    category: "Types",
    question: "readonly vs const?",
    shortAnswer:
      "const is a JavaScript runtime feature for bindings: the variable cannot be reassigned (the object it holds can still be mutated). readonly is a TypeScript compile-time feature for properties: the property cannot be reassigned, enforced by the compiler only. A const object with mutable properties, and a readonly property on a let variable, are both normal — they lock different things.",
    detail: [
      "The matrix: `const user = {...}` → cannot reassign user, CAN do user.name = \"x\". `let user: { readonly name: string }` → CAN reassign user, cannot do user.name = \"x\".",
      "Depth note that earns points: readonly is shallow — nested properties are still mutable; deep immutability needs a recursive Readonly mapped type or Object.freeze at runtime.",
    ],
    code: `const config = { port: 8080 }
config.port = 3000            // allowed! const ≠ frozen object
// config = { port: 1 }       // error: reassignment

interface Settings {
  readonly port: number
}
let s: Settings = { port: 8080 }
s.port = 3000                 // error: readonly property
s = { port: 3000 }            // allowed: the binding is not const

// Readonly<T> applies it to every property (shallow):
type Frozen = Readonly<Settings>`,
    gotcha:
      "One-liner for the interview: \"const locks the name, readonly locks the property, and neither freezes deeply.\"",
  },
  {
    id: "iq-13",
    number: 13,
    category: "Ecosystem",
    question: "What are .d.ts files and @types packages?",
    shortAnswer:
      "A .d.ts file is a declaration file — types with no runtime code, describing the API surface of a library so the compiler can check your usage of it. @types/* packages (from the DefinitelyTyped repository) are community-written .d.ts bundles for libraries that don't ship their own types; you install @types/express to get full checking of Express imports.",
    detail: [
      "Modern libraries increasingly ship types in the package itself (a \"types\" field in package.json) — those need nothing extra. When types are missing entirely, imports degrade to any with a \"Could not find a declaration file\" warning.",
      "You can write your own declarations: `declare module \"untyped-lib\"` shims a package, and `declare global` adds properties to Window or other ambient types — that is how type-safe environments get built.",
    ],
    code: `// analytics.d.ts — your own shim for an untyped package:
declare module "analytics-tracker" {
  export function track(event: string, data?: Record<string, unknown>): void
}

// Usage — now fully checked:
import { track } from "analytics-tracker"
track("signup", { plan: "pro" })

// Ambient global augmentation:
declare global {
  interface Window { __APP_VERSION__: string }
}
export {}`,
    gotcha:
      "Practical detail: @types packages go in devDependencies — types vanish from the compiled output, so production builds never need them.",
  },
  {
    id: "iq-14",
    number: 14,
    category: "Type System",
    question: "What is keyof / typeof?",
    shortAnswer:
      "keyof T is the union of a type's property names — keyof User is \"id\" | \"name\" | \"email\". typeof value (lowercase, type-level) derives the type OF a runtime value — typeof config is the shape of that specific object. Together they power the signature `<T, K extends keyof T>(obj: T, key: K): T[K]`, which makes property access type-safe with autocompleted keys.",
    detail: [
      "The combo `keyof typeof obj` derives a key union straight from a real object — one source of truth that can never drift out of sync. With `as const`, the derived types stay literal instead of widening to string.",
      "typeof also bridges runtime to compile time: `ReturnType<typeof fn>` and `Parameters<typeof fn>` give you a function's types without re-declaring them.",
    ],
    code: `const endpoints = {
  users: "/api/users",
  posts: "/api/posts",
} as const

type EndpointKey = keyof typeof endpoints // "users" | "posts"

function hit(key: EndpointKey): string {
  return \`GET \${endpoints[key]}\`
}

hit("users")    // autocompleted
hit("admin")    // error TS2345 — not a key

// The famous generic:
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}`,
    gotcha:
      "Do not confuse the two typeofs: the expression-level `typeof x` (runtime operator) and the type-level `typeof x` (inside type positions) — TypeScript overloads the keyword, and context decides which.",
  },
  {
    id: "iq-15",
    number: 15,
    category: "Operators",
    question: "How do optional chaining (?.) and nullish coalescing (??) work?",
    shortAnswer:
      "Optional chaining safely navigates possibly-null values: `user?.address?.city` short-circuits to undefined the moment any link is nullish, instead of throwing. Nullish coalescing provides a default only for null and undefined: `port ?? 3000` keeps 0 and \"\" — unlike `||`, which falls back for every falsy value. Together they replace the guard-tower-of-if blocks with one expression.",
    detail: [
      "The || trap is the exam-shaped follow-up: `0 || 3000` is 3000 (0 is falsy) but `0 ?? 3000` is 0 — for defaults on counts, ports, and flags, ?? is correct.",
      "Optional chaining extends beyond properties: `fn?.()` calls only if fn exists, `arr?.[0]` indexes safely, and the whole chain returns undefined (typed as T | undefined) if interrupted.",
    ],
    code: `interface User { address?: { city?: string } }

const users: User[] = [{}, { address: { city: "NYC" } }]

// Safe navigation through the uncertainty:
users[1].address?.city     // "NYC"
users[0].address?.city     // undefined — no crash

// ?? — defaults only for null/undefined:
const port = 0
port || 3000               // 3000 — WRONG (0 is legal)
port ?? 3000               // 0 — correct

// The idiomatic pair:
const city = users[0].address?.city ?? "unknown"
console.log(city)          // "unknown"`,
    gotcha:
      "Both are JavaScript (ES2020) features, not TypeScript inventions — TS only types them precisely (`T | undefined`). Attributing them to TS is a small but memorable error in an interview.",
  },
];

export const interviewCategories = [
  "All",
  "Basics",
  "Types",
  "Narrowing",
  "Generics",
  "Utilities",
  "Config",
  "Type System",
  "Assertions",
  "Ecosystem",
  "Operators",
];
