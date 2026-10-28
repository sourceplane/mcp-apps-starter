# mcp-apps-starter — Vercel's MCP Apps Next.js starter on Cloudflare Workers

**The starter is a Next.js app with two roles — an MCP server at `/mcp` whose
`greet` tool carries a UI widget, and the widget itself, which is the app's
own home page, fetched by the route and served as an MCP resource — so the
port is one Worker built by OpenNext whose widget route reaches its own page
through a service binding to itself, deployed by Orun to stage and prod on
every merge — and the baseline that makes a copy of it somebody else's server
in one landing.**

| | |
|---|---|
| Status | In progress — MA0 on main |
| Upstream | [vercel-labs/mcp-apps-nextjs-starter](https://github.com/vercel-labs/mcp-apps-nextjs-starter), at `adca42c` — **no licence** (risk MA-B) |
| Reference | [portfolio-starter-kit](https://github.com/sourceplane/portfolio-starter-kit) (the Next.js-on-OpenNext scaffolding), [hono-mcp](https://github.com/sourceplane/hono-mcp) (the MCP lessons) |
| Key | `MA` |

## Read in this order

1. [design.md](design.md) — the starter, how each Vercel piece maps to
   Cloudflare, the repository and the build, and the alternatives rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones and
   what each one lands.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream starter.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| MA0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | MA-1 |
| MA1 — the MCP Apps server on Workers | the starter in `apps/web` on OpenNext, its self-binding, its tests, the README | MA-2 |
| MA2 — a baseline | the console card, the build document, the context pack and the baseline's tests | MA-3 |
