import type { Day } from "./types";

export const day3: Day = {
  id: 3,
  title: "Unions, Narrowing & Assertions",
  subtitle: "Modeling data that can be more than one thing — and handling each case safely",
  hours: "~3 hours",
  goal: "Write functions that accept unions and narrow them so every case is handled — the pattern you will use most in real projects.",
  icon: "gitbranch",
  intro: [
    "Real data is messy: an ID can arrive as a string or a number, an API response can succeed or fail, a network payload can be one of five shapes. Day 3 teaches the single most practically important TypeScript skill: expressing alternatives with unions and then narrowing them safely.",
    "By the end of today, the phrase \"discriminated union\" will feel obvious instead of intimidating, and you will recognize the pattern in every serious TS codebase you read.",
  ],
  sections: [
    {
      id: "d3-unions-literals",
      title: "Union types and literal types",
      minutes: 25,
      paragraphs: [
        "A union `A | B` means \"a value of this type is either an A or a B\" — vertical bar reads as \"or\". Literal types take this to the finest grain: specific strings, numbers, or booleans as types. `\"admin\" | \"user\"` is a type whose only legal values are those two exact strings. Combined with autocomplete and typo-catching, literal unions replace most uses of enums in modern code.",
        "Unions apply anywhere a type can appear: variables, parameters, return types, array elements. The moment a value has a union type, the compiler restricts you to operations valid on *every* member — which is what motivates narrowing in the next section.",
      ],
      examples: [
        {
          title: "Unions and literals",
          variant: "good",
          code: `type Role = "admin" | "user" | "guest"

let role: Role = "admin"   // autocomplete offers all three
role = "superuser"         // typo? rejected

function formatId(id: string | number): string {
  return \`id-\${id}\`        // template literal accepts both
}

console.log(formatId("abc"), formatId(42))`,
          output: "id-abc id-42",
          tsError: "(role = \"superuser\" produces: error TS2322: Type '\"superuser\"' is not assignable to type 'Role'.)",
        },
        {
          title: "Union of arrays vs array of unions",
          variant: "neutral",
          code: `// string | string[] — the value is EITHER one string OR an array
let nameOrNames: string | string[] = "ada"
nameOrNames = ["ada", "grace"]

// (string | number)[] — an array MIXING element types
let mixed: (string | number)[] = ["ada", 36, "grace", 45]

// The reading skill: | binds tighter inside [].
// string[] | number[] means "array of strings OR array of numbers".`,
        },
      ],
      keyPoints: [
        "`A | B` = value is one or the other. Literal types: exact values like `\"pending\"` as types.",
        "Prefer literal unions over enums for finite string sets — zero runtime code, better autocomplete.",
        "Parentheses change meaning: `(string | number)[]` is not `string[] | number[]`.",
      ],
    },
    {
      id: "d3-narrowing",
      title: "Type narrowing: typeof, instanceof, in, truthiness",
      minutes: 35,
      paragraphs: [
        "Narrowing is the compiler tracking your runtime checks and refining a union type inside the checked block. After `typeof x === \"string\"`, `x` is a `string` for the rest of that branch — no assertion, no cast, just logic the compiler understands. This is the mechanism that makes unions usable, and it is entirely automatic once your checks are shaped correctly.",
        "Four everyday narrowing tools: `typeof` for primitives, `instanceof` for classes (checks the prototype chain), the `in` operator for object property presence, and plain truthiness (`if (x)`) which removes `null`/`undefined` — careful: truthiness also removes 0, \"\", and false, which may be legal values you care about.",
      ],
      examples: [
        {
          title: "typeof narrowing",
          variant: "good",
          code: `function format(value: string | number): string {
  if (typeof value === "string") {
    return value.trim().toUpperCase() // value: string here
  }
  return value.toFixed(2)             // value: number here
}

console.log(format("  hi "), format(3.14159))`,
          output: "HI 3.14",
        },
        {
          title: "instanceof and in narrowing",
          variant: "good",
          code: `class ValidationError extends Error {
  constructor(public field: string) {
    super(\`Invalid field: \${field}\`)
  }
}

function describe(e: Error | ValidationError): string {
  if (e instanceof ValidationError) {
    return \`Bad field: \${e.field}\`   // narrowed to ValidationError
  }
  return e.message
}

type Cat = { meow: () => void }
type Dog = { bark: () => void }

function speak(pet: Cat | Dog): void {
  if ("meow" in pet) pet.meow()  // 'meow' present => Cat
  else pet.bark()
}`,
        },
        {
          title: "Truthiness — the subtle one",
          variant: "neutral",
          code: `interface Config { retries?: number }

function attempt(config: Config): number {
  if (config.retries) {
    return config.retries     // narrowed away from undefined
  }
  return 1                    // 0 would ALSO land here — bug?
}

// Precise check when 0 is a legal value:
if (config.retries !== undefined) {
  return config.retries
}`,
          caption:
            "Rule of thumb: use `!== undefined` (or `!= null` for both null+undefined) when the legal values include 0, \"\", or false.",
        },
      ],
      keyPoints: [
        "Narrowing is automatic — the compiler refines types inside `if` branches based on your checks.",
        "`typeof` → primitives; `instanceof` → classes; `in` → property presence; truthiness → null/undefined (with edge cases).",
        "For optional values where 0 or \"\" are legal, check `!== undefined` explicitly.",
      ],
      callouts: [
        {
          kind: "tip",
          title: "Hover is your teacher",
          body: "In an editor, hover a narrowed variable inside each branch — you will SEE the type change (e.g. `string | number` → `string`). This visual feedback trains narrowing faster than any prose.",
        },
      ],
    },
    {
      id: "d3-discriminated-unions",
      title: "Discriminated unions — the real-world workhorse",
      minutes: 35,
      paragraphs: [
        "A discriminated union is a union of object types that all share one literal-typed field (the \"tag\" or \"discriminant\"). Checking that field with a `switch` narrows the whole object in each case — one check reveals the entire shape. This is THE pattern for API results, async states (loading/success/error), messages, and Redux/Zod-style events.",
        "Why it beats a bag of optional properties: impossible states become unrepresentable. Instead of `data?, error?, isLoading?` (and the bug where two are set at once), each state is one variant with exactly the fields that state needs. Combined with `never` in the default case, the compiler errors if you forget a variant — exhaustiveness checking.",
      ],
      examples: [
        {
          title: "The async state machine you will write forever",
          variant: "good",
          code: `type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string }

function render(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Nothing requested yet"
    case "loading":
      return "Loading..."
    case "success":
      return \`\${state.data.length} results\`   // data exists ONLY here
    case "error":
      return \`Failed: \${state.message}\`        // message exists ONLY here
    default: {
      const exhausted: never = state            // compile-time exhaustiveness!
      return exhausted
    }
  }
}

console.log(render({ status: "success", data: ["a", "b"] }))`,
          output: "2 results",
        },
        {
          title: "Forgetting a case — caught for free",
          variant: "bad",
          code: `type Event =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; deltaY: number }
  | { type: "focus"; element: string }

function handle(e: Event): string {
  switch (e.type) {
    case "click": return \`click @ \${e.x},\${e.y}\`
    case "scroll": return \`scroll \${e.deltaY}\`
    // forgot "focus"
  }
}`,
          tsError:
            "error TS7030: Not all code paths in the stated return type return a value — the 'focus' case is unhandled.",
          caption:
            "Add the focus case and the error disappears. Add a new variant later and every switch that misses it errors — this is how discriminated unions scale safely across a team.",
        },
      ],
      keyPoints: [
        "Shared literal field (\"tag\") + switch = whole-object narrowing per case.",
        "Impossible states become unrepresentable — better than optional-property soup.",
        "Assign to `never` in default to get exhaustiveness checking for free.",
      ],
      callouts: [
        {
          kind: "interview",
          title: "Interview question #6 lives here",
          body: "\"What is type narrowing?\" — answer: the compiler refining union types based on runtime checks (typeof/instanceof/in/switch on a discriminant), then give the RequestState example. It is also the backbone of your Day 7 API-state answers.",
        },
      ],
    },
    {
      id: "d3-assertions-operators",
      title: "Assertions (as), non-null (!), optional chaining (?.), nullish coalescing (??)",
      minutes: 30,
      paragraphs: [
        "A type assertion `value as T` tells the compiler \"trust me, I know the actual type\" — it does not convert or check anything at runtime; it silences the compiler. Use it sparingly: at the edge of the system where you know more than the types do (e.g. a DOM lookup or a parsed payload you have already validated). The non-null assertion `!` is its narrow cousin: \"this value is definitely not null/undefined\" — every `!` is a potential runtime crash you have personally vouched for.",
        "The safe operators do the opposite — they let you navigate uncertainty without lying: `obj?.prop` short-circuits to `undefined` if obj is nullish, `a ?? b` falls back only for null/undefined (unlike `||`, which also falls back for 0 and \"\"), and `fn?.()` calls only if fn exists. Prefer these over assertions everywhere you can.",
      ],
      examples: [
        {
          title: "The safe trio — use these daily",
          variant: "good",
          code: `interface User {
  name: string
  email?: string
  address?: {
    city: string
    geo?: { lat: number; lng: number }
  }
}

function cityOf(user: User): string {
  return user.address?.city ?? "unknown"
}

const users: User[] = [
  { name: "Ada" },
  { name: "Grace", address: { city: "NYC" } },
]

console.log(users.map(cityOf))            // ["unknown", "NYC"]
console.log(users[1].address?.geo?.lat)   // undefined — no crash
console.log(users[0].email ?? "no email") // "no email"

// ?? vs || — the classic bug:
const port = 0
console.log(port || 3000)  // 3000 — WRONG, 0 was a legal port
console.log(port ?? 3000)  // 0    — correct`,
          output: `[ 'unknown', 'NYC' ]
undefined
no email
3000
0`,
        },
        {
          title: "Assertions — sometimes necessary, always risky",
          variant: "neutral",
          code: `// DOM lookups return HTMLElement | null. You "know" it exists:
const input = document.querySelector("#email") as HTMLInputElement
input.value // compiles; crashes at runtime if it was null

// Non-null assertion — same risk, terser:
const el = document.querySelector("#email")!
el.value

// A slightly safer pattern — still assert, but fail loudly:
const el2 = document.querySelector<HTMLInputElement>("#email")
if (!el2) throw new Error("#email missing")
el2.value // narrowed, no assertion needed`,
          caption:
            "Assertion tells the compiler; a throw tells you. The last pattern gives a real error message instead of \"cannot read value of null\".",
        },
        {
          title: "The double-assertion trap",
          variant: "bad",
          code: `const value = "hello" as string as number
value.toFixed() // compiles — and is a LIE`,
          tsError: "(compiles — that is the danger. Chained assertions can force impossible types.)",
          caption:
            "An honest single assertion between compatible types is occasionally fine; chained assertions through incompatible types defeat the type system entirely. Never do this in real code.",
        },
      ],
      keyPoints: [
        "`as` = trust me (no runtime check). `!` = definitely not null (no runtime check). Both silence, neither verify.",
        "`?.` safe navigation, `??` null/undefined-only fallback — these VERIFY at runtime instead of assuming.",
        "`||` falls back on 0, \"\", false too; `??` only on null/undefined. Use `??` for defaults.",
      ],
    },
    {
      id: "d3-any-vs-unknown",
      title: "any vs unknown — the boundary rule",
      minutes: 20,
      paragraphs: [
        "Day 1 introduced the pair; now you have the tools to use `unknown` correctly. The rule that makes it stick: **`any` at internal boundaries is a lost battle; `unknown` at external boundaries is a won war.** JSON.parse, `fetch` bodies, URL query params, third-party webhooks — these arrive untyped. Type them `unknown` and narrow immediately, or validate them with a schema library (Zod) that produces real types.",
        "A well-typed function that accepts `unknown` and narrows is called a *user-defined type guard* when it returns a type predicate (`x is string`). You will write a couple in today's practice.",
      ],
      examples: [
        {
          title: "The boundary pattern",
          variant: "good",
          code: `// BAD: the classic any leak
function handleBad(payload: any) {
  console.log(payload.user.name) // compiles; crashes on real data
}

// GOOD: unknown + narrowing
interface Payload {
  user: { name: string }
}

function isPayload(x: unknown): x is Payload {
  return (
    typeof x === "object" && x !== null &&
    "user" in x &&
    typeof (x as { user: unknown }).user === "object" &&
    "name" in (x as { user: { name: unknown } }).user
  )
}

function handle(payload: unknown): string {
  if (isPayload(payload)) {
    return payload.user.name // fully typed & safe
  }
  return "unknown payload"
}

console.log(handle({ user: { name: "Ada" } }), handle({}))`,
          output: "Ada unknown payload",
          caption:
            "A type predicate (`x is Payload`) turns a boolean check into a narrowing tool. Real projects often use Zod instead of hand-written guards — same idea, less code.",
        },
      ],
      keyPoints: [
        "Type external input as `unknown`, then narrow (typeof/in/predicates) or validate (Zod) before use.",
        "A function returning `x is T` is a user-defined type guard — it narrows at call sites.",
        "Every `any` you write disables checking for everything downstream of it.",
      ],
    },
  ],
  quiz: [
    {
      id: "d3-q1",
      question: "After `if (typeof x === \"number\")` inside the branch, the type of `x: string | number` is…",
      options: ["still string | number", "number", "string", "never"],
      answerIndex: 1,
      explanation:
        "The compiler tracks the check and narrows x to number inside the branch. The else branch would hold the string case.",
    },
    {
      id: "d3-q2",
      question: "What is the shared literal field of a discriminated union called, and what does checking it do?",
      options: [
        "The label; checking it only narrows that one field",
        "The discriminant (or tag); checking it narrows the entire object shape in that branch",
        "The signature; checking it runs a runtime type check",
        "The index; checking it converts the union to an array",
      ],
      answerIndex: 1,
      explanation:
        "Because every variant has the tag field with a distinct literal type, a switch on the tag tells the compiler exactly which full object shape applies — all sibling fields become known in each case.",
    },
    {
      id: "d3-q3",
      question: "`const port = 0; const p = port || 3000` — what is p, and how do you fix it?",
      options: [
        "p is 0; fix with ??",
        "p is 3000; fix with ??",
        "p is 3000; fix with a non-null assertion",
        "p is 0; fix with as number",
      ],
      answerIndex: 1,
      explanation:
        "`||` treats 0 as falsy, so it wrongly falls back to 3000. `??` only falls back on null/undefined, so `port ?? 3000` correctly yields 0.",
    },
    {
      id: "d3-q4",
      question: "What does `value as T` do at runtime?",
      options: [
        "Converts the value to type T",
        "Validates that the value matches T, throwing if not",
        "Nothing — it only silences the compiler; the value is untouched",
        "Caches the asserted type for later checks",
      ],
      answerIndex: 2,
      explanation:
        "Assertions are compile-time instructions to trust you. No conversion, no validation, no runtime footprint — which is exactly why each one is a small risk you personally accept.",
    },
    {
      id: "d3-q5",
      question: "Which check narrows a value of type `Cat | Dog` (object types with different methods) most idiomatically?",
      options: [
        "if (typeof pet === \"cat\")",
        "if (\"meow\" in pet)",
        "if (pet === Cat)",
        "if (pet as Cat)",
      ],
      answerIndex: 1,
      explanation:
        "`in` checks property presence and narrows object unions by their members. typeof only distinguishes primitives, `=== Cat` compares a value to a type (invalid), and `as` is an assertion, not a check.",
    },
  ],
  practice: {
    intro:
      "The plan's flagship exercise: one function, one union, three cases, each handled safely. Then stretch it with a discriminated union — this is the shape of real-world data handling.",
    steps: [
      "Write `describe(value: string | number | string[]): string` that returns \"text: X\" (uppercased) for strings, \"number: N\" (2 decimals) for numbers, and \"list: a, b, c\" for arrays (joined). Use typeof narrowing.",
      "Call it with all three shapes and print the results.",
      "Now model an API response as a discriminated union: `{ type: \"success\"; items: string[] } | { type: \"error\"; code: number; retryAt?: number } | { type: \"loading\" }`.",
      "Write `processResponse(r: Response): string` handling every variant, including \"error\" with an optional retryAt time. Use exhaustiveness (never) in default.",
      "Break it: delete one case from the switch, observe the error; then pass `42` to describe() and observe that error too.",
    ],
    starter: `// Day 3 practice — handle every case safely

function describe(value: string | number | string[]): string {
  // your narrowing here
  return ""
}

console.log(describe("hello"))
console.log(describe(3.14159))
console.log(describe(["a", "b", "c"]))`,
    solution: `// Day 3 practice — reference solution

function describe(value: string | number | string[]): string {
  if (typeof value === "string") {
    return \`text: \${value.toUpperCase()}\`
  }
  if (typeof value === "number") {
    return \`number: \${value.toFixed(2)}\`
  }
  return \`list: \${value.join(", ")}\`
}

console.log(describe("hello"))    // text: HELLO
console.log(describe(3.14159))    // number: 3.14
console.log(describe(["a", "b"])) // list: a, b

type ApiResponse =
  | { type: "success"; items: string[] }
  | { type: "error"; code: number; retryAt?: number }
  | { type: "loading" }

function processResponse(r: ApiResponse): string {
  switch (r.type) {
    case "success":
      return \`Got \${r.items.length} items: \${r.items.join(", ")}\`
    case "error":
      return r.retryAt !== undefined
        ? \`Error \${r.code}, retry at \${new Date(r.retryAt).toISOString()}\`
        : \`Error \${r.code}, no retry\`
    case "loading":
      return "Still loading"
    default: {
      const exhausted: never = r
      return exhausted
    }
  }
}

console.log(processResponse({ type: "success", items: ["a", "b"] }))
console.log(processResponse({ type: "error", code: 429, retryAt: Date.now() }))
console.log(processResponse({ type: "loading" }))`,
    solutionNote:
      "Note how describe uses ordered typeof checks (string first — arrays would pass a typeof \"object\" anyway, but here the union has no plain object member), and how the switch gives each response variant exactly the fields it needs.",
  },
};
