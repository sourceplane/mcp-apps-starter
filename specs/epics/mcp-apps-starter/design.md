# mcp-apps-starter — design

## 1. What the starter is

A Next.js 16 app in two roles. `app/mcp/route.ts` builds an MCP handler with
`mcp-handler`'s `createMcpHandler` and `@modelcontextprotocol/ext-apps`'
helpers: one tool, `greet` (a zod `name`, answering `Hello, <name>!` as text
and `structuredContent`, its `_meta.ui.resourceUri` naming the widget), and
one resource, `ui://app/index.html?v=<UI_VERSION>`, of MIME type
`text/html;profile=mcp-app`. To answer `resources/read`, the route fetches
`${baseURL}/` — the app's own rendered home page — and returns its HTML, with
a CSP naming `baseURL` for connections and resources. The host renders that
HTML in a sandboxed iframe; `app/hooks/use-mcp-app.ts` connects to the host
through ext-apps' `App` and hands the page the tool's input and result.
`app/layout.tsx` injects `<base href>` and patches `history` and `fetch` for
the iframe; `next.config.ts` sets `assetPrefix: baseURL` so `/_next/static/`
loads from the server's origin; `middleware.ts` adds CORS. `baseUrl.ts`
derives the origin from Vercel's environment variables (`BASE_URL` first, for
a tunnel). Stateless: every POST a fresh server and transport, no session.
No auth, no data.

## 2. The mapping (Vercel → Cloudflare)

| Vercel | Here |
|---|---|
| Next.js on Vercel Functions | One Cloudflare Worker built by `@opennextjs/cloudflare` 1.20.11 (Next 16.3.8: OpenNext refuses 16.4.x), Static Assets for `/_next/static/` and the pre-rendered pages, the static-assets incremental cache |
| `fetch(`${baseURL}/`)` over the network | `env.WORKER_SELF_REFERENCE.fetch(`${baseURL}/`)` — a service binding to the Worker itself (OpenNext's documented self-binding). A Worker fetching its own workers.dev hostname over the network is refused; through the binding the request never leaves Cloudflare but carries the public URL, so the page renders as a visitor gets it. Outside a Cloudflare context (`next dev`) it falls back to `fetch` |
| `baseUrl.ts` from `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_BRANCH_URL` / `VERCEL_URL` | `BASE_URL`, then `NEXT_PUBLIC_SITE_URL` — set by the Orun build to the environment's `SITE_URL`, else its workers.dev URL — then `http://localhost:3000` under `next dev`, else wrangler's `http://localhost:8787` |
| `mcp-handler` 1.0.7 on MCP SDK 1.25.2 | `mcp-handler` 1.1.0 on SDK 1.26.0 (the version it pins). 1.0.7 builds on the SDK's Node `StreamableHTTPServerTransport`, which imports `@hono/node-server`, which replaces `globalThis.Response` with its own class; every response the route returns is then that class and workerd refuses it (500, "the Promise did not resolve to 'Response'"). 1.1.0 uses `WebStandardStreamableHTTPServerTransport` |
| `createMcpHandler(...)` at module load | Kept. It starts a 30-second cleanup `setInterval`; hono-mcp had to build its handler on the first request because a plain Worker evaluates it at global scope, but OpenNext evaluates a route module inside the request that first reaches it |
| No `serverInfo`, so `mcp-handler`'s default name ("mcp-typescript server on vercel") | `SITE_NAME` (`app/site.ts`), which the page title and heading also read |
| Geist through `next/font/google` | The `geist` package (`geist/font/sans`, `geist/font/mono`): Google's font API fails on GitHub's runners |
| `vc deploy` | Orun's `wrangler deploy` per environment on merge |

Alternatives rejected:

- **Render the widget in-process** (call the page's renderer from the route,
  or a static HTML export read from the assets binding). Either drops the
  network hop, but not the route's contract: upstream renders the page as a
  visitor gets it, with the request's origin, and the binding keeps exactly
  that. An `ASSETS` read would serve a pre-rendered file whose
  `assetPrefix` was baked at build — the same today, but not once the page
  renders per request.
- **Fetch the public hostname.** Refused on workers.dev (loop protection),
  and on a custom domain it would leave and re-enter Cloudflare for every
  `resources/read`.
- **`mcp-handler` 2.x** (the SDK v2 packages). The starter is on the 1.x
  line; 1.1.0 is that line's newest.
- **A Durable Object per session** (`McpAgent`). The starter is stateless by
  design.

## 3. The repository

```
apps/web                  the starter (app/, baseUrl.ts, middleware.ts, next.config.ts), its name (app/site.ts),
                          /api/health, the Workers build (open-next.config.ts, wrangler.template.jsonc)
  component.yaml          Orun component: render wrangler.jsonc for the environment, build with turbo, dry-run/deploy; the smoke
  wrangler.template.jsonc <slug>-web-__ENV__, nodejs_compat, assets, and the WORKER_SELF_REFERENCE binding to <slug>-web-__ENV__
tests/web                 vitest: the identity, and baseURL's precedence (no Vercel variable read)
tooling/*                 shared tsconfig / eslint / the wrangler renderer (tooling/wire/render.mjs)
intent.yaml               environments dev (verify) · stage · prod; `work:` points at specs/epics and tasks
```

The binding must name the Worker, and the Worker is named per environment
(`environmentAwareWorkerName`), so `wrangler.jsonc` cannot be one static file
with `env.*` sections: the build renders it from the template with
`--env "${ORUN_ENVIRONMENT}"` (commerce's pattern), and `pnpm wire:fixture`
renders the dev one that is checked in.

## 4. The build

`pnpm --filter @app/web build` = `next build` (standalone output, tracing
rooted at the workspace) → `opennextjs-cloudflare build --skipBuild` →
`populateCache local`. The Worker is 8.4 MiB, **1.73 MiB gzipped**
(`wrangler deploy --dry-run`) — under Workers Free's 3 MiB.

## 5. The smoke and the tests

The deploy's smoke reads `/api/health` (`"status":"ok"`), the home page (its
`/counter` link), then POSTs an MCP `resources/list` (it must offer a `ui://`
resource) and a `resources/read` of it (it must answer
`text/html;profile=mcp-app` with `/_next/static/` in the HTML) — so a green
deploy is a server whose self-fetch works, not a Worker that answers. The
vitest suite holds the identity and the origin's precedence. The end-to-end
tier builds the server in the stage lane's staged tree with the stage
workers.dev origin, serves it with `wrangler dev`, runs the smoke verbatim,
reads the pages, and makes a full exchange with the MCP SDK's own `Client`
over `StreamableHTTPClientTransport` (`testing/lib/mcp-client.mjs`):
initialize (named by the product, no session id), tools/list, tools/call,
resources/list and resources/read — the widget's heading carrying the
product's name and its assets and CSP on the stage origin, which nothing
serves locally, so the HTML came through the binding.

## 6. The baseline

portfolio-starter-kit's, unchanged in shape: one landing (`01-product`) then
the record (`03-docs`); one brokered key pair (`workers-deploy`,
`account-id`); the name seam `SITE_NAME` in `apps/web/app/site.ts`, which
`initialize`, the title and the heading read; the workers.dev subdomain from
the Cloudflare connection; no domain asked. The rename engine re-prefixes the
Worker's name and its self-binding in `wrangler.template.jsonc`; the
deployment record probes `/` and `/api/health`.
