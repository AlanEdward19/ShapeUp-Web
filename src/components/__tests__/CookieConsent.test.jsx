import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import CookieConsent from '../CookieConsent'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { CONSENT_KEY } from '../../utils/cookieConsent'

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.removeItem(CONSENT_KEY)
  })

  it('stores essential consent and hides', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <CookieConsent />
        </MemoryRouter>
      </LanguageProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /essencial|essential|solo lo esencial/i }))
    expect(localStorage.getItem(CONSENT_KEY)).toBe('essential')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
