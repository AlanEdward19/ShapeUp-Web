const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5174';
const prefix = process.argv[3] || 'before';
const outDir = path.join(__dirname);

const routes = [
  ['landing', '/'],
  ['login', '/login'],
  ['forgot-password', '/forgot-password'],
];

const viewports = [
  ['1440', { width: 1440, height: 900 }],
  ['390', { width: 390, height: 844 }],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const [routeName, url] of routes) {
    for (const [vpName, viewport] of viewports) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', (e) => errors.push(`${routeName}/${vpName}: ${e.message}`));
      await page.addInitScript(() => {
        localStorage.setItem('shapeup_language', 'pt-BR');
      });
      await page.goto(base + url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1200);
      if (url === '/') {
        await page.waitForFunction(() => {
          const host = document.querySelector('[data-stitch="landing"]');
          const root = host?.shadowRoot;
          if (!root) return false;
          return root.querySelectorAll('[data-reveal="pending"]').length === 0;
        }, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(800);
      } else {
        await page.waitForTimeout(1000);
      }
      const file = path.join(outDir, `${prefix}-public-${routeName}-${vpName}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('wrote', file);
      await page.close();
    }
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
