import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { ThemeProvider } from '../../ThemeContext'
import LegalDocument from '../LegalDocument'
import NotFound from '../NotFound'

describe('legal and 404', () => {
  it('renders privacy policy heading', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter>
            <LegalDocument kind="privacy" />
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/privacidade|privacy/i)
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
