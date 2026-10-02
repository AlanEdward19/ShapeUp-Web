import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import HydrationMetric from '../HydrationMetric';

const mockAdd = vi.fn();
const mockRemove = vi.fn();
let mockWater = 1000;

vi.mock('../../hooks/useHydration', async (importOriginal) => ({
  ...(await importOriginal()),
  default: () => ({ water: mockWater, addWater: mockAdd, removeWater: mockRemove }),
}));

const renderMetric = (props) => render(<MemoryRouter><HydrationMetric date="2026-10-02" {...props} /></MemoryRouter>);

describe('HydrationMetric', () => {
  it('shows the percentage of the water goal', () => {
    mockWater = 1000;
    renderMetric({ goalMl: 2500 });
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByLabelText('Progresso da meta de água')).toHaveAttribute('value', '40');
  });

  it('shows "Sem meta definida" with a link to set the goal', () => {
    mockWater = 500;
    renderMetric({});
    expect(screen.getByText(/Sem meta definida/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'definir meta' })).toHaveAttribute('href', '/dashboard/nutrition/goal');
  });

  it('adds and removes 250 ml, and disables removing at zero', () => {
    mockWater = 500;
    renderMetric({ goalMl: 2500 });
    fireEvent.click(screen.getByLabelText('Registrar 250 ml de água'));
    fireEvent.click(screen.getByLabelText('Remover 250 ml de água'));
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('disables the decrease button when empty', () => {
    mockWater = 0;
    renderMetric({ goalMl: 2500 });
    expect(screen.getByLabelText('Remover 250 ml de água')).toBeDisabled();
  });
});
