import { defineConfig, devices } from '@playwright/test';

const url = 'http://127.0.0.1:3123';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: '.qa/v125/playwright',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 45_000,
  use: { baseURL: url, acceptDownloads: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit', viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'node ./node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3123',
    url,
    reuseExistingServer: false,
    env: { NEXT_TELEMETRY_DISABLED: '1', OPENAI_API_KEY: '', AI_INTEGRATIONS_OPENAI_API_KEY: '',
      AI_INTEGRATIONS_OPENAI_BASE_URL: '', TRUST_PROXY: 'false' },
  },
});
