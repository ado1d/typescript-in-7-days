import { NextResponse } from "next/server";
import type * as TS from "typescript";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel: allow extra time for cold-starting the TypeScript compiler service.
export const maxDuration = 30;

const MAX_CODE_LENGTH = 16000;
const RUN_TIMEOUT_MS = 2500;
const MAX_LOGS = 400;

interface DiagnosticItem {
  line: number;
  character: number;
  message: string;
  category: "error" | "warning";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code too long (max ${MAX_CODE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const ts = (await import("typescript")).default as typeof TS;
    const nodeFs = await import("node:fs");
    const nodePath = await import("node:path");
    const nodeUtil = await import("node:util");
    const nodeVm = await import("node:vm");

    const fileName = "playground.ts";
    const start = Date.now();

    const compilerOptions: TS.CompilerOptions = {
      strict: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2022,
      moduleDetection: ts.ModuleDetectionKind.Force,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      skipLibCheck: true,
      lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
    };

    // Resolve the TypeScript package's lib directory and cache lib file contents
    const libDir = (() => {
      try {
        const defaultLibPath = ts.getDefaultLibFilePath({ target: compilerOptions.target });
        return nodePath.dirname(defaultLibPath);
      } catch {
        return "";
      }
    })();

    const libCache = new Map<string, string | null>();
    const readLibFile = (libName: string): string | null => {
      if (libCache.has(libName)) return libCache.get(libName) ?? null;
      let content: string | null = null;
      try {
        content = nodeFs.readFileSync(nodePath.join(libDir, libName), "utf8");
      } catch {
        content = null;
      }
      libCache.set(libName, content);
      return content;
    };

    const libFileNames = compilerOptions.lib ?? [];

    const snapshot = ts.ScriptSnapshot.fromString(code);
    const version = String(Date.now());

    const host: TS.LanguageServiceHost = {
      getScriptFileNames: () => [fileName, ...libFileNames],
      getScriptVersion: () => version,
      getScriptSnapshot: (name) => {
        if (name === fileName) return snapshot;
        if (name.startsWith("lib.") && name.endsWith(".d.ts")) {
          const content = readLibFile(name);
          return content ? ts.ScriptSnapshot.fromString(content) : undefined;
        }
        return undefined;
      },
      getCurrentDirectory: () => "/",
      getCompilationSettings: () => compilerOptions,
      getDefaultLibFileName: () => ts.getDefaultLibFileName({ target: compilerOptions.target }),
      fileExists: (name) =>
        name === fileName || (name.startsWith("lib.") && name.endsWith(".d.ts")),
      readFile: (name) => (name === fileName ? code : undefined),
    };

    const languageService = ts.createLanguageService(host);

    const syntactic = languageService.getSyntacticDiagnostics(fileName);
    const semantic = languageService.getSemanticDiagnostics(fileName);
    const all = [...syntactic, ...semantic];

    const diagnostics: DiagnosticItem[] = all
      .map((d) => {
        const pos = d.file
          ? d.file.getLineAndCharacterOfPosition(d.start ?? 0)
          : { line: 0, character: 0 };
        return {
          line: pos.line + 1,
          character: pos.character + 1,
          message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
          category:
            d.category === ts.DiagnosticCategory.Error ? ("error" as const) : ("warning" as const),
        };
      })
      .slice(0, 50);

    // Emit output
    let js = "";
    try {
      const emitted = languageService.getEmitOutput(fileName);
      js = emitted.outputFiles[0]?.text ?? "";
    } catch {
      js = "";
    }
    if (!js) {
      js = ts.transpileModule(code, { compilerOptions }).outputText;
    }

    // Execute if there are no hard errors
    const logs: string[] = [];
    let runtimeError: string | null = null;
    const hasErrors = diagnostics.some((d) => d.category === "error");
    if (!hasErrors && js.trim().length > 0) {
      const format = (value: unknown): string => {
        if (typeof value === "string") return value;
        if (typeof value === "bigint") return `${value}n`;
        try {
          return nodeUtil.inspect(value, { depth: 4, breakLength: 88, maxArrayLength: 100 });
        } catch {
          return String(value);
        }
      };
      const sandboxConsole = {
        log: (...args: unknown[]) => {
          if (logs.length < MAX_LOGS) logs.push(args.map(format).join(" "));
        },
        info: (...args: unknown[]) => {
          if (logs.length < MAX_LOGS) logs.push(args.map(format).join(" "));
        },
        warn: (...args: unknown[]) => {
          if (logs.length < MAX_LOGS) logs.push(`[warn] ${args.map(format).join(" ")}`);
        },
        error: (...args: unknown[]) => {
          if (logs.length < MAX_LOGS) logs.push(`[error] ${args.map(format).join(" ")}`);
        },
        debug: (...args: unknown[]) => {
          if (logs.length < MAX_LOGS) logs.push(args.map(format).join(" "));
        },
      };

      try {
        // Re-transpile to CommonJS for execution (converts import/export statements),
        // and wrap in an async IIFE so top-level await works.
        const runJs = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
          },
        }).outputText;

        const stubRequire = (name: string): never => {
          throw new Error(
            `Cannot import module '${name}' — the playground runs a single self-contained file.`
          );
        };

        const context = nodeVm.createContext(
          {
            console: sandboxConsole,
            require: stubRequire,
            exports: {},
            module: { exports: {} },
          },
          { codeGeneration: { strings: false, wasm: false } }
        );
        const script = new nodeVm.Script(
          `(async () => {\n${runJs}\n})()`,
          { filename: "playground.js" }
        );
        const promise = script.runInContext(context, { timeout: RUN_TIMEOUT_MS });
        await Promise.race([
          promise,
          new Promise<never>((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Execution timed out after ${RUN_TIMEOUT_MS}ms — check for an infinite loop or a never-resolving await.`
                  )
                ),
              RUN_TIMEOUT_MS
            );
          }),
        ]);
      } catch (e) {
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        if (message.includes("Script execution timed out")) {
          runtimeError = `Execution timed out after ${RUN_TIMEOUT_MS}ms — check for an infinite loop.`;
        } else {
          runtimeError = message;
        }
      }
    }

    languageService.dispose();

    return NextResponse.json({
      diagnostics,
      js,
      logs,
      runtimeError,
      compileMs: Date.now() - start,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Compiler service failure", detail: String(err) },
      { status: 500 }
    );
  }
}
