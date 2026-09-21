import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Keep the `typescript` package external so it is bundled as-is into the
  // serverless function — the /api/ts-check playground runs the real compiler.
  serverExternalPackages: ["typescript"],
  // The ts-check route reads TypeScript's lib.*.d.ts files dynamically with
  // fs.readFileSync, which output file tracing cannot detect — force-include
  // the whole lib directory so the language service has full DOM + ES2020 libs.
  outputFileTracingIncludes: {
    "/api/ts-check": ["./node_modules/typescript/lib/**"],
  },
};

export default nextConfig;
