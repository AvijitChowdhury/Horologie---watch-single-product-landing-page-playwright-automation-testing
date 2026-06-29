import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.SMOKE_PORT ?? 8080);
const baseURL = process.env.SMOKE_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    viewport: { width: 1280, height: 1800 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});