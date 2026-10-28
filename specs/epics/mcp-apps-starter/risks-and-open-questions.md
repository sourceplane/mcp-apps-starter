# mcp-apps-starter — risks and open questions

## MA-A — No live bootstrap yet (OPEN)

Everything short of the platform is proven on every pull request: the card
against the build, the blueprint read by the pinned orun, the leak gate, the
offline bootstrap with the blueprint's own hooks, the server's own plan for
the 01-product merge, and the produced server built, dry-deployed, served,
smoke-tested and called by the MCP SDK's client in the job tree orun stages.
Not proven: the repository created and linked, the token minted, a real
`wrangler deploy`, the self-binding on workers.dev (it is proven under
`wrangler dev`, which reports it `local [connected]`), the smoke against
workers.dev, and a host rendering the widget from the deployed `/mcp`. Hence
the registry row is `unlisted` until one bootstrap from the tag has come up;
the deploy's own smoke reads the widget through `/mcp`, so a broken binding
fails the first convergence rather than a host.

## MA-B — Upstream carries no licence (OPEN)

vercel-labs/mcp-apps-nextjs-starter has no LICENSE file, no `license` in its
`package.json`, nothing in its README, and none recorded by GitHub (at
`adca42c`). The baseline is built and tagged, and registered unlisted with a
licence hold until upstream publishes one.

## MA-C — `mcp-handler` 1.x pins the SDK (ACCEPTED)

`mcp-handler` 1.1.0 declares `@modelcontextprotocol/sdk` `1.26.0` exactly, so
the SDK moves only with it; ext-apps 1.0.1 accepts `^1.24.0`. The upstream
pair (1.0.7, 1.25.2) cannot run on workerd (design §2). A bump that brought
the Node transport back would turn every `/mcp` answer into a 500; the e2e
tier and the deploy's smoke both call `/mcp`.

## MA-D — The module-level handler rests on OpenNext's lazy route evaluation (WATCH)

`createMcpHandler` starts its cleanup interval when it is created. Under
OpenNext the route module is evaluated inside the first request that reaches
it, so the timer starts in a request and workerd allows it; verified with two
full exchanges 35 s apart. An OpenNext that evaluated route modules at
startup would fail with "Disallowed operation called within global scope";
hono-mcp's lazy `handler ??= makeHandler()` is the fix then.

## MA-E — `/mcp` is open (ACCEPTED)

As upstream: no authentication. Anyone with the URL can list and call the
tools; `greet` reads and writes nothing. An owner puts a check in front
(`mcp-handler`'s `withMcpAuth`, or `middleware.ts` reading an Orun runtime
secret) before a tool does anything private — and the smoke then sends the
credential too. Both READMEs and operations.md say so.

## MA-F — `middleware.ts` is a deprecated convention in Next 16 (WATCH)

Upstream's CORS file is kept as is; Next 16 warns that the convention is
renamed (`proxy.ts`). Move it when OpenNext supports the new name.

## MA-G — Hosts cache the widget by URI (ACCEPTED)

The resource URI carries `UI_VERSION`; a host shows a stale widget until it
changes. Upstream's convention, kept; the READMEs say to bump it.
