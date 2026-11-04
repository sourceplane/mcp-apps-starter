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
  // Dev server only (`next build` ignores it): orun.work's live Preview tab
  // loads `next dev` from the preview's own host, and Next.js refuses the
  // hot reload and other /_next/* dev requests from an origin it is not told
  // about. These are the preview's hosts, prod's and stage's.
  allowedDevOrigins: ["*.orun-preview.app", "preview-gateway-stage.oruncloud.workers.dev"],
  experimental: {
    // Dev server only: behind orun.work's live Preview the browser's Origin
    // is the preview's host while `next dev` sees a local Host, and Next.js
    // refuses a Server Action from an origin it is not told about. `next
    // build` runs with NODE_ENV=production, so production keeps its
    // same-origin check.
    ...(process.env.NODE_ENV === "development"
      ? { serverActions: { allowedOrigins: ["*.orun-preview.app", "preview-gateway-stage.oruncloud.workers.dev"] } }
      : {}),
  },
};

export default nextConfig;
