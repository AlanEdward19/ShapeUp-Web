const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5193';
const prefix = process.argv[3] || 'after';
const outDir = path.join(__dirname);

const viewports = [
  ['1440', { width: 1440, height: 900 }],
  ['390', { width: 390, height: 844 }],
];

const emptyDiary = {
  date: new Date().toISOString().slice(0, 10),
  meals: [],
  totals: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (e) => errors.push(`${vpName}: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`${vpName} console: ${msg.text()}`);
    });
    await page.route('**/api/nutrition/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/profile') && !url.includes('onboarding')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ activeGoal: { kcal: 3100, proteinG: 210, carbG: 360, fatG: 75 } }),
        });
      }
      if (url.includes('/diary')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(emptyDiary),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 1,
          displayName: 'Lucas Vianna',
          email: 'capture@shapeup.local',
        }),
      }),
    );
    await page.addInitScript(() => {
      localStorage.setItem('shapeup_language', 'pt-BR');
      localStorage.setItem('shapeup_role', 'independent');
      localStorage.setItem('shapeup_user_name', 'Lucas Vianna');
      localStorage.setItem('shapeup_user_id', 'capture-user');
    });
    await page.goto(`${base}/dashboard/nutrition/diary`, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForSelector('[data-stitch="nutrition"]', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const file = path.join(outDir, `${prefix}-nutrition-diary-${vpName}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
