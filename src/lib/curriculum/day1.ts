import type { Day } from "./types";

export const day1: Day = {
  id: 1,
  title: "Setup & Basic Types",
  subtitle: "Get the tools running, then learn the primitive building blocks of TypeScript",
  hours: "~2.5 hours",
  goal: "By the end of Day 1 you can compile and run a .ts file, and you can read every basic type annotation without guessing.",
  icon: "setup",
  intro: [
    "Welcome to Day 1. Today is about building muscle memory for the fundamentals: installing the tools, compiling your first file, and understanding the handful of primitive types you will use in every single TypeScript program you ever write.",
    "Assuming you already know basic JavaScript (variables, functions, arrays, objects, async/await), today will feel familiar — TypeScript is JavaScript plus a type system. If any of those JS concepts are rusty, spend your first hour on a quick refresher before continuing; everything ahead builds on them.",
  ],
  sections: [
    {
      id: "d1-what-is-ts",
      title: "What TypeScript is, and how it compiles",
      minutes: 20,
      paragraphs: [
        "TypeScript is JavaScript with a type system. It was created at Microsoft and is maintained as an open-source project. You write `.ts` files, the TypeScript compiler (`tsc`) checks your types, and then it erases the types and emits plain `.js` that Node, browsers, and every other JS runtime understand. Types never exist at runtime — they are a compile-time safety net.",
        "This has two practical consequences. First, valid JavaScript is valid TypeScript: you can rename `hello.js` to `hello.ts` and it compiles. Second, the type system cannot catch every bug (logic errors, bad data from an API), but it catches an entire category of mistakes before you even run the code — the classic \"undefined is not a function\" family of errors.",
      ],
      examples: [
        {
          title: "greet.ts — what you write",
          code: `function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet("Ada")
console.log(message)`,
          variant: "good",
          output: "Hello, Ada!",
        },
        {
          title: "greet.js — what Node actually runs (types are erased)",
          code: `function greet(name) {
  return "Hello, " + name + "!";
}
var message = greet("Ada");
console.log(message);`,
          language: "javascript",
          variant: "neutral",
          caption:
            "Notice the compiled output looks like older JavaScript — the compiler can target ES5 for maximum compatibility. All type information is gone.",
        },
      ],
      keyPoints: [
        "TypeScript = JavaScript + a compile-time type system. Types are fully erased in the output.",
        "Any valid `.js` file is already a valid `.ts` file — adopting TypeScript is incremental by design.",
        "The compiler is called `tsc`; it both type-checks and transpiles.",
      ],
      callouts: [
        {
          kind: "info",
          title: "Why not just use JSDoc?",
          body: "JSDoc comments can power TS checks in `.js` files, but the syntax is verbose and easy to get wrong. Real annotations in `.ts` files give you the same safety with far less noise and much better IDE support.",
        },
      ],
    },
    {
      id: "d1-setup",
      title: "Install Node, TypeScript, and a runner",
      minutes: 25,
      paragraphs: [
        "TypeScript runs on top of Node.js, so install Node first (version 18 or newer recommended). Then install two tools: the `typescript` package, which gives you the `tsc` compiler, and `tsx`, which runs `.ts` files directly without a manual compile step — perfect for learning. `ts-node` is an older alternative with the same purpose; `tsx` is faster and needs zero configuration.",
        "You should also bookmark the online Playground at typescriptlang.org/play. It lets you experiment with snippets, see the emitted JavaScript, and hover values to inspect their types — all without installing anything. It even shows errors as you type.",
      ],
      examples: [
        {
          title: "Terminal — setup and first compile",
          language: "bash",
          variant: "neutral",
          code: `# 1. Check Node (v18+ recommended)
node -v

# 2. Install the compiler and a fast runner
npm install -g typescript tsx

# 3. Verify the compiler
tsc --version

# 4. Compile a file (emits hello.js next to hello.ts)
tsc hello.ts
node hello.js

# 5. Or skip the manual step — run TypeScript directly
tsx hello.ts`,
        },
      ],
      keyPoints: [
        "`tsc file.ts` compiles to `.js`; run the output with `node`.",
        "`tsx file.ts` runs TypeScript directly — the recommended learning loop.",
        "The Playground at typescriptlang.org/play works offline of your machine and shows live errors + emitted JS.",
      ],
    },
    {
      id: "d1-primitives",
      title: "Primitives: string, number, boolean, null, undefined",
      minutes: 25,
      paragraphs: [
        "TypeScript has the same primitives as JavaScript, just spelled as type names in annotations. The syntax is `name: type` after a variable, parameter, or property. A type annotation is a promise to the compiler — and the compiler will hold you to it.",
        "Note that `null` and `undefined` are types too. With `strict` mode enabled (you will turn it on Day 6), `null` and `undefined` are not silently assignable to other types — which is exactly what saves you from \"cannot read property of null\" crashes.",
      ],
      examples: [
        {
          title: "The five primitives",
          variant: "good",
          code: `let userName: string = "ada"
let score: number = 42
let isActive: boolean = true
let nothing: null = null
let missing: undefined = undefined

// number covers ALL of these — there is no separate int/float
let big: number = 9007199254740993
let ratio: number = 3.14159
let hex: number = 0xff
let temp: number = -12.5`,
        },
        {
          title: "Breaking the promise",
          variant: "bad",
          code: `let score: number = 42
score = "42"`,
          tsError: "error TS2322: Type 'string' is not assignable to type 'number'.",
          caption:
            "Read the error out loud: the thing on the right is a `string`, the thing on the left was promised `number`. Learning to read errors like this is the real skill of Day 1.",
        },
        {
          title: "See it in the playground",
          variant: "neutral",
          code: `// Paste this into the app's Playground and hit Run (Ctrl/Cmd+Enter):
let score: number = 42
score = "42"

// The Errors tab shows:
// error TS2322: Type 'string' is not assignable to type 'number'.`,
          caption: "TypeScript found the bug before the program ever ran. That is the whole point.",
        },
      ],
      keyPoints: [
        "Annotation syntax: `let name: type = value` — the type goes after the name, not before.",
        "`number` covers integers and floats — there is no separate `int` type.",
        "Type errors stop compilation; they do not appear at runtime.",
      ],
    },
    {
      id: "d1-arrays-tuples-enums",
      title: "Arrays, tuples, and enums",
      minutes: 30,
      paragraphs: [
        "Arrays are typed with `Type[]` (read it as \"array of Type\") or with the equivalent generic form `Array<Type>`, which you will meet again on Day 4. TypeScript tracks what is *inside* the array, so pushing a wrong element type is an error, not a runtime surprise.",
        "A tuple is an array with a fixed length where every position has its own type: `[string, number]` means exactly two elements, string first, number second. Tuples are common for pairs like coordinates, `[key, value]` entries, or function returns of a fixed shape.",
        "An enum is a set of named constants. String enums are the recommended style — they survive minification and are readable in logs. The modern alternative is a union of string literals (Day 3), which is lighter and often preferred; enums are still worth knowing because older codebases use them heavily.",
      ],
      examples: [
        {
          title: "Arrays",
          variant: "good",
          code: `let scores: number[] = [90, 85, 77]
let names: Array<string> = ["ada", "grace"] // same type, generic form

scores.push(100) // fine
scores[0].toFixed(1) // "90.0" — elements are numbers

const first = names[0] // string (or string | undefined with noUncheckedIndexedAccess)`,
        },
        {
          title: "Arrays — wrong element type",
          variant: "bad",
          code: `let scores: number[] = [90, 85, 77]
scores.push("100")`,
          tsError:
            "error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.",
        },
        {
          title: "Tuples — fixed length, fixed positions",
          variant: "good",
          code: `let user: [string, number] = ["ada", 36]

let coordinate: [number, number] = [48.85, 2.35]

const [name, age] = user // name: string, age: number — destructuring works

const httpOk: [number, string] = [200, "OK"]`,
        },
        {
          title: "Enums — named constants",
          variant: "good",
          code: `enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
}

let current: Status = Status.Active

function label(status: Status): string {
  switch (status) {
    case Status.Active: return "Account is active"
    case Status.Inactive: return "Account is closed"
    case Status.Pending: return "Awaiting confirmation"
  }
}

console.log(label(Status.Pending)) // "Awaiting confirmation"`,
          output: "Awaiting confirmation",
        },
      ],
      keyPoints: [
        "`number[]` and `Array<number>` are two spellings of the same type.",
        "Tuples: fixed length + per-position types, like `[string, number]`.",
        "Prefer string enums (`= \"ACTIVE\"`) over implicit number enums; or skip enums entirely and use literal unions (Day 3).",
      ],
      callouts: [
        {
          kind: "tip",
          title: "Enum vs literal union — a preview",
          body: "Many modern codebases write `type Status = \"active\" | \"inactive\" | \"pending\"` instead of an enum: zero runtime code, full autocomplete. You will learn this on Day 3 — it is a very common interview question.",
        },
      ],
    },
    {
      id: "d1-special-types",
      title: "any, unknown, void, never",
      minutes: 25,
      paragraphs: [
        "These four special types confuse everyone at first, so learn them precisely now. `any` opts a value out of the type system completely — any operation compiles, which is why it is dangerous. `unknown` is the safe sibling: it can hold anything, but you must narrow it (check what it actually is) before using it. The rule: `unknown` at boundaries (API responses, parsed JSON), `never` by accident, `any` almost never.",
        "`void` describes the return type of functions that return nothing useful. `never` is the type of values that can never occur — a function that always throws, or an infinite loop. `never` feels abstract today; on Day 3 it becomes a powerful exhaustiveness-checking tool.",
      ],
      examples: [
        {
          title: "any — the escape hatch (use sparingly)",
          variant: "bad",
          code: `let loose: any = "I could be anything"

loose.toUpperCase()   // compiles
loose.foo.bar.baz()   // compiles too — and explodes at runtime
loose = 42            // sure, why not`,
          tsError: "(no error — that is the problem. any silences the compiler.)",
          caption:
            "The code compiles and then crashes at runtime with \"Cannot read properties of undefined\". `any` disabled your safety net.",
        },
        {
          title: "unknown — anything, but prove it first",
          variant: "good",
          code: `let safe: unknown = "probably a string"

safe.toUpperCase() // error: 'safe' is of type 'unknown'

if (typeof safe === "string") {
  console.log(safe.toUpperCase()) // OK: narrowed to string
}`,
          output: "PROBABLY A STRING",
          caption:
            "With `unknown` you must narrow before use. In editors, the erroneous line shows: error TS18046: 'safe' is of type 'unknown'.",
        },
        {
          title: "void and never",
          variant: "good",
          code: `// void: returns nothing worth using
function log(message: string): void {
  console.log(message)
}

// never: can NEVER return normally
function fail(message: string): never {
  throw new Error(message)
}

function endlessLoop(): never {
  while (true) {}
}`,
        },
      ],
      keyPoints: [
        "`any` = no checking. `unknown` = checked, must narrow before use. Prefer `unknown` at system boundaries.",
        "`void` = function returns nothing (you usually let it be inferred).",
        "`never` = a value that cannot exist: always-throws or never-returns functions.",
      ],
      callouts: [
        {
          kind: "interview",
          title: "This exact distinction is interview question #3",
          body: "\"any vs unknown vs never\" is one of the most-asked TypeScript interview questions. You now know enough to answer it — you will rehearse the 2-sentence version on Day 7.",
        },
      ],
    },
    {
      id: "d1-annotation-vs-inference",
      title: "Type annotations vs type inference",
      minutes: 20,
      paragraphs: [
        "Here is the balance that separates clean TypeScript from noisy TypeScript: annotate what the compiler cannot know, and let inference handle the rest. When you initialize a variable on the same line, TypeScript infers the type and re-annotating it is redundant noise.",
        "The places you DO annotate deliberately: function parameters (the compiler cannot read your mind from a call site), the return types of exported functions (an API contract for consumers), and variables that start as `null` or will hold different types over time.",
      ],
      examples: [
        {
          title: "Inference already knows — don't shout",
          variant: "neutral",
          code: `// Inferred correctly — annotating these is noise:
const count = 10        // number
const name = "ada"      // string
const list = [1, 2, 3]  // number[]
const pair = [1, "a"]   // (string | number)[]

// Annotate when TS can't know:
function double(n: number) {   // param: required annotation
  return n * 2                 // return: inferred as number
}`,
        },
        {
          title: "The classic inference gotcha",
          variant: "bad",
          code: `let total = 0        // inferred: number
total = "120"        // fine? NO:

// error TS2322: Type 'string' is not assignable to type 'number'.`,
          tsError: "error TS2322: Type 'string' is not assignable to type 'number'.",
          caption:
            "Inference still enforces consistency: once `total` is inferred as `number`, only numbers can enter. If you truly need reassignment with a different type, that is a design smell — usually two variables.",
        },
      ],
      keyPoints: [
        "Rule of thumb: annotate function parameters and public API return types; infer local variables.",
        "Inference is static — the inferred type does not change after declaration, even if the value does.",
        "Too many annotations is a code smell; TypeScript's inference is deep and trustworthy.",
      ],
    },
  ],
  quiz: [
    {
      id: "d1-q1",
      question: "What does the TypeScript compiler emit after type-checking?",
      options: [
        "A special .tsbin binary that Node executes with special flags",
        "Plain JavaScript with the types erased",
        "JavaScript plus runtime type checks on every variable",
        "WebAssembly for maximum performance",
      ],
      answerIndex: 1,
      explanation:
        "Types are a compile-time concept only. `tsc` erases them and emits standard JavaScript — there are zero runtime type checks in the output (that is what libraries like Zod are for, on the server boundary).",
    },
    {
      id: "d1-q2",
      question: "Which assignment compiles?",
      options: [
        "const n: number = \"42\"",
        "const s: string = 42",
        "const b: boolean = false",
        "const u: undefined = null",
      ],
      answerIndex: 2,
      explanation:
        "`false` is a boolean, so it matches. In strict mode, `undefined` and `null` are distinct types — you cannot assign null to undefined or vice versa (unless strictNullChecks is off, which you should never allow).",
    },
    {
      id: "d1-q3",
      question: "What is the practical difference between any and unknown?",
      options: [
        "No difference — unknown is just the newer spelling",
        "unknown is for values from JSON, any is for values from APIs",
        "any disables type checking entirely; unknown allows anything in but requires narrowing before use",
        "unknown makes code run faster",
      ],
      answerIndex: 2,
      explanation:
        "`any` is a full opt-out: every operation compiles. `unknown` accepts any value but blocks operations until you prove what it is (typeof checks, type guards). Use unknown at the edges of your system.",
    },
    {
      id: "d1-q4",
      question: "What is the type of `pair` in: const pair = [1, \"a\"]?",
      options: ["[number, string] (a tuple)", "(string | number)[]", "any[]", "Error — mixed arrays are not allowed"],
      answerIndex: 1,
      explanation:
        "Inference widens a mixed array to an array of the union of its element types. To get a fixed-shape tuple you must annotate: `const pair: [number, string] = [1, \"a\"]`.",
    },
    {
      id: "d1-q5",
      question: "Which function return type is correct for a function that always throws?",
      options: ["void", "undefined", "never", "any"],
      answerIndex: 2,
      explanation:
        "A function that always throws never returns a value at all — not even undefined — so its return type is `never`. `void` means \"returns, but with a useless value\".",
    },
  ],
  practice: {
    intro:
      "Today's practice is deliberately mechanical: type by hand, then break things on purpose. You learn TypeScript by reading red squiggles, not by reading prose. Do every step in the app's Playground (or your editor) — type it out, do not copy-paste.",
    steps: [
      "Declare 10 variables covering: `string`, `number`, `boolean`, `null`, `undefined`, `string[]`, `number[]`, a tuple `[string, number]`, a string enum, and one `unknown`.",
      "Write 3 tiny functions: `add(a: number, b: number): number`, `shout(text: string): string`, and `logValue(v: unknown): void` that only prints after a typeof check.",
      "Deliberately break each one: assign a string to your number, push a boolean into `number[]`, index the tuple out of order, call `.toUpperCase()` on the `unknown`.",
      "Read every error message out loud. Identify the \"expected\" type and the \"actual\" type in each message — every TS error names both.",
      "In the Playground, fix each error until the Errors tab is empty and the code runs.",
    ],
    starter: `// Day 1 practice — fill in the types, then break them on purpose

let userName = "ada"            // add a string annotation
let score = 42                  // add a number annotation
let tags = ["ts", "js"]         // add a string[] annotation
let user = ["ada", 36]          // make this a tuple [string, number]

function add(a: number, b: number) {
  return a + b
}

console.log(add(2, 3))
console.log(userName, score, tags, user)`,
    solution: `// Day 1 practice — one correct version

let userName: string = "ada"
let score: number = 42
let tags: string[] = ["ts", "js"]
let user: [string, number] = ["ada", 36]

enum Role {
  Admin = "ADMIN",
  Member = "MEMBER",
}

let parsed: unknown = JSON.parse('"42"')

function add(a: number, b: number): number {
  return a + b
}

function shout(text: string): string {
  return text.toUpperCase()
}

function logValue(value: unknown): void {
  if (typeof value === "string") {
    console.log("string:", value)
  } else if (typeof value === "number") {
    console.log("number:", value)
  } else {
    console.log("something else")
  }
}

console.log(add(2, 3))        // 5
console.log(shout("hello"))   // HELLO
logValue(parsed)              // string: 42`,
    solutionNote:
      "Notice how little annotation the solution actually needs — parameters and the enum, plus the deliberate `unknown`. Local variables like `add`'s return type are already inferred.",
  },
};
