import { baseURL } from "@/baseUrl";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createMcpHandler } from "mcp-handler";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { SITE_NAME } from "../site";

const UI_VERSION = "2026-02-10-21";
const RESOURCE_URI = `ui://app/index.html?v=${UI_VERSION}`;

// ---------------------------------------------------------------------------
// Self-fetch: grab the rendered Next.js page to use as the widget HTML.
//
// On Workers the request goes through WORKER_SELF_REFERENCE, a service binding
// to this same Worker: it carries the public URL, so the page renders exactly
// as a visitor would get it, but it never leaves Cloudflare — a Worker that
// fetches its own workers.dev hostname over the network is refused. Under
// `next dev` there is no Cloudflare context, and the dev server fetches itself.
// ---------------------------------------------------------------------------
function selfReference(): CloudflareEnv["WORKER_SELF_REFERENCE"] | undefined {
  try {
    return getCloudflareContext().env.WORKER_SELF_REFERENCE;
  } catch {
    return undefined;
  }
}

async function fetchPageHtml(path: string): Promise<string> {
  const url = `${baseURL}${path}`;
  const self = selfReference();
  const res = self ? await self.fetch(url) : await fetch(url);
  return res.text();
}

// ---------------------------------------------------------------------------
// MCP handler
// ---------------------------------------------------------------------------
const handler = createMcpHandler(async (server) => {
  registerAppResource(
    server,
    "app-widget",
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await fetchPageHtml("/");
      return {
        contents: [
          {
            uri: RESOURCE_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                csp: {
                  connectDomains: [baseURL],
                  resourceDomains: [baseURL],
                },
              },
            },
          },
        ],
      };
    },
  );

  registerAppTool(
    server,
    "greet",
    {
      title: "Greet",
      description: "Display a personalised greeting in the widget.",
      inputSchema: {
        name: z.string().describe("Name of the person to greet"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: RESOURCE_URI },
      },
    },
    async ({ name }) => ({
      content: [{ type: "text" as const, text: `Hello, ${name}!` }],
      structuredContent: {
        name,
        greeting: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      },
    }),
  );
}, { serverInfo: { name: SITE_NAME, version: "0.1.0" } });

export const GET = handler;
export const POST = handler;
