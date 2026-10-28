# Epics

Orun-style work programs. Each epic is a folder carrying `epic.yaml` (the
declaration the platform reads: slug, key prefix, milestones with exit
criteria and task keys) beside its doc set. The pull request that adds the
folder is the adoption; the merge creates the epic in the workspace.

| Epic | Cluster | Status | What it is |
|------|---------|--------|------------|
| [`mcp-apps-starter/`](./mcp-apps-starter/) | **MA** | In progress (MA1: the MCP Apps server on Workers) | Vercel's MCP Apps Next.js starter — an MCP server whose `greet` tool carries a UI widget rendered from the app's own page — on Cloudflare Workers + Static Assets via OpenNext, and an Orun baseline that instantiates it in one landing (MA2) |

As-built ≠ intent: what shipped lives in each epic's `IMPLEMENTATION-STATUS.md`.
