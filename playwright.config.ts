import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = Number(process.env.SMOKE_PORT ?? 8080);
const baseURL = process.env.SMOKE_BASE_URL ?? `http://localhost:${PORT}`;

// Reuse a pre-installed Chromium if one is on disk (Lovable sandbox ships
// one at /chromium-*). Falls back to Playwright's bundled browser otherwise.
const candidateChromium = [
  "/chromium-1194/chrome-linux/chrome",
  "/chromium-1228/chrome-linux/chrome",
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
].find((p): p is string => !!p && existsSync(p));

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
    launchOptions: candidateChromium ? { executablePath: candidateChromium } : {},
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});