import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { withLang } from '../../../../test/withLang';
import { NutritionDiaryView } from '../NutritionDiaryShell';

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
  useNutritionApi: () => ({
    getDiaryDay: vi.fn().mockResolvedValue({ meals: [], totals: {} }),
    getHydrationDay: vi.fn().mockResolvedValue({ totalMl: 0 }),
    putHydrationDay: vi.fn().mockResolvedValue({}),
  }),
}));

let mockLinked = false;

vi.mock('../../../../hooks/useNutritionist', () => ({
  default: () => ({ linked: mockLinked, loading: false }),
}));

vi.mock('../../../../hooks/api/useFastingApi', () => ({
  useFastingApi: () => ({ getClock: vi.fn().mockResolvedValue({ clock: {} }) }),
}));

const baseState = {
  date: '2026-09-10',
  setDate: vi.fn(),
  goal: null,
  loading: false,
  loadError: null,
  loadData: vi.fn(),
  diary: { date: '2026-09-10', meals: [], totals: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 } },
  totals: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  meals: [],
  handleRemove: vi.fn(),
};

const renderView = (overrides = {}) =>
  render(
    withLang(
      <MemoryRouter>
        <NutritionDiaryView {...baseState} {...overrides} />
      </MemoryRouter>,
    ),
  );

describe('NutritionDiaryShell', () => {
  it('shows table skeleton while diary data is loading', () => {
    const { getByTestId } = renderView({ loading: true, diary: null, meals: [] });
    expect(getByTestId('skeleton')).toHaveAttribute('data-variant', 'table');
  });

  it('shows error and retry when diary load fails', () => {
    const loadData = vi.fn();
    const { getByTestId } = renderView({
      loadError: 'API offline',
      loading: false,
      diary: null,
      meals: [],
      loadData,
    });
    expect(getByTestId('diary-shell-load-error')).toBeInTheDocument();
    fireEvent.click(getByTestId('diary-shell-retry-btn'));
    expect(loadData).toHaveBeenCalled();
  });

  it('shows the water goal percentage and the decrease button', async () => {
    const { findByText, getByLabelText } = renderView({ goal: { kcal: 2000, waterMl: 2500 } });
    expect(await findByText(/0% da meta/)).toBeInTheDocument();
    expect(getByLabelText('Remover 250 ml de água')).toBeDisabled();
  });

  it('prompts to set a water goal when there is none', async () => {
    const { findByText } = renderView({ goal: { kcal: 2000 } });
    expect(await findByText(/Sem meta definida/)).toBeInTheDocument();
  });

  it('offers shortcuts to the meal plan, foods and fasting instead of tabs', async () => {
    const { getByRole, findByRole } = renderView({ goal: { kcal: 2000 } });
    expect(getByRole('button', { name: /cardápio|meal plan/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /alimentos|foods/i })).toBeInTheDocument();
    expect(await findByRole('button', { name: /jejum|fasting/i })).toBeInTheDocument();
  });

  it('shows an optional, dismissible goal prompt when there is no goal', () => {
    localStorage.removeItem('shapeup_goal_prompt_dismissed_current');
    const { getByTestId, queryByTestId, getByText } = renderView({ goal: null });
    expect(getByTestId('goal-prompt')).toBeInTheDocument();
    fireEvent.click(getByText(/agora não|not now/i));
    expect(queryByTestId('goal-prompt')).not.toBeInTheDocument();
  });

  it('opens the goal sheet from the goal button', () => {
    const { getByTestId, queryByTestId } = renderView({ goal: { kcal: 2000 } });
    expect(queryByTestId('goal-sheet')).not.toBeInTheDocument();
    fireEvent.click(getByTestId('diary-goal-btn'));
    expect(getByTestId('goal-sheet')).toBeInTheDocument();
    expect(getByTestId('manual-kcal-input')).toHaveValue(2000);
  });

  it('keeps the goal read-only and hides the prompt when a nutritionist is linked', () => {
    mockLinked = true;
    try {
      const { getByTestId, queryByTestId } = renderView({ goal: null });
      expect(queryByTestId('goal-prompt')).not.toBeInTheDocument();
      fireEvent.click(getByTestId('diary-goal-btn'));
      expect(getByTestId('goal-locked')).toBeInTheDocument();
      expect(queryByTestId('manual-submit-btn')).not.toBeInTheDocument();
    } finally {
      mockLinked = false;
    }
  });
});
