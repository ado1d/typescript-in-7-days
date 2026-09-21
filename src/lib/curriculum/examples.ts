import type { PlaygroundExample } from "./types";

export const playgroundExamples: PlaygroundExample[] = [
  {
    id: "pg-hello",
    title: "Hello TypeScript",
    description: "Your first compiled run: annotations, inference, and console output.",
    day: 1,
    code: `// Edit anything, then press Run (Ctrl/Cmd + Enter)
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet("Ada")
console.log(message)

// Try breaking it: change "Ada" to 42 and watch the Errors tab
let score: number = 42
console.log("score is", score)`,
  },
  {
    id: "pg-primitives",
    title: "Break the types (Day 1)",
    description: "Deliberately broken code — read the real compiler errors, then fix them.",
    day: 1,
    code: `// Three deliberate bugs — fix them one by one:
let userName: string = "ada"
userName = 42              // bug 1

let scores: number[] = [90, 85]
scores.push("100")         // bug 2

let user: [string, number] = ["ada", 36]
user[2] = true             // bug 3

console.log(userName, scores, user)`,
  },
  {
    id: "pg-interfaces",
    title: "Model a domain (Day 2)",
    description: "Interfaces, optional properties, and a function over your model.",
    day: 2,
    code: `interface User {
  readonly id: number
  name: string
  email?: string
}

const users: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace", email: "grace@example.com" },
]

function contactCard(u: User): string {
  return \`\${u.name} <\${u.email ?? "no email"}>\`
}

console.log(users.map(contactCard))

// Break it: add a user with nmae instead of name`,
  },
  {
    id: "pg-narrowing",
    title: "Narrow a union (Day 3)",
    description: "typeof narrowing, the safe operators, and the || vs ?? trap.",
    day: 3,
    code: `function describe(value: string | number | string[]): string {
  if (typeof value === "string") return \`text: \${value.toUpperCase()}\`
  if (typeof value === "number") return \`number: \${value.toFixed(2)}\`
  return \`list: \${value.join(", ")}\`
}

console.log(describe("hello"))
console.log(describe(3.14159))
console.log(describe(["a", "b", "c"]))

const port = 0
console.log("|| gives", port || 3000, "— ?? gives", port ?? 3000)`,
  },
  {
    id: "pg-discriminated",
    title: "Discriminated union (Day 3)",
    description: "The request-state machine — the pattern you will write forever.",
    day: 3,
    code: `type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string }

function render(state: RequestState): string {
  switch (state.status) {
    case "idle": return "Nothing requested yet"
    case "loading": return "Loading..."
    case "success": return \`\${state.data.length} results\`
    case "error": return \`Failed: \${state.message}\`
    default: {
      const exhausted: never = state
      return exhausted
    }
  }
}

const states: RequestState[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: ["a", "b"] },
  { status: "error", message: "network down" },
]

console.log(states.map(render))

// Delete a case above and watch the exhaustiveness error`,
  },
  {
    id: "pg-generics",
    title: "Generics lab (Day 4)",
    description: "Stack<T>, constraints, and the keyof-powered getter.",
    day: 4,
    code: `function getFirst<T>(arr: T[]): T {
  return arr[0]
}

class Stack<T> {
  private items: T[] = []
  push(x: T): void { this.items.push(x) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items.at(-1) }
}

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const numbers = new Stack<number>()
numbers.push(1)
numbers.push(2)

const user = { id: 1, name: "ada", active: true }

console.log(getFirst([10, 20]))
console.log("pop:", numbers.pop(), "peek:", numbers.peek())
console.log(getProp(user, "name"), getProp(user, "active"))

// Try: getProp(user, "nmae") — a typo'd key`,
  },
  {
    id: "pg-utilities",
    title: "Derive, don't redeclare (Day 5)",
    description: "One User interface, three derived shapes, zero duplication.",
    day: 5,
    code: `interface User {
  id: number
  name: string
  email: string
  passwordHash: string
}

type UserUpdate = Partial<User>
type UserPreview = Pick<User, "id" | "name">
type CreateUser = Omit<User, "id">
type UserMap = Record<number, UserPreview>

const patch: UserUpdate = { name: "Ada L." }
const payload: CreateUser = {
  name: "ada",
  email: "ada@example.com",
  passwordHash: "…",
}
const users: UserMap = {
  1: { id: 1, name: "ada" },
  2: { id: 2, name: "grace" },
}

console.log(patch)
console.log(payload)
console.log(users[1], users[2] ?? "empty")

// Try: add an unknown key to patch — rejected!
// Try: missing key 2 in users — rejected (Record requires all)`,
  },
  {
    id: "pg-classes",
    title: "Classes & async (Day 6)",
    description: "Parameter properties, abstract classes, and typed promises.",
    day: 6,
    code: `interface Printable {
  summarize(): string
}

abstract class Account implements Printable {
  constructor(
    public readonly owner: string,
    protected balance: number = 0,
  ) {}

  deposit(amount: number): void {
    this.balance += amount
  }

  abstract monthlyFee(): number

  applyFees(): void { this.balance -= this.monthlyFee() }

  summarize(): string {
    return \`\${this.owner}: $\${this.balance.toFixed(2)}\`
  }
}

class Checking extends Account {
  monthlyFee(): number { return 5 }
}

async function loadConfig(): Promise<{ retries: number }> {
  return { retries: 3 }
}

const acct = new Checking("Ada")
acct.deposit(250)
acct.applyFees()
console.log(acct.summarize())

const [config] = await Promise.all([loadConfig()])
console.log("retries:", config.retries)`,
  },
  {
    id: "pg-interview",
    title: "Interview whiteboard (Day 7)",
    description: "The tiny examples you should be able to write from memory.",
    day: 7,
    code: `// 1. keyof + generics — type-safe access
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 2. Structural typing — shape, not name
interface Loggable { message: string }
const log = (l: Loggable) => l.message
console.log(log({ message: "I fit structurally", extra: true }))

// 3. Narrowing + exhaustiveness
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2
    case "square": return s.side ** 2
  }
}

// 4. The || vs ?? trap
const port = 0
console.log(port || 3000, port ?? 3000)

// 5. readonly vs const
const frozen: Readonly<{ a: number }> = { a: 1 }
// frozen.a = 2  // error — uncomment to see it

console.log(getProp({ x: 1, y: 2 }, "y"))
console.log(area({ kind: "circle", radius: 2 }).toFixed(2))`,
  },
];

export const defaultPlaygroundCode = `// TypeScript Playground — server-checked, zero setup
// Type code, press Run (Ctrl/Cmd + Enter), read the Errors tab.
// Everything from Days 1-7 works here. Delete and experiment!

interface Lesson {
  day: number
  topic: string
  minutes: number
}

const week: Lesson[] = [
  { day: 1, topic: "basic types", minutes: 150 },
  { day: 2, topic: "interfaces", minutes: 150 },
  { day: 3, topic: "narrowing", minutes: 180 },
]

const totalMinutes = week.reduce((sum, l) => sum + l.minutes, 0)

console.log(\`\${week.length} lessons, \${totalMinutes} minutes total\`)
console.log(week.map((l) => \`Day \${l.day}: \${l.topic}\`).join("\\n"))

// Try these experiments:
// 1. Change topic: string  ->  topic: number  (read the error)
// 2. Add  { day: 4, topic: "generics", minutes: "180" }  (string minutes!)
// 3. Make minutes optional with ?  and handle the sum safely with ??`;
