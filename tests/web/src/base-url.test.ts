import { afterEach, describe, expect, it, vi } from "vitest";

// baseUrl.ts reads the environment once, when it is first imported — as
// next.config does at build and the Worker does on its first request.
async function baseURLWith(env: Record<string, string | undefined>): Promise<string> {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string);
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key];
  const { baseURL } = await import("web/baseUrl");
  return baseURL;
}

afterEach(() => vi.unstubAllEnvs());

describe("the public origin (apps/web/baseUrl.ts)", () => {
  it("is the environment's NEXT_PUBLIC_SITE_URL, which every Orun build sets", async () => {
    expect(
      await baseURLWith({ BASE_URL: undefined, NEXT_PUBLIC_SITE_URL: "https://mcp.example.test", NODE_ENV: "production" }),
    ).toBe("https://mcp.example.test");
  });

  it("is a development tunnel's BASE_URL when one is set", async () => {
    expect(
      await baseURLWith({ BASE_URL: "https://tunnel.example.test", NEXT_PUBLIC_SITE_URL: "http://localhost:3000", NODE_ENV: "development" }),
    ).toBe("https://tunnel.example.test");
  });

  it("falls back to the local servers when nothing is set", async () => {
    expect(await baseURLWith({ BASE_URL: undefined, NEXT_PUBLIC_SITE_URL: undefined, NODE_ENV: "development" })).toBe(
      "http://localhost:3000",
    );
    expect(await baseURLWith({ BASE_URL: undefined, NEXT_PUBLIC_SITE_URL: undefined, NODE_ENV: "production" })).toBe(
      "http://localhost:8787",
    );
  });

  it("never names a Vercel URL", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(new URL("../../../apps/web/baseUrl.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/VERCEL_/);
  });
});
