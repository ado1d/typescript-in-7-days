import type { CheatCategory } from "./types";

export const cheatsheet: CheatCategory[] = [
  {
    id: "cheat-types",
    title: "Primitives & Declarations",
    icon: "types",
    items: [
      {
        title: "Basic annotations",
        code: `let name: string = "ada"
let score: number = 42
let active: boolean = true
let ids: number[] = [1, 2]
let pair: [string, number] = ["ada", 36]`,
      },
      {
        title: "Special types",
        code: `let x: unknown = "check first"   // any value, must narrow
let y: any = "no checking"        // avoid
function log(m: string): void {} // returns nothing
function fail(): never { throw new Error() }`,
        note: "unknown at boundaries, never for unreachable code.",
      },
      {
        title: "Literal unions & enums",
        code: `type Role = "admin" | "user" | "guest"

enum Status {
  Active = "ACTIVE",
  Pending = "PENDING",
}`,
        note: "Prefer literal unions in modern code — zero runtime.",
      },
    ],
  },
  {
    id: "cheat-functions",
    title: "Functions",
    icon: "functions",
    items: [
      {
        title: "Signature anatomy",
        code: `function greet(name: string, greeting = "Hi"): string {
  return \`\${greeting}, \${name}\`
}

type Comparator = (a: number, b: number) => number

const sort: Comparator = (a, b) => a - b`,
      },
      {
        title: "Optional / rest",
        code: `function badge(name: string, email?: string, ...tags: string[]): string {
  return \`\${name}\${email ? " <" + email + ">" : ""} [\${tags.join(",")}]\`
}`,
      },
      {
        title: "Overloads by union",
        code: `function parse(input: string): number[]
function parse(input: number): string
function parse(input: string | number): any {
  if (typeof input === "string") return input.split("")
  return String(input)
}`,
      },
    ],
  },
  {
    id: "cheat-objects",
    title: "Objects & Interfaces",
    icon: "objects",
    items: [
      {
        title: "Shapes",
        code: `interface User {
  readonly id: number
  name: string
  avatarUrl?: string
}

interface Profile extends User {
  bio: string
}

type Person = Named & Aged   // intersection: needs both`,
      },
      {
        title: "interface vs type",
        code: `interface Win { a: string }
interface Win { b: string }  // MERGES — library augmentation

type ID = string | number    // unions: type only
type Handler = (e: string) => void`,
      },
    ],
  },
  {
    id: "cheat-unions",
    title: "Unions & Narrowing",
    icon: "unions",
    items: [
      {
        title: "The four built-in checks",
        code: `if (typeof x === "string") {}      // primitives
if (pet instanceof Dog) {}        // classes
if ("meow" in pet) {}             // property presence
if (x !== undefined) {}           // precise nullish check`,
      },
      {
        title: "Discriminated union",
        code: `type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }

switch (state.status) {
  case "error": return state.message  // narrowed!
  default: return "…"
}`,
        note: "Assign a never in default for exhaustiveness.",
      },
      {
        title: "Safe operators",
        code: `user?.address?.city        // undefined instead of crash
fn?.()                    // call only if fn exists
port ?? 3000              // default only for null/undefined
x as T                    // trust me (no runtime check)
value!                    // definitely not null`,
      },
    ],
  },
  {
    id: "cheat-generics",
    title: "Generics",
    icon: "generics",
    items: [
      {
        title: "Functions & classes",
        code: `function first<T>(arr: T[]): T { return arr[0] }

class Stack<T> {
  private items: T[] = []
  push(x: T) { this.items.push(x) }
  pop(): T | undefined { return this.items.pop() }
}`,
      },
      {
        title: "Constraints & keyof",
        code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}`,
      },
      {
        title: "Deriving from values",
        code: `const endpoints = { users: "/u" } as const

type Key = keyof typeof endpoints  // "users"
type Path = typeof endpoints.users // "/u" (literal)
type Item = typeof list[number]    // element type`,
      },
    ],
  },
  {
    id: "cheat-utilities",
    title: "Utility Types",
    icon: "utilities",
    items: [
      {
        title: "The big six",
        code: `type Update  = Partial<User>              // all optional
type Strict  = Required<User>              // all required
type Frozen  = Readonly<User>              // all readonly
type Preview = Pick<User, "id" | "name">   // keep these
type Create  = Omit<User, "id">            // drop these
type Lookup  = Record<string, User>        // keyed map`,
      },
      {
        title: "Reflection family",
        code: `type R = ReturnType<typeof fn>            // what fn returns
type P = Parameters<typeof fn>           // fn's params tuple
type N = NonNullable<string | null>      // string
type A = Awaited<Promise<string>>        // string

type Email = User["email"]               // indexed access
type Field = User[keyof User]            // union of field types`,
      },
    ],
  },
  {
    id: "cheat-classes",
    title: "Classes & Modules",
    icon: "classes",
    items: [
      {
        title: "Class anatomy",
        code: `abstract class Base implements Printable {
  constructor(          // parameter properties: one line
    public readonly id: number,
    protected secret = "",
  ) {}
  abstract run(): void
}

class Impl extends Base {
  run() { console.log(this.id) }
}`,
      },
      {
        title: "Module pattern",
        code: `import type { User } from "./types"     // erased at build
import { getUser, type Repo } from "./db" // mixed inline

// index.ts barrel:
export * from "./types"
export { getUser } from "./db"`,
      },
    ],
  },
  {
    id: "cheat-config",
    title: "Config & Async",
    icon: "config",
    items: [
      {
        title: "tsconfig essentials",
        code: `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "outDir": "./dist",
    "esModuleInterop": true
  }
}`,
        note: "strict = strictNullChecks + noImplicitAny + more.",
      },
      {
        title: "Typed fetch recipe",
        code: `async function getUser(id: number): Promise<User | null> {
  const res = await fetch(\`/users/\${id}\`)
  if (!res.ok) return null
  return (await res.json()) as User   // assert at the edge
}

const [a, b] = await Promise.all([getUser(1), getPost(2)])`,
      },
    ],
  },
];
