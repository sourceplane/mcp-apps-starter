// The Worker's bindings, as getCloudflareContext().env sees them
// (wrangler.template.jsonc). Declared by hand rather than through
// @cloudflare/workers-types, which would retype Request and Response for the
// whole app.
interface CloudflareEnv {
  /** The Worker's static assets: `.open-next/assets`. */
  ASSETS: { fetch(input: Request | string): Promise<Response> };
  /**
   * A service binding to this same Worker. The MCP route renders a widget by
   * requesting one of the app's own pages; on Workers that request goes
   * through this binding, never over the network — a Worker fetching its own
   * workers.dev hostname is refused.
   */
  WORKER_SELF_REFERENCE: { fetch(input: Request | string): Promise<Response> };
}
