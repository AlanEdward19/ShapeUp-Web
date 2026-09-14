import React from 'react';
import { JSDOM } from 'jsdom';
import { render } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext.jsx';

import { pathToFileURL } from 'node:url';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const defaultModule = new URL('../../../src/components/gamification/AthleteScoreboard.tsx', import.meta.url);
const moduleUrl = process.argv[2] ? pathToFileURL(process.argv[2]).href : pathToFileURL(defaultModule).href;
const mod = await import(moduleUrl);
const AthleteScoreboard = mod.default;

const storage = { shapeup_language: 'pt-BR' };
globalThis.localStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, value) => {
    storage[key] = value;
  },
  removeItem: (key) => {
    delete storage[key];
  },
};

const { container } = render(
  <LanguageProvider>
    <AthleteScoreboard
      state={{
        gamificationProfile: {
          level: 4,
          totalXp: 1720,
          currentStreak: 3,
          shapeScore: 910,
          shapeCoins: 12,
        },
        rankingEntries: [],
      }}
    />
  </LanguageProvider>,
);

const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" /><style>
body { margin: 0; padding: 24px; background: #1a1210; font-family: system-ui, sans-serif; }
</style></head><body>${container.innerHTML}</body></html>`;

process.stdout.write(html);
