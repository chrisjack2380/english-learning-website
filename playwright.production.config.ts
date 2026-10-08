import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const baseURL = new URL(process.env.VITE_BASE_PATH || '/', 'http://127.0.0.1:4173').href;

export default defineConfig(base, {
  use: { ...base.use, baseURL },
  outputDir: 'test-results/production',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/production', open: 'never' }]],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20000,
  },
});
