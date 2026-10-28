# mcp-apps-starter — where this repository stands

The entry page for anyone (or any agent) picking this repository up. It is
this repository's own state and does not ship to a server built from it; the
two pages that do are [operations.md](operations.md) and
[deployment.md](deployment.md).

## What it is

Vercel's MCP Apps Next.js starter — an MCP server at `/mcp` whose `greet` tool
carries a UI widget, the widget being the app's own home page — on Cloudflare
Workers + Static Assets (`@opennextjs/cloudflare`), packaged as an Orun
baseline: `orun new --blueprint repo-blueprint.yaml` builds a new server in
its own repository and takes it to live on stage and prod in one landing
(`01-product`), then records what went live (`03-docs`). One component, no
infra. `/mcp` is open, as upstream.

## Release

| | |
|---|---|
| Latest tag | `baseline-v1` — MA0–MA2 (the spec, the server on Workers, the baseline) |
| Proven live | Not yet (risk MA-A): every tier short of the platform passes in Baseline CI, including a real MCP client's exchange with the built Worker and the widget's self-fetch through its service binding |
| Licence | Upstream carries none; the registry row is unlisted with a licence hold (risk MA-B) |

## Where to read

| Question | Page |
|---|---|
| What shipped, and every departure from upstream | `specs/epics/mcp-apps-starter/IMPLEMENTATION-STATUS.md` |
| Why it is built this way | [decisions.md](decisions.md), then `specs/epics/mcp-apps-starter/design.md` |
| What could still go wrong | [open-risks.md](open-risks.md), then `specs/epics/mcp-apps-starter/risks-and-open-questions.md` |
| How to instantiate it | `BOOTSTRAP.md`, `docs/phases/` |
| What each component is | `apps/web/docs/`, `tests/web/docs/` (generated; `python3 tooling/catalog/gen-component-docs.py`) |
| What a server's agent reads first | `.baseline/product/AGENTS.md` (ships as the server's `AGENTS.md`) |

## Next

1. Bootstrap one server from `baseline-v1` against a workspace, connect an
   MCP host to its prod `/mcp`, and record the timings (closes MA-A).
2. Settle the licence with upstream before the row is listed (MA-B).
