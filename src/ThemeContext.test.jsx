import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme()
  return (
    <>
      <span data-testid="theme-label">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
    </>
  )
}

describe('ThemeContext (DSRT-02 AC3)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('mirrors theme state to documentElement data-theme when toggling', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByTestId('theme-label')).toHaveTextContent('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getByTestId('theme-label')).toHaveTextContent('light')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
