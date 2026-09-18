import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { withLang } from '../../../../test/withLang';
import { NutritionDiaryView } from '../NutritionDiaryShell';

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
  useNutritionApi: () => ({ getDiaryDay: vi.fn().mockResolvedValue({ meals: [], totals: {} }) }),
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
});
