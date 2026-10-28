# mcp-apps-starter — implementation status

| Milestone | State | Landed |
|---|---|---|
| MA0 — the spec | ✅ | MA-1 |
| MA1 — the MCP Apps server on Workers | ✅ | MA-2 |
| MA2 — a baseline | ✅ | MA-3, tagged `baseline-v1` |

## Departures from the upstream starter

Everything not listed here is the starter as it is upstream at `adca42c`.

| # | What | Why |
|---|---|---|
| 1 | The app lives in `apps/web` of a pnpm workspace (`@app/web`); upstream's `bun.lock` and `pnpm-lock.yaml` are replaced by the workspace's lockfile | The workspace's shape (portfolio-starter-kit's) |
| 2 | Next `16.1.6` → `16.3.8`, `eslint-config-next` with it; `output: "standalone"`, `outputFileTracingRoot` and `turbopack.root` at the workspace root, `images.unoptimized` | What `@opennextjs/cloudflare` 1.20.11 builds (it refuses 16.4.x) |
| 3 | `mcp-handler` `1.0.7` → `1.1.0`, `@modelcontextprotocol/sdk` `1.25.2` → `1.26.0` | The older pair's Node transport replaces the global `Response`; workerd refuses every answer (design §2) |
| 4 | `fetchPageHtml` goes through `getCloudflareContext().env.WORKER_SELF_REFERENCE` when there is one, else `fetch` as upstream | A Worker cannot fetch its own workers.dev hostname over the network |
| 5 | `baseUrl.ts`: `BASE_URL`, then `NEXT_PUBLIC_SITE_URL`, then `localhost:3000` (dev) or `localhost:8787`; the `VERCEL_*` variables are not read | The deploy sets the origin per environment |
| 6 | `serverInfo: { name: SITE_NAME, version: "0.1.0" }` passed (upstream passes no options, so `mcp-handler`'s default name, `mcp-typescript server on vercel`); the page `<title>` (upstream "MCP Apps Minimal Next.js") and the home heading (upstream "MCP Apps Starter") read `SITE_NAME` | One rename seam |
| 7 | Geist from the `geist` package, not `next/font/google` | Google's font API fails on GitHub's runners |
| 8 | `about/page.tsx`: four apostrophes written `&apos;` | Upstream's own lint config (`react/no-unescaped-entities`) fails on them; the rendered text is the same |
| 9 | `/api/health` added: `{"status":"ok","name":SITE_NAME,"source":SOURCE_URL}` | The deploy's smoke and the docs phase's probe read it |
| 10 | `open-next.config.ts`, `wrangler.template.jsonc` (rendered per environment, with the self-binding), `wiring.fixture.json`, `cloudflare-env.d.ts`, `component.yaml` | The Worker's config and the deploy contract replace Vercel's |
| 11 | Tests: `tests/web` (vitest): the identity, and `baseURL`'s precedence | The starter ships none |

Kept as upstream, and worth knowing: the module-level `createMcpHandler`
(risk MA-D), `middleware.ts` (MA-F), `UI_VERSION` (MA-G), `/mcp` open (MA-E).

## Measured

The Worker: 8 602.04 KiB, 1 775.16 KiB gzipped (`wrangler deploy --dry-run`).
