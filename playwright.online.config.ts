import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const address = process.env.SITE_URL;
if (!address) throw new Error('请用 SITE_URL 指定已经部署的公开 HTTPS 网站地址。');
const url = new URL(address);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
  throw new Error('SITE_URL 必须是无凭据、无查询参数的 HTTPS 网站地址。');
if (url.pathname !== '/') throw new Error('当前版本须部署在站点根路径。');

export default defineConfig(base, {
  use: { ...base.use, baseURL: url.origin },
  outputDir: 'test-results/online',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/online', open: 'never' }]],
  webServer: undefined,
});
