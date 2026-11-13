import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone SE"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: "node src/server.mjs",
    url: "http://127.0.0.1:4173/api/health",
    reuseExistingServer: false,
    env: { PORT: "4173", DATA_DIR: `.data/e2e-${randomUUID()}` },
    timeout: 15000,
  },
});
