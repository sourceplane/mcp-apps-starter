/**
 * Resolve the public base URL of the app.
 *
 * The widget HTML an MCP host renders in its sandboxed iframe loads its
 * scripts, styles and data from this origin (`assetPrefix`, the `<base>` tag,
 * the CSP's connect/resource domains), so it must be the origin the host can
 * reach — never the iframe's own.
 *
 * - Every Orun build sets NEXT_PUBLIC_SITE_URL to the environment's public
 *   origin: its SITE_URL (intent.yaml) or its workers.dev URL. Next.js inlines
 *   it at build, so the Worker, the pages and next.config all agree.
 * - In development with a tunnel (ngrok, cloudflared, etc.), set BASE_URL in
 *   your .env to the tunnel's HTTPS URL so that assets served inside
 *   ChatGPT's, Cursor's, or Claude.ai's iframe resolve correctly.
 *
 * Examples:
 *   BASE_URL=https://xxxx-xxx-xxx.ngrok-free.app
 */
export const baseURL =
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : // `pnpm build && pnpm preview` without an origin: wrangler's own.
      "http://localhost:8787");
