import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const css = readFileSync(join(root, 'src/styles/design-system.css'), 'utf8')
const exercisesCss = readFileSync(
  join(root, 'src/pages/shell-assets/styles/exercises.css'),
  'utf8',
)

function blockFor(selector) {
  const re = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`)
  const match = css.match(re)
  expect(match, `missing CSS block for ${selector}`).toBeTruthy()
  return match[1]
}

function tokenValue(block, name) {
  const match = block.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*([^;]+);`))
  expect(match, `missing token ${name}`).toBeTruthy()
  return match[1].trim()
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function relativeLuminance(hex) {
  const h = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => {
    const c = Number.parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(a, b) {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const EXISTING_TOKEN_NAMES = [
  '--primary',
  '--primary-hover',
  '--accent',
  '--text-on-primary',
  '--bg-main',
  '--bg-card',
  '--bg-input',
  '--text-main',
  '--text-muted',
  '--border-color',
  '--border-input',
  '--border-input-focus',
  '--success',
  '--warning',
  '--error',
  '--shadow-soft',
  '--shadow-md',
]

const DARK_DESIGN_VALUES = {
  '--primary': '#e06c43',
  '--primary-hover': '#e87a53',
  '--accent': '#7d9b68',
  '--text-on-primary': '#181311',
  '--bg-main': '#18120f',
  '--bg-card': '#211a17',
  '--bg-input': '#1c1614',
  '--text-main': '#f5ede6',
  '--text-muted': '#a89990',
  '--border-color': '#3b322e',
  '--border-input': '#3b322e',
  '--border-input-focus': '#e06c43',
  '--success': '#7d9b68',
  '--warning': '#d4a359',
  '--error': '#e5534a',
  '--bg-surface-lowest': '#130d0a',
  '--bg-surface-high': '#302825',
  '--bg-surface-highest': '#3b3330',
  '--outline': '#a58b83',
  '--secondary-container': '#334e23',
  '--tertiary-container': '#b68941',
  '--radius-md-lg': '0.875rem',
  '--radius-inner': '0.5rem',
  '--radius-full': '9999px',
  '--space-xs': '0.25rem',
  '--space-sm': '0.5rem',
  '--space-md': '1rem',
  '--space-lg': '1.5rem',
  '--space-xl': '2.5rem',
}

const LIGHT_DESIGN_VALUES = {
  '--primary': '#e06c43',
  '--primary-hover': '#c85a35',
  '--accent': '#5a7a48',
  '--text-on-primary': '#181311',
  '--bg-main': '#f7efe9',
  '--bg-card': '#fdfaf7',
  '--bg-input': '#ffffff',
  '--text-main': '#241811',
  '--text-muted': '#75655c',
  '--border-color': '#e6d8cd',
  '--border-input': '#cdb9ac',
  '--border-input-focus': '#e06c43',
  '--success': '#4b6b39',
  '--warning': '#8a5f1f',
  '--error': '#b3261e',
}

describe('design-system Warm Oxide token contract', () => {
  const light = blockFor(':root')
  const dark = blockFor("[data-theme='dark']")

  it('preserves existing token names in both theme blocks', () => {
    for (const name of EXISTING_TOKEN_NAMES) {
      expect(css).toMatch(new RegExp(`${name}:`))
      expect(light).toMatch(new RegExp(`${name}:`))
    }
  })

  it('sets dark --primary to the Warm Oxide brand hex', () => {
    expect(tokenValue(dark, '--primary')).toBe('#e06c43')
  })

  it('aligns at least three dark color tokens with shell-assets exercises hex', () => {
    expect(exercisesCss).toContain('rgb(224 108 67')
    expect(exercisesCss).toContain('rgb(33 26 23')
    expect(exercisesCss).toContain('rgb(212 163 89')
    expect(tokenValue(dark, '--primary')).toBe(rgbToHex(224, 108, 67))
    expect(tokenValue(dark, '--bg-card')).toBe(rgbToHex(33, 26, 23))
    expect(tokenValue(dark, '--warning')).toBe(rgbToHex(212, 163, 89))
  })

  it('matches the Design dark token table including additive tokens', () => {
    for (const [name, value] of Object.entries(DARK_DESIGN_VALUES)) {
      expect(tokenValue(dark, name)).toBe(value)
    }
    expect(tokenValue(dark, '--shadow-soft')).toContain('oklch(')
    expect(tokenValue(dark, '--shadow-md')).toContain('oklch(')
  })

  it('matches the Design light token table in the same hue family', () => {
    for (const [name, value] of Object.entries(LIGHT_DESIGN_VALUES)) {
      expect(tokenValue(light, name)).toBe(value)
    }
    expect(tokenValue(light, '--primary')).toBe(tokenValue(dark, '--primary'))
  })

  it('declares --link-color and uses it on anchors, with light contrast for body text', () => {
    expect(tokenValue(light, '--link-color')).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokenValue(dark, '--link-color')).toBeTruthy()
    expect(css).toMatch(/a\s*\{[\s\S]*color:\s*var\(--link-color\)/)
    const lightLink = tokenValue(light, '--link-color')
    const lightBg = tokenValue(light, '--bg-main')
    expect(contrastRatio(lightLink, lightBg)).toBeGreaterThanOrEqual(4.5)
  })
})
