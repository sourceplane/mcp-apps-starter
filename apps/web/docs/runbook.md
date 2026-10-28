# web — runbook

## How it runs

Pull requests verify it; a merge to `main` deploys it to `stage`, `prod`.
CI plans what changed (`orun plan --changed`) and runs each lane with `orun run`;
the plan orders a component after everything it depends on.

## Local commands

```bash
pnpm --filter @app/web dev
pnpm --filter @app/web build
pnpm --filter @app/web typecheck
pnpm --filter @app/web lint
pnpm --filter @app/web preview
```

## Verify

After a deploy the lane runs this smoke against the environment it
deployed (`ORUN_ENVIRONMENT`); `DEPLOYED_URL` overrides the URL:

```bash
base="${DEPLOYED_URL}" && health="$(curl -sf --max-time 20 "${base}/api/health")" && echo "${health}" | grep -q "\"status\":\"ok\"" && html="$(curl -sfL --max-time 20 "${base}/")" && echo "${html}" | grep -q "href=\"/counter\"" && list="$(curl -sf --max-time 20 -X POST "${base}/mcp" -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"resources/list\",\"params\":{}}")" && uri="$(echo "${list}" | grep -o "ui://[^\"]*" | head -1)" && test -n "${uri}" && widget="$(curl -sf --max-time 30 -X POST "${base}/mcp" -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"resources/read\",\"params\":{\"uri\":\"${uri}\"}}")" && echo "${widget}" | grep -q "text/html;profile=mcp-app" && echo "${widget}" | grep -q "/_next/static/"
```

## Rollback

Revert the commit on `main`. The next convergence applies the previous desired
state; nothing was changed out of band, so there is nothing else to undo.

## Common failures

- **The smoke fails right after a first deploy**: a new workers.dev route can
  answer 4xx for a few seconds and the lane retries. A failure that persists
  is a regression in the deployed code.
