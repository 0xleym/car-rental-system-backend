import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.js"],
      exclude: ["src/db/migrate.js"],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
