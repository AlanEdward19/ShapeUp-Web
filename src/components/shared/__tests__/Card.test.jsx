import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Card from '../../Card.jsx'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Hello ShapeUp</Card>)

    expect(screen.getByText('Hello ShapeUp')).toBeInTheDocument()
  })
})
