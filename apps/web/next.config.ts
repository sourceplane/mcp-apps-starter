import path from "node:path";
import type { NextConfig } from "next";
import { baseURL } from "./baseUrl";

// The monorepo root: `next build` runs in apps/web.
const workspaceRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  assetPrefix: baseURL,
  devIndicators: false,
  // Required by @opennextjs/cloudflare, which bundles `.next/standalone/**`
  // into the Worker. Trace from the monorepo root so workspace dependencies
  // resolve from the root node_modules.
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
  // No image optimizer on Workers; the template serves no remote images.
  images: { unoptimized: true },
};

export default nextConfig;
