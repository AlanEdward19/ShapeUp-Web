const { chromium } = require('playwright');
const path = require('path');

const base = process.argv[2] || 'http://localhost:5192';
const prefix = process.argv[3] || 'after';
const outDir = path.join(__dirname);

const macros = { kcal: 1840, proteinG: 145, carbG: 200, fatG: 52 };
const goals = { kcal: 2600, proteinG: 180, carbG: 300, fatG: 80 };
const plan = {
  id: 1,
  templateId: 1,
  name: 'Mesociclo de hipertrofia — Fase 2',
  durationInWeeks: 6,
  blocks: [{ id: 'b1', type: 1, exercises: [] }],
  history: [],
};
const clients = ['Juliana Mendes', 'Lucas Pinheiro'].map((name, i) => ({
  id: i + 1,
  name,
  status: 'Active',
  activePlan: 'Hipertrofia — Fase 2',
  compliance: 94 - i * 9,
  lastCheckin: 'Hoje',
}));

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
        body: `export const useAuth=()=>({currentUser:{uid:'visual-test',email:'preview@example.com'},signOut:async()=>{}}); export const AuthProvider=({children})=>children;`,
      }),
    );
    await page.route('**/src/services/apiClient.js*', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: `export const apiClient=async(url,options)=>{const response=await fetch(url,options);return response.json()};`,
      }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/'),
      (r) => {
        const url = r.request().url();
        let data = { items: [], nextCursor: null };
        if (url.includes('moderation')) {
          data = {
            items: [
              {
                requestId: 'req1',
                foodName: 'Arroz integral',
                createdAtUtc: '2026-09-12',
                requestedByUserId: '1',
                publicMacros: goals,
                proposedMacros: macros,
              },
            ],
          };
        } else if (url.includes('/me')) data = { id: 1, name: 'Rodrigo Silva' };
        r.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
      },
    );
    await page.addInitScript(
      ({ clients: clientList, plan: activePlan }) => {
        localStorage.setItem('theme', 'dark');
        localStorage.setItem('shapeup_language', 'pt-BR');
        localStorage.setItem('shapeup_cookie_consent', 'essential');
        localStorage.setItem('shapeup_user_name', 'Rodrigo Silva');
        localStorage.setItem('shapeup_platform_admin', 'true');
        localStorage.setItem('shapeup_role', 'professional');
        localStorage.setItem('shapeup_clients', JSON.stringify(clientList));
        localStorage.setItem('shapeup_client_plans_1', JSON.stringify([activePlan]));
      },
      { clients, plan },
    );
    await page.goto(`${base}/dashboard/admin/food-moderation`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForSelector('[data-stitch="moderation"]', { timeout: 15000 });
    await page.addStyleTag({
      content:
        '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}',
    });
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${prefix}-moderation-${vpName}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
    await page.close();
  }
  console.log('console-errors', errors.length ? errors : 'none');
  await browser.close();
})();
