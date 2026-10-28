# apps/web — the MCP Apps server

Vercel's [MCP Apps Next.js starter](https://github.com/vercel-labs/mcp-apps-nextjs-starter),
running on Cloudflare Workers + Static Assets:

- An MCP server at `/mcp` (`app/mcp/route.ts`): stateless Streamable HTTP
  through `mcp-handler`, one tool (`greet`) and one UI resource, registered
  with `@modelcontextprotocol/ext-apps`
- The widget UI (`app/page.tsx`), which hosts render in a sandboxed iframe;
  the route serves its rendered HTML as the resource, fetched from this
  Worker through the `WORKER_SELF_REFERENCE` service binding
- The host bridge (`app/hooks/use-mcp-app.ts`), two example pages (`/about`,
  `/counter`), the iframe patches (`app/layout.tsx`) and CORS (`middleware.ts`)
- `/api/health`, the deploy's liveness answer
- Tailwind v4, Geist font

`/mcp` is open: no authentication, as upstream. The server's name — the one
`initialize` gives a host — and the repository it is built from are in
`app/site.ts`; the public origin is `baseUrl.ts`.

```bash
pnpm dev            # next dev on http://localhost:3000 (a host needs a tunnel: BASE_URL)
pnpm build          # next build + opennextjs-cloudflare build → .open-next/
pnpm wire:fixture   # render wrangler.jsonc for dev from wrangler.template.jsonc
pnpm preview        # wrangler dev over the built Worker
```

`wrangler.jsonc` is generated: edit `wrangler.template.jsonc`. How it is
deployed — per environment, on merge to `main` — is the repository's README
and `component.yaml` beside this file.
