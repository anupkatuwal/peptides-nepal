import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. They expect both apps to be running already:
 *   API:  the FastAPI app started through backend/tests/e2e_app.py (fake payment gateways)
 *   Site: `npm run build && npm start` (or `npm run dev`) with NEXT_PUBLIC_API_URL pointing at the API
 * See STORE.md → "Tests".
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
