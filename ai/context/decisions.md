# mcp-apps-starter — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | OpenNext on Workers + Static Assets (`cloudflare-workers-assets-turbo`), the static-assets incremental cache + `populateCache` | portfolio-starter-kit's build shape; the pages are pre-rendered at build, `/mcp` and `/api/health` run in the Worker | design.md §2 |
| 2 | The widget route reaches its own `/` page through `WORKER_SELF_REFERENCE`, a service binding to the Worker itself, with the public URL | A Worker fetching its own workers.dev hostname over the network is refused; the binding keeps the page rendered for the public origin (proven with an unresolvable origin) | design.md §2, the spike |
| 3 | `wrangler.jsonc` is rendered per environment from `wrangler.template.jsonc` (`__ENV__`) by the build | The binding must name the Worker, and the Worker is named per environment | design.md §3 |
| 4 | `mcp-handler` 1.1.0 and MCP SDK 1.26.0 (upstream 1.0.7 and 1.25.2) | The older SDK's Node transport imports `@hono/node-server`, which replaces the global `Response`; workerd refuses every response the route returns | risks MA-C |
| 5 | Upstream's module-level `createMcpHandler` is kept | OpenNext evaluates a route module inside the request that first reaches it, so the handler's cleanup timer starts in a request, not in global scope (verified 35 s apart) | risks MA-D |
| 6 | The origin is `NEXT_PUBLIC_SITE_URL`, baked in by the Orun build: the environment's `SITE_URL`, else its workers.dev URL; `BASE_URL` still wins | Upstream derived it from Vercel's environment variables | IMPLEMENTATION-STATUS |
| 7 | `SITE_NAME` names the server in `initialize`, the page title and the heading | One rename seam; upstream's name was Vercel-specific ("mcp-typescript server on vercel") | IMPLEMENTATION-STATUS |
| 8 | `/mcp` stays open | As upstream; the one tool reads and writes nothing; documented in both READMEs and operations.md | risks MA-E |
| 9 | One landing (`01-product`) then the record (`03-docs`), each bootstrap landing checked by `plan` alone | portfolio-starter-kit's and cirrus-baseline's shape | design.md §6 |
| 10 | The workers.dev subdomain is read from the Cloudflare connection; the console asks for no domain | portfolio-starter-kit's PK-8 and PK-9 | `blueprint.yaml`, `repo-blueprint.yaml` |
| 11 | Geist from the `geist` package, not `next/font/google` | Google's font API fails on GitHub's runners (strapi-launchpad) | IMPLEMENTATION-STATUS |
