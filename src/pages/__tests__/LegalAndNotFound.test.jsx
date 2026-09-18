import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { ThemeProvider } from '../../ThemeContext'
import LegalDocument from '../LegalDocument'
import NotFound from '../NotFound'

const legalCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../LegalDocument.css'),
  'utf8',
)

describe('legal and 404', () => {
  it('renders privacy policy heading', () => {
    const { container } = render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter>
            <LegalDocument kind="privacy" />
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/privacidade|privacy/i)
    const legalRoot = container.querySelector('.su-legal')
    expect(legalRoot).toBeTruthy()
    expect(getComputedStyle(legalRoot).transform).toBe('none')
    expect(legalCss).toMatch(/\.su-legal-article p[\s\S]*font-size:\s*1rem/)
  })

  it('renders terms without scaled-down legal typography', () => {
    const { container } = render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter>
            <LegalDocument kind="terms" />
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    )
    expect(getComputedStyle(container.querySelector('.su-legal')).transform).toBe('none')
  })

  it('renders a home link on 404', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </LanguageProvider>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })
})
