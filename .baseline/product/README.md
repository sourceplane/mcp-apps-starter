# mcp-apps-starter

An [MCP Apps](https://modelcontextprotocol.io) server: a Next.js app whose
`/mcp` endpoint registers tools that carry interactive UI widgets, and whose
own pages are those widgets. MCP hosts that support Apps (ChatGPT, Claude.ai,
Cursor) render the widget in a sandboxed iframe beside the tool's result. It
runs on **Cloudflare Workers + Static Assets** through
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

Working on it with a coding agent? [AGENTS.md](AGENTS.md) says what to read
first, how a change lands and what not to touch.

## Live deployment

<!-- 03-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace and the secrets the server uses into
[ai/context/deployment.md](ai/context/deployment.md); how the server deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 03-docs:end -->

## Connect a host

Add the deployed server's `/mcp` URL to any MCP host that supports Apps
(ChatGPT, Cursor or Claude.ai: Settings → Apps or Connectors → add the URL):

```
https://mcp-apps-starter-web-prod.<your-subdomain>.workers.dev/mcp
```

Ask it to greet someone: the `greet` tool answers, and the host shows its
widget (the home page) with the tool's input and result.

**`/mcp` is open**, as it is upstream: there is no authentication, so anyone
with the URL can list and call the tools. The `greet` tool reads nothing and
writes nothing. Before a tool touches anything private, put a check in front
of `/mcp` (`mcp-handler`'s `withMcpAuth`, or a check in `middleware.ts` that
reads a runtime secret), and give the deploy's smoke the credential too.

## What is here

| Surface | Where |
|---|---|
| The server's name and source link | `apps/web/app/site.ts` |
| Tools and resources (the MCP server) | `apps/web/app/mcp/route.ts` |
| The widget UI (the home page) and two example pages | `apps/web/app/page.tsx`, `app/about`, `app/counter` |
| The host bridge (`useMcpApp`) | `apps/web/app/hooks/use-mcp-app.ts` |
| Iframe patches, CORS | `apps/web/app/layout.tsx`, `apps/web/middleware.ts` |
| The public origin | `apps/web/baseUrl.ts` |
| A liveness answer | `apps/web/app/api/health/route.ts` |
| Workers build and deploy contract | `apps/web/next.config.ts`, `open-next.config.ts`, `wrangler.template.jsonc`, `component.yaml` |
| Tests | `tests/web` (vitest) |

## How it works

The app serves two roles. `app/mcp/route.ts` is an MCP server
([`mcp-handler`](https://github.com/vercel/mcp-handler) and
[`@modelcontextprotocol/ext-apps`](https://github.com/modelcontextprotocol/ext-apps)),
stateless over Streamable HTTP: it registers the `greet` tool and one UI
resource. To answer `resources/read` for that resource, the route fetches the
app's own rendered `/` page and returns its HTML; the host loads it in an
iframe, and `useMcpApp` hands the page the tool's input and result.

On Workers the route reaches its own page through `WORKER_SELF_REFERENCE`, a
service binding to the same Worker (a Worker cannot fetch its own workers.dev
hostname over the network). The request carries the public origin, so the
page renders exactly as a visitor gets it: `<base href>`, the
`assetPrefix`ed `/_next/static/` URLs and the widget's CSP all name the
environment's origin. Because the binding names the Worker, and the Worker is
named per environment (`mcp-apps-starter-web-<env>`), `wrangler.jsonc` is
rendered from `wrangler.template.jsonc` by the build (`pnpm wire:fixture`
renders the dev one).

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

A host needs a public HTTPS URL. To try changes before you merge, run
`pnpm --filter @app/web dev` behind a tunnel (`ngrok http 3000`, say) and
set `BASE_URL` in `apps/web/.env.local` to the tunnel's URL; then add
`<tunnel>/mcp` to the host.

Make it yours in `apps/web/app/mcp/route.ts` (the tools, their schemas and
the widget each one carries), `apps/web/app/page.tsx` (the widget) and
`apps/web/app/site.ts` (the name `initialize` gives the host). When you change
the widget, bump `UI_VERSION` in the route: hosts cache a resource by its URI.

Two optional build-time variables (`apps/web/.env.example`):

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The server's public origin, for the widget's asset URLs and its CSP. The deploy sets it per environment (see below). Defaults to `http://localhost:3000` under `next dev`. |
| `BASE_URL` | Overrides it, as upstream: a tunnel's URL for local development. |

## How it maps to Vercel

| Upstream on Vercel | Here |
|---|---|
| A Next.js app on Vercel Functions | The same app in one Cloudflare Worker, built by `@opennextjs/cloudflare`; static files from Workers Static Assets |
| `baseUrl.ts` reads `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_BRANCH_URL` / `VERCEL_URL` | It reads `NEXT_PUBLIC_SITE_URL`, which the deploy sets per environment (`BASE_URL` still wins) |
| The route self-fetches `${baseURL}/` over the network | Through the `WORKER_SELF_REFERENCE` service binding, with the same URL |
| `mcp-handler` 1.0.7, MCP SDK 1.25.2 | `mcp-handler` 1.1.0 and the SDK it pins, 1.26.0: the older SDK's Node transport replaces the global `Response`, which workerd refuses |
| Geist from `next/font/google` | Geist from the `geist` package (self-hosted; Google's font API fails on CI runners) |
| The server named "mcp-typescript server on vercel" | The server named from `SITE_NAME` |
| Vercel deploys on push | Orun deploys `stage` then `prod` on merge to `main` |

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. The server deploys to `stage`, then
to `prod` once stage has converged on the same commit; `dev` only verifies.
The Worker is `mcp-apps-starter-web-<env>` on your account's workers.dev
subdomain, and every deploy is smoke-tested over HTTP: `/api/health`, the
home page, and an MCP `resources/list` and `resources/read` of the widget —
so a green deploy is one whose self-fetch works. A pull request runs the same
pipeline's verify lanes: the server built and dry-deployed for each
environment, with nothing deployed. They do not lint or run the tests, so run
`pnpm typecheck`, `pnpm lint` and `pnpm test` before you push. (A push to
`main` builds, deploys and smoke-tests.)

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare token and account id are brokered per run from the workspace's
Cloudflare connection; nothing provider-shaped is stored in the repository
or in GitHub.

**Deploy by hand.** Orunbase's **Deploy** button on a component, or **Run
workflow** on the CI workflow in GitHub's Actions tab (on `main`), runs
`ci.yml` for the environment and components you pick, and each one deploys
exactly as a merge would deploy it. Leave the component blank to redeploy
every component in that environment, with nothing changed: after rotating a
secret, say. A component with nothing to run in that environment (a test
suite in `prod`) is left out with a notice.

## Custom domain

The server answers on workers.dev from its first deploy. To serve it on your
own domain:

1. Add the domain to the Cloudflare account the server deploys into, and
   attach it to the Worker (dashboard → Workers & Pages →
   `mcp-apps-starter-web-prod` → Settings → Domains & Routes → Add →
   Custom domain). Do the same for stage with a subdomain if you want one.
2. Set the environment's public origin in `intent.yaml`, so the widget's
   asset URLs and CSP use it (until then they use the workers.dev URL):

   ```yaml
   environments:
     prod:
       env:
         SITE_URL: https://mcp-apps-starter.example.com
   ```

   The server was born with the reserved placeholder
   `mcp-apps-starter.example.com` where its domain goes: that example,
   and `BASE_DOMAIN` under each environment (dev, stage and prod) in
   `intent.yaml`. Replace it with your domain in the same change.

3. Merge. The next deploy of `apps/web` builds with the new origin. (A change
   to `intent.yaml` alone deploys nothing — touch `apps/web` in the same pull
   request, or let the next change to the server carry it.) Hosts that saved
   the old `/mcp` URL keep working: the workers.dev URL still answers.
