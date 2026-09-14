const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5173';
const prefix = process.argv[3] || 'before';
const outDir = path.join(__dirname);

const viewports = [
  ['1440', { width: 1440, height: 900 }],
  ['390', { width: 390, height: 844 }],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${base}/historychart-preview.html`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForSelector('[data-historychart-preview] svg', { timeout: 15000 });
    await page.waitForTimeout(400);
    const clip = await page.locator('[data-historychart-preview]').boundingBox();
    const file = path.join(outDir, `${prefix}-historychart-${vpName}.png`);
    await page.screenshot({ path: file, clip });
    console.log('wrote', file);
    await page.close();
  }
  await browser.close();
})();
