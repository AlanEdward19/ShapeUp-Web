const path = require('path');
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');

const outDir = __dirname;
const prefix = process.argv[2] || 'after';
const defaultImport = path.resolve(outDir, '../../../src/components/gamification/AthleteScoreboard.tsx');
const importPath = process.argv[3]
  ? path.resolve(outDir, process.argv[3].replace(/^\.\//, ''))
  : defaultImport;
const configPath = path.join(outDir, 'scoreboard-vite.config.js');
const renderScript = path.join(outDir, 'render-scoreboard-html.jsx');
const htmlPath = path.join(outDir, '_scoreboard-parity-temp.html');

const render = spawnSync(
  'npx',
  ['vite-node', '--config', configPath, renderScript, importPath],
  { cwd: path.join(outDir, '../../..'), encoding: 'utf8', shell: true, maxBuffer: 10 * 1024 * 1024 },
);

if (render.status !== 0) {
  console.error(render.stderr || render.stdout);
  process.exit(render.status || 1);
}

fs.writeFileSync(htmlPath, render.stdout);

const viewports = [
  ['1440', { width: 1440, height: 400 }],
  ['390', { width: 390, height: 520 }],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${prefix}-scoreboard-${vpName}.png`);
    await page.locator('[data-athlete-scoreboard]').screenshot({ path: file });
    console.log('wrote', file);
    await page.close();
  }
  await browser.close();
  fs.unlinkSync(htmlPath);
})();
