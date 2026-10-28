import { SITE_NAME, SOURCE_URL } from "../../site";

// A liveness answer for the deploy's smoke and the docs phase's probe: the
// server's name and the repository it is built from. Nothing else.
export function GET() {
  return Response.json({ status: "ok", name: SITE_NAME, source: SOURCE_URL });
}
