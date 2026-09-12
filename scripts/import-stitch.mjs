import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import tailwind from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

const source = process.argv[2];
if (!source) throw new Error('Provide the Stitch export directory.');
const names = {
  ativa: 'invitation', biblioteca: 'exercises', buscar: 'gyms', cadastro: 'register',
  configura: 'settings', criador: 'builder', dashboard: 'athlete', di_rio: 'nutrition',
  gest_o: 'finance', landing: 'landing', login: 'login', mensagens: 'messages',
  modera: 'moderation', onboarding: 'onboarding', painel: 'professional', recupera: 'recovery',
};
await mkdir('design/stitch', { recursive: true });
await mkdir('src/stitch/templates', { recursive: true });
await mkdir('src/stitch/styles', { recursive: true });
await writeFile('design/stitch/DESIGN.md', await readFile(path.join(source, 'warm_oxide_athletic/DESIGN.md')));
const manifest = {};
for (const folder of await readdir(source)) {
  const name = Object.entries(names).find(([prefix]) => folder.startsWith(prefix))?.[1];
  if (!name) continue;
  const html = await readFile(path.join(source, folder, 'code.html'), 'utf8');
  await writeFile(`design/stitch/${name}.html`, html);
  const scriptContents = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const context = { tailwind: {} };
  for (const script of scriptContents) {
    if (script.includes('tailwind.config')) vm.runInNewContext(script, context, { timeout: 1000 });
  }
  const config = { ...context.tailwind.config, content: [{ raw: html, extension: 'html' }], plugins: [forms, containerQueries] };
  const custom = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join('\n');
  const result = await postcss([tailwind(config)]).process(`@tailwind base;\n@tailwind components;\n@tailwind utilities;\n${custom}`, { from: undefined });
  const css = postcss.parse(result.css);
  css.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    rule.selector = selectorParser(selectors => {
      selectors.walkTags(tag => { if (['html', 'body'].includes(tag.value)) tag.replaceWith(selectorParser.className({ value: 'stitch-body' })); });
      selectors.walkPseudos(pseudo => { if (pseudo.value === ':root') pseudo.value = ':host'; });
    }).processSync(rule.selector);
  });
  await writeFile(`src/stitch/styles/${name}.css`, css.toString());
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/i)?.[1] || '';
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  await writeFile(`src/stitch/templates/${name}.html`, body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/\son(\w+)=/gi, ' data-source-on$1='));
  manifest[name] = { source: folder, bodyClass, fonts: [...html.matchAll(/<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"/gi)].map(match => match[1].replaceAll('&amp;', '&')) };
  console.log(`Imported ${name}: original markup and compiled CSS`);
}
await writeFile('src/stitch/manifest.json', JSON.stringify(manifest, null, 2));

