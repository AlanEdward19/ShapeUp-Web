import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DashboardClient from '../DashboardClient';

const setIsOpen = vi.fn();
const setSteps = vi.fn();
const setCurrentStep = vi.fn();

vi.mock('@reactour/tour', () => ({
  useTour: () => ({ setIsOpen, setSteps, setCurrentStep }),
}));

vi.mock('../../../hooks/useExercises', () => ({
  useExercises: () => ({ exercises: [] }),
}));

vi.mock('../../../hooks/api/useGamificationApi', () => ({
  useGamificationApi: () => ({
    getGamificationProfile: vi.fn().mockResolvedValue(null),
    getRanking: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  }),
}));

vi.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: key => key,
    convertWeight: v => v,
    formatWeight: v => v,
  }),
}));

describe('DashboardClient legacy tour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does not open the tour when renderView is provided', async () => {
    render(
      <DashboardClient renderView={() => <div data-testid="view">view</div>} />,
    );
    await waitFor(() => {
      expect(setIsOpen).not.toHaveBeenCalled();
      expect(setSteps).not.toHaveBeenCalled();
    });
  });
});
