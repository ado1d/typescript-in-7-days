import {
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

/**
 * Custom TypeScript completion source for the playground editor.
 *
 * Provides, as you type:
 * - TS/JS keywords, type-only keywords, literals and utility types
 * - Built-in globals (console, Math, JSON, Promise, ...)
 * - Member completions after a dot for well-known objects (console., Math., ...)
 * - Skeleton snippets (interface, type, class, enum, log, try, for-of, ...)
 * - Identifiers already used in the document
 */

const kw = (label: string, detail?: string, boost = 0): Completion => ({
  label,
  type: "keyword",
  detail,
  boost,
});

const ty = (label: string, detail?: string, boost = 0): Completion => ({
  label,
  type: "type",
  detail,
  boost,
});

const gl = (label: string, detail?: string, boost = 0): Completion => ({
  label,
  type: "class",
  detail,
  boost,
});

const fn = (label: string, detail: string, boost = 0): Completion => ({
  label,
  type: "function",
  detail,
  boost,
});

/** Plain language keywords (control flow + declarations). */
const KEYWORDS: Completion[] = [
  kw("const", "declare a block-scoped constant", 3),
  kw("let", "declare a block-scoped variable", 3),
  kw("var", "declare a variable (avoid in modern TS)", 1),
  kw("return", "return a value", 3),
  kw("if", "conditional statement", 3),
  kw("else", "conditional alternative", 2),
  kw("for", "loop statement", 2),
  kw("while", "loop while a condition holds"),
  kw("do", "do...while loop"),
  kw("switch", "multi-way branch"),
  kw("case", "case inside switch"),
  kw("default", "default case"),
  kw("break", "exit a loop or switch"),
  kw("continue", "skip to the next iteration"),
  kw("throw", "throw an exception", 2),
  kw("catch", "handle an exception"),
  kw("finally", "always runs after try/catch"),
  kw("async", "mark a function as async", 2),
  kw("await", "wait for a promise", 3),
  kw("yield", "yield a generator value"),
  kw("new", "construct an instance", 3),
  kw("this", "the current receiver"),
  kw("super", "access the parent class"),
  kw("typeof", "narrow by primitive type"),
  kw("instanceof", "narrow by class/prototype"),
  kw("in", "check for a property"),
  kw("delete", "delete a property"),
  kw("void", "evaluate and discard / no value"),
  kw("as", "type assertion: value as Type", 3),
  kw("satisfies", "validate without widening: value satisfies Type", 2),
  kw("keyof", "union of an object's keys", 3),
  kw("infer", "infer a type inside a conditional"),
  kw("is", "custom type guard: x is Type", 2),
  kw("asserts", "assertion signature (advanced)", 0),
  kw("declare", "ambient declaration"),
  kw("readonly", "read-only property", 2),
  kw("public", "class member visibility"),
  kw("private", "class member visibility"),
  kw("protected", "class member visibility"),
  kw("static", "class-level member"),
  kw("abstract", "abstract class or member"),
  kw("override", "mark an override explicitly"),
  kw("get", "getter accessor"),
  kw("set", "setter accessor"),
  kw("export", "export a binding"),
  kw("import", "import a binding"),
  kw("from", "module specifier clause"),
  kw("namespace", "ambient or legacy namespace"),
  kw("module", "ambient module"),
  kw("extends", "inherit from a class/type"),
  kw("implements", "implement an interface"),
  kw("of", "iterate values: for...of"),
];

/** Type-position-only keywords. */
const TYPE_KEYWORDS: Completion[] = [
  ty("string", "primitive: string", 2),
  ty("number", "primitive: number", 2),
  ty("boolean", "primitive: boolean", 2),
  ty("object", "non-primitive: object"),
  ty("symbol", "primitive: symbol"),
  ty("bigint", "primitive: bigint"),
  ty("null", "type and value null"),
  ty("undefined", "type and value undefined"),
  ty("any", "opt out of checking (avoid)", 2),
  ty("unknown", "safe top type — narrow before use", 3),
  ty("never", "bottom type — unreachable"),
  ty("Record", "Record<K, V> — object with K keys and V values", 3),
  ty("Partial", "Partial<T> — all properties optional"),
  ty("Required", "Required<T> — all properties required"),
  ty("Readonly", "Readonly<T> — all properties readonly"),
  ty("Pick", "Pick<T, K> — keep only keys K"),
  ty("Omit", "Omit<T, K> — remove keys K"),
  ty("Exclude", "Exclude<T, U> — remove U from union"),
  ty("Extract", "Extract<T, U> — keep U from union"),
  ty("NonNullable", "NonNullable<T> — remove null/undefined"),
  ty("ReturnType", "ReturnType<F> — return type of F"),
  ty("Parameters", "Parameters<F> — parameter tuple of F"),
  ty("Awaited", "Awaited<T> — awaited type of T"),
  ty("Array", "Array<T> — T[]"),
];

/** Literal constants. */
const CONSTANTS: Completion[] = [
  { label: "true", type: "constant", detail: "literal: true", boost: 2 },
  { label: "false", type: "constant", detail: "literal: false", boost: 2 },
  { label: "null", type: "constant", detail: "literal: null" },
  { label: "undefined", type: "constant", detail: "literal: undefined" },
  { label: "NaN", type: "constant", detail: "(const) NaN: number" },
  { label: "Infinity", type: "constant", detail: "(const) Infinity: number" },
  { label: "globalThis", type: "constant", detail: "(var) globalThis: typeof globalThis" },
];

/** Built-in global values. */
const GLOBALS: Completion[] = [
  { label: "console", type: "variable", detail: "(var) console: Console", boost: 3 },
  gl("Math", "(var) Math: Math"),
  gl("JSON", "(var) JSON: JSON"),
  gl("Object", "(var) Object: ObjectConstructor"),
  gl("Array", "(var) Array: ArrayConstructor"),
  gl("String", "(var) String: StringConstructor"),
  gl("Number", "(var) Number: NumberConstructor"),
  gl("Boolean", "(var) Boolean: BooleanConstructor"),
  gl("Promise", "(var) Promise: PromiseConstructor", 2),
  gl("Map", "(var) Map: MapConstructor", 1),
  gl("Set", "(var) Set: SetConstructor", 1),
  gl("WeakMap", "(var) WeakMap: WeakMapConstructor"),
  gl("WeakSet", "(var) WeakSet: WeakSetConstructor"),
  gl("Date", "(var) Date: DateConstructor"),
  gl("RegExp", "(var) RegExp: RegExpConstructor"),
  gl("Error", "(var) Error: ErrorConstructor"),
  gl("TypeError", "(var) TypeError: TypeErrorConstructor"),
  gl("RangeError", "(var) RangeError: RangeErrorConstructor"),
  gl("Symbol", "(var) Symbol: SymbolConstructor"),
  gl("BigInt", "(var) BigInt: BigIntConstructor"),
  gl("Reflect", "(var) Reflect: typeof Reflect"),
  gl("Proxy", "(var) Proxy: ProxyConstructor"),
  gl("ArrayBuffer", "(var) ArrayBuffer: ArrayBufferConstructor"),
  fn("setTimeout", "(function) setTimeout(callback: () => void, ms: number): number"),
  fn("setInterval", "(function) setInterval(callback: () => void, ms: number): number"),
  fn("clearTimeout", "(function) clearTimeout(id: number): void"),
  fn("clearInterval", "(function) clearInterval(id: number): void"),
  fn("parseInt", "(function) parseInt(string: string, radix?: number): number"),
  fn("parseFloat", "(function) parseFloat(string: string): number"),
  fn("isNaN", "(function) isNaN(value: number): boolean"),
  fn("isFinite", "(function) isFinite(value: number): boolean"),
  { label: "document", type: "variable", detail: "(var) document: Document" },
  { label: "window", type: "variable", detail: "(var) window: Window & typeof globalThis" },
];

/** Member completions for well-known receivers. */
const method = (label: string, detail: string): Completion => ({ label, type: "method", detail });
const property = (label: string, detail: string): Completion => ({ label, type: "property", detail });

const BUILTIN_MEMBERS: Record<string, Completion[]> = {
  console: [
    method("log", "(method) log(...data: any[]): void — print to the console"),
    method("error", "(method) error(...data: any[]): void — print an error"),
    method("warn", "(method) warn(...data: any[]): void — print a warning"),
    method("info", "(method) info(...data: any[]): void"),
    method("debug", "(method) debug(...data: any[]): void"),
    method("table", "(method) table(data: unknown): void — pretty-print a table"),
    method("trace", "(method) trace(...data: any[]): void — print a stack trace"),
    method("time", "(method) time(label: string): void — start a timer"),
    method("timeEnd", "(method) timeEnd(label: string): void — stop a timer"),
    method("count", "(method) count(label: string): void — count calls"),
    method("group", "(method) group(...label: unknown[]): void"),
    method("groupEnd", "(method) groupEnd(): void"),
    method("dir", "(method) dir(obj: unknown): void — inspect an object"),
    method("assert", "(method) assert(condition: boolean, ...message: unknown[]): void"),
  ],
  Math: [
    method("floor", "(method) floor(x: number): number"),
    method("ceil", "(method) ceil(x: number): number"),
    method("round", "(method) round(x: number): number"),
    method("trunc", "(method) trunc(x: number): number"),
    method("abs", "(method) abs(x: number): number"),
    method("max", "(method) max(...values: number[]): number"),
    method("min", "(method) min(...values: number[]): number"),
    method("sqrt", "(method) sqrt(x: number): number"),
    method("pow", "(method) pow(base: number, exp: number): number"),
    method("random", "(method) random(): number — in [0, 1)"),
    method("hypot", "(method) hypot(...values: number[]): number"),
    method("cbrt", "(method) cbrt(x: number): number"),
    method("sign", "(method) sign(x: number): number"),
    method("log2", "(method) log2(x: number): number"),
    method("log10", "(method) log10(x: number): number"),
    method("exp", "(method) exp(x: number): number"),
    property("PI", "(property) PI: number — 3.14159..."),
    property("E", "(property) E: number — 2.71828..."),
    property("LN2", "(property) LN2: number"),
    property("LN10", "(property) LN10: number"),
    property("SQRT2", "(property) SQRT2: number"),
    property("SQRT1_2", "(property) SQRT1_2: number"),
  ],
  JSON: [
    method("parse", '(method) parse(text: string): any — JSON string to value'),
    method("stringify", "(method) stringify(value: unknown): string — value to JSON text"),
  ],
  Object: [
    method("keys", "(method) keys(o: object): string[]"),
    method("values", "(method) values(o: object): unknown[]"),
    method("entries", "(method) entries(o: object): [string, unknown][]"),
    method("assign", "(method) assign(target: object, ...sources: object[]): object"),
    method("freeze", "(method) freeze<T>(o: T): Readonly<T>"),
    method("fromEntries", "(method) fromEntries(entries: [string, unknown][]): object"),
    method("defineProperty", "(method) defineProperty(o: object, key: string, desc: PropertyDescriptor): object"),
    method("getOwnPropertyNames", "(method) getOwnPropertyNames(o: object): string[]"),
    method("hasOwn", "(method) hasOwn(o: object, key: string): boolean"),
    method("groupBy", "(method) groupBy(items: T[], keyFn: (item: T) => string): Record<string, T[]>"),
    method("create", "(method) create(proto: object): object"),
    method("seal", "(method) seal<T>(o: T): T"),
    method("isFrozen", "(method) isFrozen(o: object): boolean"),
    method("is", "(method) is(a: unknown, b: unknown): boolean"),
  ],
  Array: [
    method("isArray", "(method) isArray(arg: unknown): arg is unknown[]"),
    method("from", "(method) from(arrayLike: ArrayLike<T>): T[]"),
    method("of", "(method) of(...items: T[]): T[]"),
  ],
  Promise: [
    method("all", "(method) all(values: Promise<T>[]): Promise<T[]>"),
    method("allSettled", "(method) allSettled(values: Promise<T>[]): Promise<SettledPromise<T>[]>"),
    method("race", "(method) race(values: Promise<T>[]): Promise<T>"),
    method("any", "(method) any(values: Promise<T>[]): Promise<T>"),
    method("resolve", "(method) resolve(value: T): Promise<T>"),
    method("reject", "(method) reject(reason?: unknown): Promise<never>"),
    method("withResolvers", "(method) withResolvers(): { promise, resolve, reject }"),
  ],
  Number: [
    method("isInteger", "(method) isInteger(value: unknown): boolean"),
    method("isSafeInteger", "(method) isSafeInteger(value: unknown): boolean"),
    method("isFinite", "(method) isFinite(value: unknown): boolean"),
    method("isNaN", "(method) isNaN(value: unknown): boolean"),
    method("parseInt", "(method) parseInt(string: string, radix?: number): number"),
    method("parseFloat", "(method) parseFloat(string: string): number"),
    property("EPSILON", "(property) EPSILON: number"),
    property("MAX_SAFE_INTEGER", "(property) MAX_SAFE_INTEGER: number — 2^53 - 1"),
    property("MIN_SAFE_INTEGER", "(property) MIN_SAFE_INTEGER: number"),
    property("MAX_VALUE", "(property) MAX_VALUE: number"),
  ],
  String: [
    method("raw", "(method) raw(strings: TemplateStringsArray, ...values: unknown[]): string"),
    method("fromCharCode", "(method) fromCharCode(...codes: number[]): string"),
    method("fromCodePoint", "(method) fromCodePoint(...points: number[]): string"),
  ],
  Symbol: [
    property("iterator", "(property) iterator: symbol — makes an object iterable"),
    property("asyncIterator", "(property) asyncIterator: symbol"),
    property("hasInstance", "(property) hasInstance: symbol"),
    property("toStringTag", "(property) toStringTag: symbol"),
    property("species", "(property) species: symbol"),
    method("for", "(method) for(key: string): symbol — global registry"),
    method("keyFor", "(method) keyFor(sym: symbol): string"),
  ],
  Reflect: [
    method("get", "(method) get(target: object, key: string): unknown"),
    method("set", "(method) set(target: object, key: string, value: unknown): boolean"),
    method("has", "(method) has(target: object, key: string): boolean"),
    method("ownKeys", "(method) ownKeys(target: object): (string | symbol)[]"),
    method("defineProperty", "(method) defineProperty(target: object, key: string, desc: PropertyDescriptor): boolean"),
    method("deleteProperty", "(method) deleteProperty(target: object, key: string): boolean"),
    method("apply", "(method) apply(target: Function, thisArg: unknown, args: unknown[]): unknown"),
    method("construct", "(method) construct(target: Function, args: unknown[]): unknown"),
    method("getPrototypeOf", "(method) getPrototypeOf(target: object): object | null"),
  ],
  Date: [
    method("now", "(method) now(): number — milliseconds since epoch"),
    method("parse", "(method) parse(dateString: string): number"),
    method("UTC", "(method) UTC(year: number, month: number, ...): number"),
  ],
  document: [
    method("querySelector", "(method) querySelector(selector: string): Element | null"),
    method("querySelectorAll", "(method) querySelectorAll(selector: string): NodeListOf<Element>"),
    method("getElementById", "(method) getElementById(elementId: string): HTMLElement | null"),
    method("createElement", "(method) createElement(tagName: string): HTMLElement"),
    method("addEventListener", "(method) addEventListener(type: string, listener: EventListener): void"),
    method("removeEventListener", "(method) removeEventListener(type: string, listener: EventListener): void"),
    property("body", "(property) body: HTMLElement"),
    property("title", "(property) title: string"),
    property("head", "(property) head: HTMLHeadElement"),
  ],
  window: [
    method("setTimeout", "(method) setTimeout(callback: () => void, ms: number): number"),
    method("clearTimeout", "(method) clearTimeout(id: number): void"),
    method("setInterval", "(method) setInterval(callback: () => void, ms: number): number"),
    method("fetch", "(method) fetch(input: string): Promise<Response>"),
    method("requestAnimationFrame", "(method) requestAnimationFrame(callback: (t: number) => void): number"),
    method("alert", "(method) alert(message: string): void"),
    property("console", "(property) console: Console"),
    property("document", "(property) document: Document"),
    property("location", "(property) location: Location"),
    property("navigator", "(property) navigator: Navigator"),
  ],
};

/**
 * Skeleton snippets. Templates use CodeMirror snippet syntax:
 * `${Name}` fields (Tab / Shift-Tab to move between), `${}` final cursor.
 * Plain double-quoted strings keep `${...}` literal.
 */
const SNIPPETS: Completion[] = [
  snippetCompletion("console.log(${});", { label: "log", type: "snippet", detail: "console.log(...)", boost: 4 }),
  snippetCompletion("console.warn(${});", { label: "warn", type: "snippet", detail: "console.warn(...)", boost: 1 }),
  snippetCompletion("console.error(${});", { label: "error", type: "snippet", detail: "console.error(...)", boost: 1 }),
  snippetCompletion("console.info(${});", { label: "info", type: "snippet", detail: "console.info(...)" }),
  snippetCompletion('console.time("label");\n\t${}\nconsole.timeEnd("label");', {
    label: "timer",
    type: "snippet",
    detail: "time + timeEnd pair",
  }),
  snippetCompletion("interface ${Name} {\n\t${}\n}", {
    label: "interface",
    type: "snippet",
    detail: "interface skeleton — Tab between fields",
    boost: 5,
  }),
  snippetCompletion("type ${Name} = {\n\t${}\n};", {
    label: "type",
    type: "snippet",
    detail: "object type alias skeleton",
    boost: 5,
  }),
  snippetCompletion("enum ${Name} {\n\t${}\n}", {
    label: "enum",
    type: "snippet",
    detail: "enum skeleton",
    boost: 4,
  }),
  snippetCompletion("class ${Name} {\n\t${}\n}", {
    label: "class",
    type: "snippet",
    detail: "class skeleton",
    boost: 4,
  }),
  snippetCompletion("function ${name}(${params}: ${type}): ${returns} {\n\t${}\n}", {
    label: "function",
    type: "snippet",
    detail: "typed function skeleton",
    boost: 5,
  }),
  snippetCompletion("async function ${name}(): Promise<${T}> {\n\t${}\n}", {
    label: "afn",
    type: "snippet",
    detail: "async function skeleton",
  }),
  snippetCompletion("const ${name} = (${params}: ${type}): ${returns} => {\n\t${}\n};", {
    label: "arrow",
    type: "snippet",
    detail: "typed arrow function",
  }),
  snippetCompletion("const ${name} = async (${params}: ${type}): Promise<${T}> => {\n\t${}\n};", {
    label: "aarrow",
    type: "snippet",
    detail: "async arrow function",
  }),
  snippetCompletion("try {\n\t${}\n} catch (error) {\n\tconsole.error(error);\n}", {
    label: "try",
    type: "snippet",
    detail: "try / catch skeleton",
    boost: 3,
  }),
  snippetCompletion("for (const ${item} of ${items}) {\n\t${}\n}", {
    label: "forof",
    type: "snippet",
    detail: "for...of loop",
    boost: 3,
  }),
  snippetCompletion("for (let ${i} = 0; ${i} < ${length}; ${i}++) {\n\t${}\n}", {
    label: "fori",
    type: "snippet",
    detail: "index-based for loop",
    boost: 2,
  }),
  snippetCompletion("new Promise<${T}>((resolve, reject) => {\n\t${}\n})", {
    label: "promise",
    type: "snippet",
    detail: "new Promise skeleton",
  }),
];

/** Identifiers already present in the document (excluding the word at the
 *  cursor and labels covered by the static tables). */
function documentWordCompletions(
  state: EditorState,
  kind: Completion["type"],
  excludeFrom: number,
  excludeTo: number
): Completion[] {
  const seen = new Set<string>();
  const maxLines = Math.min(state.doc.lines, 400);
  for (let i = 1; i <= maxLines; i++) {
    const line = state.doc.line(i);
    for (const match of line.text.matchAll(/[A-Za-z_$][\w$]*/g)) {
      const word = match[0];
      if (word.length < 2 || seen.has(word) || STATIC_LABELS.has(word)) continue;
      const start = line.from + (match.index ?? 0);
      const end = start + word.length;
      // Skip the word currently being typed (its prefix would otherwise
      // produce a pointless identity completion ranked first).
      if (start < excludeTo && end > excludeFrom) continue;
      seen.add(word);
    }
  }
  return [...seen].sort().map((label) => ({ label, type: kind, boost: -1 }) as Completion);
}

const STATIC_LABELS: Set<string> = new Set(
  [
    ...KEYWORDS,
    ...TYPE_KEYWORDS,
    ...CONSTANTS,
    ...GLOBALS,
    ...SNIPPETS,
  ].map((c) => c.label)
);

function insideStringOrComment(context: CompletionContext): boolean {
  const node = syntaxTree(context.state).resolveInner(context.pos, -1);
  return /string|comment|template/i.test(node.name);
}

/**
 * The completion source: context-aware as you type.
 * - `console.` / `Math.` ... → member suggestions
 * - word prefix → keywords, types, globals, snippets, document words
 */
export function tsCompletionSource(context: CompletionContext): CompletionResult | null {
  const { state, pos } = context;
  const line = state.doc.lineAt(pos);
  const textBefore = line.text.slice(0, pos - line.from);

  // --- member access: `object.` or `object.pref` ---
  const memberMatch = /([A-Za-z_$][\w$]*)\s*\.\s*([\w$]*)$/.exec(textBefore);
  if (memberMatch) {
    if (insideStringOrComment(context)) return null;
    const object = memberMatch[1];
    const typed = memberMatch[2];
    const from = pos - typed.length;
    const known = BUILTIN_MEMBERS[object];
    if (known) {
      return { from, options: known, validFor: /^[\w$]*$/ };
    }
    // Unknown receiver: offer identifiers used in the document as guesses.
    return {
      from,
      options: documentWordCompletions(state, "property", from, pos),
      validFor: /^[\w$]*$/,
    };
  }

  // --- word prefix ---
  const word = context.matchBefore(/[\w$]*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  if (insideStringOrComment(context)) return null;

  const options: Completion[] = [
    ...SNIPPETS,
    ...KEYWORDS,
    ...TYPE_KEYWORDS,
    ...CONSTANTS,
    ...GLOBALS,
    ...documentWordCompletions(state, "variable", word.from, word.to),
  ];
  return { from: word.from, options, validFor: /^[\w$]*$/ };
}
