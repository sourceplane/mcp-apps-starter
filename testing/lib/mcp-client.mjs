#!/usr/bin/env node
// A real MCP client exchange against a served Worker — the e2e's proof that the
// server a bootstrap produces speaks MCP Apps, not just that /mcp answers 200.
//
//   node testing/lib/mcp-client.mjs <base-url> <expected-server-name> <public-origin> <app-dir>
//
// The client is the MCP SDK's own (`Client` over `StreamableHTTPClientTransport`),
// loaded from <app-dir>'s dependencies — the exact SDK the server ships — so the
// handshake is the one any MCP host makes: initialize, the initialized
// notification, tools/list, a tools/call of `greet`, then resources/list and a
// resources/read of the widget the tool points at. The widget is the app's own
// `/` page, which the Worker fetches from itself through its WORKER_SELF_REFERENCE
// binding at <public-origin> — an origin nothing serves in the e2e — so HTML that
// comes back naming that origin can only have come through the binding. It
// prints one line on success and exits non-zero naming the first thing wrong.
import { createRequire } from "node:module";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const [base, expectedName, origin, appDir] = process.argv.slice(2);
if (!base || !expectedName || !origin || !appDir) {
  console.error("usage: mcp-client.mjs <base-url> <expected-server-name> <public-origin> <app-dir>");
  process.exit(2);
}

const require = createRequire(path.join(path.resolve(appDir), "package.json"));
const load = async (spec) => import(pathToFileURL(require.resolve(spec)).href);
const { Client } = await load("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = await load("@modelcontextprotocol/sdk/client/streamableHttp.js");

function fail(message) {
  console.error(`  ✕ ${message}`);
  process.exit(1);
}

const client = new Client({ name: "mcp-apps-e2e", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL("/mcp", base));
try {
  await client.connect(transport);
} catch (error) {
  fail(`initialize failed: ${error?.message ?? error}`);
}

const server = client.getServerVersion();
if (server?.name !== expectedName) fail(`the server names itself ${JSON.stringify(server?.name)}, not ${JSON.stringify(expectedName)}`);
const caps = client.getServerCapabilities() ?? {};
if (!caps.tools) fail("the server does not offer tools");
if (!caps.resources) fail("the server does not offer resources");
// Stateless: the server issues no session id, so any isolate answers any call.
if (transport.sessionId !== undefined) fail(`the server issued a session id (${transport.sessionId}); it is meant to be stateless`);

const { tools } = await client.listTools();
const names = tools.map((t) => t.name);
if (JSON.stringify(names) !== JSON.stringify(["greet"])) fail(`tools/list answered ${JSON.stringify(names)}`);
const uiUri = tools[0]?._meta?.ui?.resourceUri;
if (typeof uiUri !== "string" || !uiUri.startsWith("ui://")) fail(`greet carries no ui resourceUri (${JSON.stringify(tools[0]?._meta)})`);

const call = await client.callTool({ name: "greet", arguments: { name: "Ada" } });
if (call.content?.[0]?.text !== "Hello, Ada!") fail(`tools/call greet answered ${JSON.stringify(call.content)}`);
if (call.structuredContent?.greeting !== "Hello, Ada!") fail(`greet's structuredContent is ${JSON.stringify(call.structuredContent)}`);

const { resources } = await client.listResources();
if (!resources.some((r) => r.uri === uiUri)) fail(`resources/list does not offer ${uiUri}: ${JSON.stringify(resources.map((r) => r.uri))}`);

const read = await client.readResource({ uri: uiUri });
const widget = read.contents?.[0];
if (widget?.mimeType !== "text/html;profile=mcp-app") fail(`the widget's mimeType is ${JSON.stringify(widget?.mimeType)}`);
const page = widget?.text ?? "";
const h1 = page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
const heading = h1 && h1[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&apos;/g, "'").trim();
if (heading !== expectedName) fail(`the widget's heading is ${JSON.stringify(heading)}, not ${JSON.stringify(expectedName)}`);
if (!page.includes(`${origin}/_next/static/`)) fail(`the widget's assets are not on ${origin} — the page did not render for the public origin`);
const csp = widget?._meta?.ui?.csp ?? {};
for (const key of ["connectDomains", "resourceDomains"]) {
  if (JSON.stringify(csp[key]) !== JSON.stringify([origin])) fail(`the widget's csp.${key} is ${JSON.stringify(csp[key])}, not [${origin}]`);
}

await client.close();
console.log(`   an MCP client: initialize (${server.name} ${server.version}, no session), tools/list (greet → ${uiUri}), tools/call, resources/list, resources/read (${page.length} bytes of the / page, on ${origin})`);
