const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.STITCH_BASE || 'http://localhost:5195';
const OUT = path.join(process.cwd(), '.specs/features/stitch-migration');

const exercises = ['Agachamento Livre com Barra'].map((name, i) => ({
  id: i + 1,
  name,
  namePt: name,
  type: 'Composto',
  equipment: 'Barra',
  muscles: ['Quadríceps'],
  sets: [{ id: 's1', type: 'working', reps: '10', load: '60', rest: '90' }],
  description: 'Controle.',
  steps: ['Execute.'],
}));
const plan = {
  id: 1,
  templateId: 1,
  name: 'Mesociclo de hipertrofia — Fase 2',
  durationInWeeks: 6,
  blocks: [{ id: 'b1', type: 1, exercises }],
  history: [],
};
const clients = ['Juliana Mendes'].map((name, i) => ({
  id: i + 1,
  name,
  status: 'Active',
  activePlan: 'Hipertrofia — Fase 2',
  compliance: 94,
  lastCheckin: 'Hoje',
}));
const goals = { kcal: 2600, proteinG: 180, carbG: 300, fatG: 80 };
const diary = {
  totals: { kcal: 1840, proteinG: 145, carbG: 200, fatG: 52 },
  meals: [],
};

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.route('**/src/contexts/AuthContext.jsx*', r =>
    r.fulfill({
      contentType: 'application/javascript',
      body: `export const useAuth=()=>({currentUser:{uid:'visual-test',email:'preview@example.com',displayName:'Rodrigo Silva'},signOut:async()=>{},resetPassword:async()=>{}}); export const AuthProvider=({children})=>children;`,
    }),
  );
  await page.route('**/src/services/apiClient.js*', r =>
    r.fulfill({
      contentType: 'application/javascript',
      body: `export const apiClient=async(url,options)=>{const response=await fetch(url,options);return response.json()};`,
    }),
  );
  await page.route(
    url => url.pathname.startsWith('/api/'),
    r => {
      const url = r.request().url();
      let data = { items: [], nextCursor: null };
      if (url.includes('workout-templates') || url.includes('workout-plans')) data = { items: [plan] };
      else if (url.includes('workouts')) data = { items: [] };
      else if (url.includes('/diary')) data = diary;
      else if (url.includes('nutrition') && url.includes('profile')) data = { activeGoal: goals };
      else if (url.includes('/me')) data = { id: 1, userId: 1, name: 'Rodrigo Silva' };
      else if (url.includes('clients')) data = { items: clients, nextCursor: null };
      else if (url.includes('gamification') && url.includes('ranking')) data = { items: [{ userId: 1, level: 3, shapeScore: 1200 }], nextCursor: null };
      else if (url.includes('gamification')) data = { totalXp: 420, currentStreak: 5, shapeCoins: 80, shapeScore: 1200, level: 3 };
      else if (url.includes('dashboard')) data = {
        sessionsCompletionRate: 80,
        weeklyVolumeProgressPercent: 8,
        weeklyVolume: 24800,
        sessionsCompletedThisWeek: 4,
        sessionsTargetPerWeek: 5,
      };
      r.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    },
  );

  await page.addInitScript(({ clients, plan }) => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('shapeup_language', 'pt-BR');
    localStorage.setItem('shapeup_cookie_consent', 'essential');
    localStorage.setItem('shapeup_user_name', 'Rodrigo Silva');
    localStorage.setItem('shapeup_user_id', '1');
    localStorage.setItem('shapeup_client_id', '1');
    localStorage.setItem('shapeup_platform_admin', 'true');
    localStorage.setItem('shapeup_clients', JSON.stringify(clients));
    localStorage.setItem('shapeup_client_plans_1', JSON.stringify([plan]));
    const old = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      return k.includes('tour') ? 'true' : old.call(this, k);
    };
  }, { clients, plan });

  for (const [role, tag] of [
    ['professional', 'professional'],
    ['independent', 'athlete'],
  ]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(BASE);
      await page.evaluate(r => {
        sessionStorage.setItem('testRole', r);
        localStorage.setItem('shapeup_role', r);
      }, role);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForTimeout(1200);
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(OUT, `after-${tag}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const metrics = await page.evaluate(() => {
        const host = document.querySelector('[data-stitch]');
        const body = host?.shadowRoot?.querySelector('.stitch-body');
        return {
          h1: body?.querySelector('h1')?.textContent?.trim(),
          scroll: body?.scrollWidth,
          width: body?.clientWidth,
        };
      });
      console.log('OK', tag, width, metrics);
    }
  }

  if (errors.length) {
    console.error('PAGEERRORS', errors);
    process.exit(1);
  }
  await browser.close();
})();
