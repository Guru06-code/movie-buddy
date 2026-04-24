const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node server.js",
    url: "http://127.0.0.1:4173/api/health",
    reuseExistingServer: true,
    timeout: 60000,
  },
});