import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
    testTimeout: 20000,
    fileParallelism: false,
    env: {
      DATABASE_URL: "file:./test.db",
      NODE_ENV: "test",
      SESSION_SECRET: "secret-de-prueba-para-vitest",
    },
  },
});