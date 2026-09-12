import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { ThemeProvider } from '../../ThemeContext'
import LandingPage from '../LandingPage'

function renderLanding() {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </LanguageProvider>
    </ThemeProvider>,
  )
}

describe('LandingPage', () => {
  it('localizes the monthly price suffix', () => {
    localStorage.setItem('shapeup_language', 'en')
    renderLanding()
    expect(screen.getAllByText('/mo').length).toBeGreaterThan(0)
    expect(screen.queryByText('/mês')).not.toBeInTheDocument()
  })

  it('lets visitors build a demo session and choose the matching registration profile', () => {
    renderLanding()
    const insert = screen.getAllByRole('button', { name: /inserir no treino/i })[0]
    fireEvent.click(insert)
    expect(insert).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('1 exercício no treino de exemplo')
    fireEvent.click(insert)
    expect(insert).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('link', { name: /testar 14 dias grátis/i })).toHaveAttribute('href', '/register?role=professional')
    expect(screen.getByRole('link', { name: /começar assinatura/i })).toHaveAttribute('href', '/register?role=independent')
    expect(screen.getByRole('link', { name: /privacidade/i })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: /termos/i })).toHaveAttribute('href', '/terms')
  })
})
