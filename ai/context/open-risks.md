# mcp-apps-starter — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/mcp-apps-starter/risks-and-open-questions.md`; this page
lists only what is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| MA-A | No live bootstrap yet: the deploy, the self-binding on workers.dev and a host connected to the deployed `/mcp` are unproven | OPEN | One bootstrap from `baseline-v1` against a workspace; its smoke reads the widget through `/mcp` |
| MA-B | Upstream carries no licence | OPEN | A licence from upstream; until then the registry row is unlisted |
| MA-F | Next 16 calls `middleware.ts` deprecated (upstream's CORS file) | WATCH | Rename it to `proxy.ts` when OpenNext supports the new convention |

Accepted, and worth knowing before you change them: MA-E (`/mcp` is open, as
upstream), MA-C (`mcp-handler` 1.x pins the SDK).
