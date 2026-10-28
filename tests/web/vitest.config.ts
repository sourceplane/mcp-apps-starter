import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^app\//, replacement: path.resolve(__dirname, "../../apps/web/app") + "/" },
      { find: /^web\//, replacement: path.resolve(__dirname, "../../apps/web") + "/" },
    ],
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
