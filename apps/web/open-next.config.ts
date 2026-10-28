// OpenNext Cloudflare adapter config.
//
// The pages (the widget, /about, /counter) are pre-rendered at build time and
// nothing revalidates; /mcp and /api/health run in the Worker on every
// request. The static-assets incremental cache serves the pre-rendered pages
// straight from the Worker's static assets (read only, no R2/KV/D1 to
// provision) — including to the widget route's own self-fetch of `/`. A
// change that revalidates (ISR, `revalidateTag`) swaps this for the R2
// incremental cache plus a tag cache.
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
