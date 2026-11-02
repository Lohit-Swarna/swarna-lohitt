import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker builds set NEXT_OUTPUT=standalone for a self-contained server (see Dockerfile).
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // pdf.js loads its worker file at runtime; bundling breaks that path, so load these from node_modules.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // File tracing cannot follow pdf.js's dynamic imports, so include its worker and the
  // @napi-rs/canvas package (with its platform binary) that provides DOMMatrix on Node.js.
  outputFileTracingIncludes: {
    "/api/process": [
      "./node_modules/**/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/@napi-rs/canvas*/**",
    ],
  },
};

export default nextConfig;
