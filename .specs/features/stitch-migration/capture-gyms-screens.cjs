const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5190';
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
    await page.route('**/src/contexts/AuthContext.jsx*', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: `export const useAuth=()=>({currentUser:{uid:'visual-test',email:'preview@example.com'},signOut:async()=>{},resetPassword:async()=>{}}); export const AuthProvider=({children})=>children;`,
      }),
    );
    await page.route('**/src/services/apiClient.js*', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: `export const apiClient=async(url,options)=>{const response=await fetch(url,options);return response.json()};`,
      }),
    );
    await page.route((url) => url.pathname.startsWith('/api/'), (r) => {
      const url = r.request().url();
      let data = { items: [], nextCursor: null };
      if (url.includes('/gyms'))
        data = { items: [{ id: 1, name: 'Academia de teste', address: 'Avenida Paulista, São Paulo' }] };
      else if (url.includes('/me')) data = { id: 1, name: 'Rodrigo Silva' };
      r.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('shapeup_language', 'pt-BR');
      localStorage.setItem('shapeup_cookie_consent', 'essential');
      localStorage.setItem('shapeup_user_name', 'Rodrigo Silva');
      localStorage.setItem('shapeup_user_id', '1');
      localStorage.setItem('shapeup_role', 'independent');
      const old = Storage.prototype.getItem;
      Storage.prototype.getItem = function (k) {
        return k.includes('tour') ? 'true' : old.call(this, k);
      };
    });
    await page.goto(`${base}/dashboard/gyms`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(outDir, `${prefix}-gyms-${vpName}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
