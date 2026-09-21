import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Keep the `typescript` package external so it is bundled as-is into the
  // serverless function — the /api/ts-check playground runs the real compiler.
  serverExternalPackages: ["typescript"],
};

export default nextConfig;
