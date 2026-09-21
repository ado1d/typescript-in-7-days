import type { Day } from "./types";

export const day2: Day = {
  id: 2,
  title: "Functions, Objects & Interfaces",
  subtitle: "The shape of data, and the signature of behavior — where TypeScript earns its keep daily",
  hours: "~2.5 hours",
  goal: "Model real-world data with interfaces and type functions precisely enough that wrong calls fail to compile.",
  icon: "braces",
  intro: [
    "Day 1 gave you the atoms; today you assemble molecules. Almost all real TypeScript is about two things: describing the shape of data (objects and interfaces) and describing the shape of behavior (functions). Get these right and 80% of day-to-day TS work becomes routine.",
    "The single most common thing you will do in any TS codebase is read an interface someone else wrote. The second most common is write one. So today you will build a small domain model — `User`, `Product`, `Order` — the exact exercise you would do in a take-home task or see in a real service layer.",
  ],
  sections: [
    {
      id: "d2-function-basics",
      title: "Typing parameters and return values",
      minutes: 20,
      paragraphs: [
        "Every function parameter is annotated, and the return type goes after the parameter list: `function f(x: string): number`. For one-line functions the return type is usually inferable, but exported/public functions conventionally declare it — it becomes a contract that the implementation cannot silently drift away from, and it shows up in editor hovers for every caller.",
        "Arrow functions type identically: `(a: number, b: number): number => a + b`. If a function genuinely returns nothing, mark it `: void` (or let inference do it).",
      ],
      examples: [
        {
          title: "Signatures on both flavors",
          variant: "good",
          code: `function greet(name: string): string {
  return \`Hello, \${name}\`
}

const add = (a: number, b: number): number => a + b

// Inferred return is fine for internal helpers:
const square = (n: number) => n * n

console.log(greet("Ada"), add(2, 3), square(4))`,
          output: "Hello, Ada 5 16",
        },
        {
          title: "Wrong arguments, caught at compile time",
          variant: "bad",
          code: `const add = (a: number, b: number): number => a + b

add("2", 3)
add(2)`,
          tsError:
            "error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\nerror TS2554: Expected 2 arguments, but got 1.",
          caption:
            "Two different errors: a wrong type, and a wrong count. In plain JavaScript both would produce NaN or undefined — here they never even reach the runtime.",
        },
      ],
      keyPoints: [
        "Parameter types are mandatory; return types are inferred but often declared on public APIs.",
        "The compiler checks argument count AND argument types at every call site.",
      ],
    },
    {
      id: "d2-optional-default-rest",
      title: "Optional (?), default, and rest parameters",
      minutes: 25,
      paragraphs: [
        "A parameter with `?` may be omitted — inside the function, its type includes `undefined`, so the compiler forces you to handle the missing case. Default parameters make a param optional while giving it a value, and the default itself refines the type (no `undefined` inside). Rest parameters collect any number of trailing arguments into a typed array.",
        "Order matters: required parameters first, then optional/default, rest last. Breaking that order is a compile error, which is the compiler stopping you from designing an API that is impossible to call.",
      ],
      examples: [
        {
          title: "All three in one function",
          variant: "good",
          code: `function makeBadge(
  name: string,              // required
  title: string = "Engineer", // optional via default
  email?: string,             // optional via ?
  ...skills: string[]         // rest — zero or more
): string {
  let line = \`\${name} — \${title}\`
  if (email) line += \` <\${email}>\`
  if (skills.length) line += \` [\${skills.join(", ")}]\`
  return line
}

console.log(makeBadge("Ada"))
console.log(makeBadge("Grace", "Rear Admiral", undefined, "COBOL", "compilers"))`,
          output: `Ada — Engineer
Grace — Rear Admiral [COBOL, compilers]`,
        },
        {
          title: "Forgetting the undefined case",
          variant: "bad",
          code: `function greet(prefix?: string): string {
  return prefix.toUpperCase() + " there"
}`,
          tsError:
            "error TS18048: 'prefix' is possibly 'undefined'.",
          caption:
            "This is strict mode protecting you: an optional parameter may be `undefined`, and calling `.toUpperCase()` on undefined crashes. Fix: `return (prefix ?? \"\").toUpperCase() + \" there\"`.",
        },
      ],
      keyPoints: [
        "`?` adds `| undefined` to the parameter's type — the compiler then forces you to handle it.",
        "Defaults remove the undefined case and make the parameter optional.",
        "Rest params `...skills: string[]` must come last and are always an array.",
      ],
    },
    {
      id: "d2-function-types",
      title: "Function type signatures",
      minutes: 20,
      paragraphs: [
        "Functions are values, so function types describe the shape of a callable value: `(a: number, b: number) => number`. You use these for callbacks, higher-order functions, and for giving a whole variable a reusable signature. The arrow here is a type-level arrow, distinct from the runtime arrow function — same symbol, different layer.",
        "A callback parameter can be typed inline, but once a signature appears twice, name it. Reusing a named function type is the difference between a codebase you can refactor and one you cannot.",
      ],
      examples: [
        {
          title: "Callbacks and higher-order functions",
          variant: "good",
          code: `// Named signature — reuse it everywhere:
type Comparator = (a: number, b: number) => number

const ascending: Comparator = (a, b) => a - b
const descending: Comparator = (a, b) => b - a

// Callback typed inline:
function retry(times: number, attempt: () => boolean): boolean {
  for (let i = 0; i < times; i++) {
    if (attempt()) return true
  }
  return false
}

console.log([3, 1, 2].sort(ascending))
console.log(retry(3, () => Math.random() > 0.5))`,
          output: `[1, 2, 3]
true (or false — it's random)`,
          caption:
            "When a variable is typed as `Comparator`, the params of the arrow function are inferred — you don't re-annotate `(a, b) =>`.",
        },
      ],
      keyPoints: [
        "Signature syntax: `(params) => returnType`. The arrow is part of the type, not runtime code.",
        "Typed callback parameters get inference for free — no re-annotation inside the arrow.",
      ],
    },
    {
      id: "d2-object-types",
      title: "Object types, readonly, optional properties",
      minutes: 30,
      paragraphs: [
        "An object type lists property names with their types. Inline object types are great for one-off shapes; named interfaces or type aliases are better the moment a shape appears twice. Optional properties use `?` (the property may be missing), and `readonly` makes a property immutable after creation — the compiler enforces it even though the runtime object remains a normal mutable JavaScript object.",
        "This matters a lot in real apps: configuration objects, props objects, and anything crossing a function boundary benefits from an explicit shape. Instead of remembering \"does the options object have retries or maxRetries?\", the type answers for you with autocomplete.",
      ],
      examples: [
        {
          title: "A precise object type",
          variant: "good",
          code: `interface ServerConfig {
  readonly host: string
  readonly port: number
  retries?: number        // optional
  labels: Record<string, string>
}

const config: ServerConfig = {
  host: "localhost",
  port: 8080,
  labels: { env: "dev" },
}

config.port = 9090        // error — readonly
config.timeout = 5000     // error — doesn't exist`,
          tsError:
            "error TS2540: Cannot assign to 'port' because it is a read-only property.\nerror TS2353: Object literal may only specify known properties — 'timeout' does not exist in type 'ServerConfig'.",
          caption:
            "Excess property checking is a special superpower of object literals: passing an unknown key is an error. Typos in config keys die instantly.",
        },
        {
          title: "Optional properties require handling",
          variant: "good",
          code: `interface Profile {
  displayName: string
  avatarUrl?: string
}

function avatar(profile: Profile): string {
  return profile.avatarUrl ?? "/fallback.png"
}

console.log(avatar({ displayName: "Ada" }))       // /fallback.png
console.log(avatar({ displayName: "Ada", avatarUrl: "/a.png" }))`,
          output: `/fallback.png
/a.png`,
        },
      ],
      keyPoints: [
        "`?` on a property: it may be absent — reading it yields `type | undefined` under strict mode.",
        "`readonly` blocks reassignment at compile time; the runtime object is still a plain object.",
        "Object literals get excess-property checks — unknown keys are rejected. Assigning from a variable is looser.",
      ],
    },
    {
      id: "d2-interface-vs-type",
      title: "interface vs type — the classic interview question",
      minutes: 25,
      paragraphs: [
        "Both can describe object shapes, and for that job they are ~95% interchangeable. The differences: `interface` describes only object/class shapes and supports *declaration merging* (declaring it twice merges the members — useful for augmenting library types); `type` can also express unions, tuples, primitives, and mapped/conditional types, and it composes via intersections.",
        "The practical convention used by most modern teams: `interface` for object shapes that others might implement or extend (especially public API shapes), `type` for everything else (unions, aliases, computed types). The TypeScript handbook itself says: prefer `interface` when you need its features, `type` when you need its flexibility. Consistency within a team matters more than the choice itself.",
      ],
      examples: [
        {
          title: "Same shape, two spellings",
          variant: "good",
          code: `interface IUser {
  id: number
  name: string
}

type TUser = {
  id: number
  name: string
}

// Both work identically here:
const u1: IUser = { id: 1, name: "ada" }
const u2: TUser = { id: 2, name: "grace" }`,
        },
        {
          title: "What only a type can do",
          variant: "good",
          code: `type ID = string | number          // union — impossible with interface
type Point = [number, number]       // tuple
type Handler = (e: string) => void  // function alias

// What only an interface can do — declaration merging:
interface Window {
  __debugMode: boolean   // augments the global Window!
}

// Later, another declaration MERGES with the first:
interface Window {
  __verbose: boolean
}`,
          caption:
            "Declaration merging is how libraries let you augment their types (e.g. adding properties to `Window` or extending a module's exports).",
        },
      ],
      keyPoints: [
        "For plain object shapes: either works — pick a convention and stay consistent.",
        "`type` handles unions, tuples, primitives, conditional/mapped types. `interface` does not.",
        "`interface` supports declaration merging; `type` does not.",
        "Interview answer in one line: \"interface for object contracts and extension, type for aliases and unions — 95% overlapping, consistency wins.\"",
      ],
      callouts: [
        {
          kind: "interview",
          title: "You WILL be asked this",
          body: "This is interview question #2 in your prep list. Say the differences out loud now: merging, unions, composability, and the convention you follow.",
        },
      ],
    },
    {
      id: "d2-extending",
      title: "Extending interfaces and intersections (&)",
      minutes: 25,
      paragraphs: [
        "Composition is how you avoid repeating shapes. Interfaces use `extends` — one interface inherits all members of another (multiple parents separated by commas). Types compose with the intersection operator `&`, which computes a type satisfying *both* sides. If the sides conflict, the result is a `never`-like impossible object — the compiler will flag assignments to it.",
        "Reuse beats repetition: define a small base shape like `Timestamps` and extend it into every entity, exactly like real ORMs and API layers do.",
      ],
      examples: [
        {
          title: "extends — object-oriented inheritance",
          variant: "good",
          code: `interface Timestamps {
  createdAt: string
  updatedAt: string
}

interface BaseModel extends Timestamps {
  id: number
}

interface Article extends BaseModel {
  title: string
  body: string
}

const a: Article = {
  id: 1,
  title: "TypeScript in 7 days",
  body: "...",
  createdAt: "2026-09-21T10:00:00Z",
  updatedAt: "2026-09-21T10:00:00Z",
}`,
        },
        {
          title: "Intersection (&) — type-level composition",
          variant: "good",
          code: `type Named = { name: string }
type Aged = { age: number }

type Person = Named & Aged          // must have BOTH name and age

const p: Person = { name: "ada", age: 36 } // OK

// Conflicting intersections produce impossible types:
type A = { status: string }
type B = { status: number }
type Conflicted = A & B

declare const c: Conflicted
c.status // type is string & number — effectively never. Avoid this.`,
          caption:
            "Intersections shine when combining utility results or building a type from existing pieces — you will use them heavily with the Day 5 utilities.",
        },
      ],
      keyPoints: [
        "`interface X extends A, B` — inherits members from one or more interfaces.",
        "`type X = A & B` — must satisfy both sides; conflicts create impossible types.",
        "Prefer composing small base shapes over copy-pasting properties across interfaces.",
      ],
    },
  ],
  quiz: [
    {
      id: "d2-q1",
      question: "What happens inside a function when a parameter is marked `email?: string`?",
      options: [
        "The parameter becomes any",
        "Its type is `string | undefined`, so you must handle the missing case",
        "The parameter is required but may be null",
        "TypeScript removes it from the function signature",
      ],
      answerIndex: 1,
      explanation:
        "Optional = the value may be absent, so reads produce `string | undefined`. Strict mode then forces you to handle undefined before using it — that's the safety net doing its job.",
    },
    {
      id: "d2-q2",
      question: "Which of these can a `type` alias express but an `interface` cannot?",
      options: [
        "An object with optional properties",
        "A union of string literals",
        "A readonly property",
        "A method signature",
      ],
      answerIndex: 1,
      explanation:
        "Unions are type-alias territory: `type Status = \"active\" | \"inactive\"`. Interfaces can only describe object/class shapes. The rest of the options work in both.",
    },
    {
      id: "d2-q3",
      question: "What is declaration merging?",
      options: [
        "Combining two types with the & operator",
        "Two `interface` declarations with the same name automatically merge their members into one",
        "Joining strings at runtime",
        "Merging tsconfig files during compilation",
      ],
      answerIndex: 1,
      explanation:
        "Declaring `interface Window` twice merges the declarations — this is how you augment library and global types. Type aliases cannot be merged; redeclaring one is an error.",
    },
    {
      id: "d2-q4",
      question: "Given `type Person = Named & Aged` where both are object types, an object of type Person must have…",
      options: [
        "Either name or age — whichever exists",
        "Both name and age properties",
        "Exactly one of the properties, chosen randomly",
        "None — intersections of objects are always never",
      ],
      answerIndex: 1,
      explanation:
        "Intersection means AND: the value must satisfy every member of both sides. Union (|) would be the OR case.",
    },
    {
      id: "d2-q5",
      question: "Why does assigning a variable (not a literal) with extra properties to a typed object often compile, while an object literal with the same extra properties fails?",
      options: [
        "A compiler bug that was never fixed",
        "Object literals get special excess-property checking; variables only need to be structurally compatible",
        "Variables are checked at runtime instead",
        "Extra properties are deleted from variables automatically",
      ],
      answerIndex: 1,
      explanation:
        "Fresh object literals are checked strictly (catching typos like `nmae`). A variable only needs to have at least the required properties with the right types — extra properties on non-fresh objects are allowed (structural typing, Day 7 question #10).",
    },
  ],
  practice: {
    intro:
      "Model a tiny e-commerce domain: this exact exercise (User, Product, Order) mirrors what take-home tests and real service layers ask for. Build it in the Playground, then deliberately pass wrong data to your functions and read the errors.",
    steps: [
      "Define `User` (id, email, displayName, optional avatarUrl, readonly createdAt).",
      "Define `Product` (id, title, price in cents, a `tags: string[]`, and a `status` of \"in-stock\" | \"low\" | \"out\" using a type alias with a union — preview of Day 3).",
      "Define `Order` (id, the user, an array of line items — each item a product plus quantity — and an optional discount code).",
      "Write `orderTotal(order: Order): number` that multiplies and sums line items, and `orderSummary(order: Order): string` that formats a one-line summary.",
      "Break it: pass a user with `emial` (typo), a product with price as string, an order with an empty items array. Read all three errors.",
    ],
    starter: `// Day 2 practice — model the domain

interface User {
  // your properties here
}

interface Product {
  // your properties here
}

interface Order {
  // your properties here
}

function orderTotal(order: Order): number {
  // implement
  return 0
}

const demoOrder: Order = {
  /* build one */
}

console.log(orderTotal(demoOrder))`,
    solution: `// Day 2 practice — a reference solution

interface User {
  id: number
  email: string
  displayName: string
  avatarUrl?: string
  readonly createdAt: string
}

type ProductStatus = "in-stock" | "low" | "out"

interface Product {
  id: number
  title: string
  price: number // cents
  tags: string[]
  status: ProductStatus
}

interface LineItem {
  product: Product
  quantity: number
}

interface Order {
  id: number
  user: User
  items: LineItem[]
  discountCode?: string
}

function orderTotal(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
}

function orderSummary(order: Order): string {
  const count = order.items.reduce((n, i) => n + i.quantity, 0)
  const cents = orderTotal(order)
  return \`Order #\${order.id} (\${order.user.displayName}): \${count} items, $\${(cents / 100).toFixed(2)}\`
}

const user: User = {
  id: 1,
  email: "ada@example.com",
  displayName: "Ada",
  createdAt: "2026-09-21T10:00:00Z",
}

const keyboard: Product = {
  id: 50,
  title: "Mechanical keyboard",
  price: 8999,
  tags: ["hardware"],
  status: "in-stock",
}

const order: Order = {
  id: 1000,
  user,
  items: [{ product: keyboard, quantity: 2 }],
}

console.log(orderTotal(order))   // 17998
console.log(orderSummary(order)) // Order #1000 (Ada): 2 items, $179.98`,
    solutionNote:
      "Note the layering: LineItem as its own interface, a named union for status, and how reduce's callback params get inference from the typed array.",
  },
};
