import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const buttonCss = readFileSync(join(root, 'src/components/Button.css'), 'utf8')
const designCss = readFileSync(join(root, 'src/styles/design-system.css'), 'utf8')
const shellCss = readFileSync(join(root, 'src/styles/higShellPolish.css'), 'utf8')
const navCss = readFileSync(join(root, 'src/components/Workspace/WorkspaceNavigation.tsx'), 'utf8')

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

describe('HIG polish contract', () => {
  it('sizes the filled button like the mobile primary control', () => {
    expect(buttonCss).toMatch(/\.su-btn-primary\s*\{[^}]*min-height:\s*var\(--button-min-height\)/)
    expect(buttonCss).toMatch(/border-radius:\s*var\(--radius-button\)/)
    expect(designCss).toMatch(/--button-min-height:\s*3\.25rem/)
    expect(designCss).toMatch(/--radius-button:\s*0\.875rem/)
  })

  it('uses sentence case for page titles', () => {
    expect(designCss).toMatch(/\.su-page-title[\s\S]*text-transform:\s*none/)
  })

  it('selects navigation with an oxide fill at a 44px target', () => {
    expect(navCss).toMatch(/min-height:44px/)
    expect(navCss).toMatch(/a\[aria-current=page\]\{background:var\(--primary\);color:var\(--text-on-primary\)/)
  })

  it('keeps shell focus, alerts, and readable muted ink', () => {
    expect(shellCss).toMatch(/:focus-visible/)
    expect(shellCss).toMatch(/p\[role='alert'\]/)
    expect(shellCss).toContain('#d0c4bb')
    expect(contrastRatio('#181311', '#e06c43')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#d0c4bb', '#18120f')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#f5ede6', '#3b221f')).toBeGreaterThanOrEqual(4.5)
  })
})
