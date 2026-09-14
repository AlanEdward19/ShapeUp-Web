const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5185';
const prefix = process.argv[3] || 'before';
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
      localStorage.setItem('shapeup_role', 'professional');
      localStorage.setItem('shapeup_user_name', 'Coach Alex');
    });
    await page.goto(`${base}/capture-workspace.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-unified-sidebar], [data-stitch]', { timeout: 15000, state: 'attached' });
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${prefix}-workspace-${vpName}.png`);
    const sidebarHandle = await page.evaluateHandle(() => {
      const direct = document.querySelector('[data-unified-sidebar]');
      if (direct) return direct;
      const host = document.querySelector('[data-stitch]');
      return host?.shadowRoot?.querySelector('[data-unified-sidebar]') || null;
    });
    const sidebar = sidebarHandle.asElement();
    if (!sidebar) throw new Error(`sidebar not found (${vpName})`);
    await sidebar.screenshot({ path: file });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
