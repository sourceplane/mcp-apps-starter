# mcp-apps-starter

Vercel's [MCP Apps Next.js starter](https://github.com/vercel-labs/mcp-apps-nextjs-starter)
— an [MCP Apps](https://modelcontextprotocol.io) server: a Next.js app whose
`/mcp` endpoint registers tools that carry interactive UI widgets, and whose
own pages are those widgets — running on **Cloudflare Workers + Static
Assets** through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
and packaged as an **Orun baseline**: one command takes a new MCP Apps server
from nothing to live on stage and prod, in its own repository, under its own
name.

The starter's code is the code. What the port adds is the Workers build, the
monorepo wrapper, a test package, a health route and the deploy contract; what
it swaps is the origin (Vercel's environment variables, for one the deploy
sets per environment), how the widget route reaches its own page (a service
binding to the Worker itself, not the network), the MCP handler's version (one
whose transport workerd accepts) and the font loader. What the baseline adds
is everything needed to make a copy of it somebody else's — built the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) is. See
[`specs/epics/mcp-apps-starter`](specs/epics/mcp-apps-starter/README.md) for
the design, the milestones and the as-built status.

**`/mcp` is open**, as it is upstream: no authentication, so anyone with the
URL can list and call the tools. The starter's one tool, `greet`, reads and
writes nothing. A server built from it should put a check in front of `/mcp`
before a tool touches anything private.

The upstream repository carries **no licence** (no LICENSE file, no
`license` in its `package.json`, none recorded by GitHub).

## Instantiating a server

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/mcp-apps-starter
cd mcp-apps-starter
orun new --blueprint repo-blueprint.yaml --out ~/sites/acme-tools --run-hooks --resume \
  --set reponame=acme-tools --set productname="Acme Tools" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`mcp-apps-starter` → Build). Two phases — `01-product` (the repository
created, then the whole server in one pull request, deployed to stage and prod
and smoke-tested) and `03-docs` (the live deployment recorded) — each landing
one pull request in the new repository.
**[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **server only** — the app, its tests, its CI,
its tooling, a README and an `AGENTS.md` of its own and its operating
contract — renamed throughout to the server's name, repository and Cloudflare
Worker. None of this repository's machinery ships.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The server's README, agent page and context pack | `.baseline/product/README.md`, `.baseline/product/AGENTS.md`, `ai/context/` |
| The baseline's tests: contract, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

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
| `baseline.yml` | the baseline's own tiers: contract tests, the blueprint read by the pinned orun, the leak gate, the offline bootstrap, the server built, dry-deployed, served and called by an MCP client | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
