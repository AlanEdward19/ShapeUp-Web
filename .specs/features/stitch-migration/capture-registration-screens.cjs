const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5173';
const prefix = process.argv[3] || 'after';
const outDir = path.join(__dirname);

const viewports = [
  ['1440', { width: 1440, height: 900 }],
  ['390', { width: 390, height: 844 }],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (e) => errors.push(`${vpName}: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`${vpName} console: ${msg.text()}`);
    });
    await page.addInitScript(() => {
      localStorage.setItem('shapeup_language', 'pt-BR');
    });
    await page.goto(`${base}/register`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-stitch="register"]', { timeout: 15000 });
    await page.waitForTimeout(1500);
    const file = path.join(outDir, `${prefix}-registration-${vpName}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
