# mcp-apps-starter

Vercel's [MCP Apps Next.js starter](https://github.com/vercel-labs/mcp-apps-nextjs-starter)
— an [MCP Apps](https://modelcontextprotocol.io) server: a Next.js app whose
`/mcp` endpoint registers tools that carry interactive UI widgets, and whose
own pages are those widgets — running on **Cloudflare Workers + Static
Assets** through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), deployed by
[Orun](https://github.com/sourceplane/orun) to stage and prod on every merge.
Packaging it as an Orun baseline is the next milestone (MA2).

The starter's code is the code. What the port adds is the Workers build, the
monorepo wrapper, a test package, a health route and the deploy contract; what
it swaps is the origin (Vercel's environment variables, for one the deploy
sets per environment), how the widget route reaches its own page (a service
binding to the Worker itself, not the network), the MCP handler's version (one
whose transport workerd accepts) and the font loader. See
[`specs/epics/mcp-apps-starter`](specs/epics/mcp-apps-starter/README.md) for
the design, the milestones and the as-built status.

**`/mcp` is open**, as it is upstream: no authentication, so anyone with the
URL can list and call the tools. The starter's one tool, `greet`, reads and
writes nothing. A server built from it should put a check in front of `/mcp`
before a tool touches anything private.

The upstream repository carries **no licence** (no LICENSE file, no
`license` in its `package.json`, none recorded by GitHub).

## What is here (the server)

| Surface | Where |
|---|---|
| The server's name and source link | `apps/web/app/site.ts` |
| Tools and the widget resource (the MCP server) | `apps/web/app/mcp/route.ts` |
| The widget UI (the home page) and two example pages | `apps/web/app/page.tsx`, `app/about`, `app/counter` |
| The host bridge (`useMcpApp`) | `apps/web/app/hooks/use-mcp-app.ts` |
| Iframe patches, CORS | `apps/web/app/layout.tsx`, `apps/web/middleware.ts` |
| The public origin | `apps/web/baseUrl.ts` |
| A liveness answer | `apps/web/app/api/health/route.ts` |
| Workers build and deploy contract | `apps/web/next.config.ts`, `open-next.config.ts`, `wrangler.template.jsonc`, `component.yaml` |
| Tests | `tests/web` (vitest) |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # next build + opennextjs-cloudflare build → apps/web/.open-next
```

```bash
pnpm --filter @app/web dev        # http://localhost:3000
pnpm --filter @app/web preview    # wrangler dev over the built Worker
```

Two optional build-time variables (`apps/web/.env.example`):

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The server's public origin, for the widget's asset URLs and CSP. The Orun build sets it to the environment's `SITE_URL` (intent.yaml), else its Worker URL. Defaults to `http://localhost:3000` under `next dev`. |
| `BASE_URL` | Overrides it, as upstream: a tunnel's URL (ngrok) while you try the server in a host from `next dev`. |

Add a tool with `registerAppTool(...)` in `apps/web/app/mcp/route.ts`; the
widget it names is `apps/web/app/page.tsx`.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Next.js on Vercel Functions | One Cloudflare Worker (`.open-next/worker.js`) + Static Assets |
| `baseUrl.ts` from `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_BRANCH_URL` / `VERCEL_URL` | `NEXT_PUBLIC_SITE_URL`, set per environment by the build (`BASE_URL` still wins) |
| The widget route's `fetch(`${baseURL}/`)` over the network | `env.WORKER_SELF_REFERENCE.fetch(...)` with the same URL — a service binding to the Worker itself, named per environment (`wrangler.template.jsonc`) |
| `mcp-handler` 1.0.7 on MCP SDK 1.25.2 | `mcp-handler` 1.1.0 on SDK 1.26.0, whose Web-standard transport workerd accepts |
| `next/font/google` Geist | the `geist` package |
| Deploy on push | Orun deploys `<repo>-web-{stage,prod}` on merge to `main` (`apps/web/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to a server |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a server carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the server built and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
