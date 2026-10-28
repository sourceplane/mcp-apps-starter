# mcp-apps-starter — implementation plan

Three milestones, one task each, each landed as one pull request.

## MA0 — the spec (MA-1)

The repository is born with portfolio-starter-kit's frame — `intent.yaml`
(dev verify-only, stage, prod after stage; the placeholder workspace
`ws_CHANGE_ME`, so CI plans nothing until it is linked), `ci.yml` byte for
byte turso-starter's (as portfolio-starter-kit carries it), the shared
TypeScript and ESLint configuration, the wrangler renderer, the pnpm
workspace and turbo pipeline, and the spec index — and this doc set and the
three task contracts land on it.

## MA1 — the MCP Apps server on Workers (MA-2)

- `apps/web` is upstream's app: `app/` (the route, the widget, the hook, the
  two example pages, the layout), `baseUrl.ts`, `middleware.ts`,
  `next.config.ts` — with the origin from `NEXT_PUBLIC_SITE_URL`, the
  self-fetch through `WORKER_SELF_REFERENCE`, `serverInfo` named by
  `SITE_NAME`, `mcp-handler` 1.1.0 and the SDK it pins, Geist from the
  `geist` package, and `/api/health`.
- `open-next.config.ts`, `wrangler.template.jsonc` (rendered per
  environment), `cloudflare-env.d.ts`, and `component.yaml`
  (`cloudflare-workers-assets-turbo`) with a smoke over `/api/health`, `/`,
  `resources/list` and `resources/read`.
- `tests/web`: vitest over the identity and `baseURL`'s precedence.
- The README: run, test, connect a host, deploy; `/mcp` is open; how each
  Vercel piece maps.

Done when typecheck, lint, test and build are green, and `wrangler dev`
answers the MCP SDK's own client with the widget.

## MA2 — a baseline (MA-3)

portfolio-starter-kit's machinery on this tree: the card, the build document
(one landing, `01-product`, then the record, `03-docs`), `.baseline/`
(identity, the server's README and agent page, task contracts), the rename
engine, the bootstrap helpers, the deployment-record renderer (probing `/`
and `/api/health`), the phase pages, the context pack, and the baseline's
tests — with the placement tier holding the Worker's name and its
self-binding to the product's, and the end-to-end tier making a real MCP
exchange against the staged Worker (`testing/lib/mcp-client.mjs`). Done when
every Baseline CI tier is green; tagged `baseline-v1`.
