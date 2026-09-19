import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const featureDir = join(root, '.specs/features/design-system-retheme')

const PUBLIC_ROUTE_PNGS = [
  'before-landing-1440.png',
  'before-landing-390.png',
  'after-landing-1440.png',
  'after-landing-390.png',
  'before-login-1440.png',
  'before-login-390.png',
  'after-login-1440.png',
  'after-login-390.png',
]

const RETIRED_DARK_HEX = [
  /#171311/i,
  /#1b1613/i,
  /#f3eae5/i,
  /#b8aaa2/i,
  /#3a2d27/i,
  /#493930/i,
  /#ed805a/i,
  /#9bb888/i,
  /#21130d/i,
  /#ed827a/i,
]

/** Authenticated routes: browser screenshots blocked without session (see tasks T2/T5–T7). */
const AUTH_BLOCKED_CONSUMERS = [
  {
    screen: 'sidebar',
    path: 'src/components/Workspace/WorkspaceNavigation.tsx',
    tokenSignals: ['var(--bg-main)', 'var(--border-color)', 'var(--text-main)'],
  },
  {
    screen: 'dashboard',
    path: 'src/pages/Dashboard/operational-dashboard/AthleteDashboardMarkup.tsx',
    tokenSignals: ['var(--'],
  },
  {
    screen: 'nutrition',
    path: 'src/pages/Dashboard/Nutrition/NutritionDiaryShell.tsx',
    tokenSignals: ['var(--'],
  },
  {
    screen: 'settings',
    path: 'src/pages/Dashboard/markup/SettingsPublicMarkup.tsx',
    tokenSignals: ['var(--text-main)', 'var(--border-color)'],
  },
]

function fileHasRetiredHex(text) {
  return RETIRED_DARK_HEX.some((pattern) => pattern.test(text))
}

describe('DSRT-03 visual gate evidence', () => {
  it('keeps before/after PNGs for public auth surfaces (1440 and 390)', () => {
    for (const name of PUBLIC_ROUTE_PNGS) {
      expect(existsSync(join(featureDir, name)), `missing ${name}`).toBe(true)
    }
  })

  it('uses token hygiene on auth-blocked screens when PNG capture is not available', () => {
    for (const { screen, path, tokenSignals } of AUTH_BLOCKED_CONSUMERS) {
      const abs = join(root, path)
      expect(existsSync(abs), `${screen} consumer missing`).toBe(true)
      const text = readFileSync(abs, 'utf8')
      for (const signal of tokenSignals) {
        expect(text, `${screen}: expected ${signal}`).toContain(signal)
      }
      expect(fileHasRetiredHex(text), `${screen} still has retired palette hex`).toBe(false)
    }
  })
})
