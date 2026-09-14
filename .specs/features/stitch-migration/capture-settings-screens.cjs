const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5196';
const prefix = process.argv[3] || 'before';
const outDir = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const viewports = [
    ['1440', { width: 1440, height: 900 }],
    ['390', { width: 390, height: 844 }],
  ];
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (e) => errors.push(`${vpName}: ${e.message}`));
    await page.route('**/src/contexts/AuthContext.jsx*', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: `export const useAuth=()=>({currentUser:{uid:'visual-test',email:'preview@example.com'},signOut:async()=>{},resetPassword:async()=>{}}); export const AuthProvider=({children})=>children;`,
      }),
    );
    await page.route((url) => url.pathname.startsWith('/api/'), (r) => {
      const url = r.request().url();
      const data = url.includes('/me')
        ? { id: 1, name: 'Rodrigo Silva', email: 'rodrigo.silva@shapeup.pro' }
        : { items: [] };
      r.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('shapeup_language', 'pt-BR');
      localStorage.setItem('shapeup_user_name', 'Rodrigo Silva');
      localStorage.setItem('shapeup_user_id', '1');
      localStorage.setItem('shapeup_role', 'professional');
      localStorage.setItem('shapeup_cookie_consent', 'essential');
    });
    await page.goto(`${base}/dashboard/settings`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(outDir, `${prefix}-settings-${vpName}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
