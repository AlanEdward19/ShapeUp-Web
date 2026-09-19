import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getDashboardMe = vi.fn().mockResolvedValue({ sessionsTargetPerWeek: 2, sessionsCompletedThisWeek: 1 });
const getWorkoutPlanById = vi.fn();
const getWorkoutPlansByUser = vi.fn();
const getWorkoutsByUser = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
const getMe = vi.fn().mockResolvedValue({ id: 'user-1' });

let plansResponse: unknown[] = [];

vi.mock('../../../utils/readAllPages', () => ({
  readAllPages: vi.fn(async (fetchPage: (cursor: string | null) => Promise<unknown>) => {
    const page = await fetchPage(null);
    return (page as { items?: unknown[] })?.items ?? page;
  }),
}));

vi.mock('../../../utils/workoutSchedule', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../utils/workoutSchedule')>();
  return { ...actual, getLocalWeekday: () => 1 };
});

vi.mock('../../../hooks/api/useTrainingApi', () => ({
  useTrainingApi: () => ({
    getDashboardMe,
    getWorkoutsByUser,
    getWorkoutPlansByUser,
    getWorkoutPlanById,
  }),
}));

vi.mock('../../../hooks/api/useAuthorizationApi', () => ({
  useAuthorizationApi: () => ({ getMe }),
}));

vi.mock('../../../hooks/api/useNutritionApi', () => ({
  useNutritionApi: () => ({
    getDiaryDay: vi.fn().mockResolvedValue({}),
    getNutritionProfile: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock('../../../hooks/useHydration', () => ({
  default: () => ({ water: 0, addWater: vi.fn() }),
}));

vi.mock('../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Atleta' }),
}));

vi.mock('../operational-dashboard/useDashboardCopy', () => ({
  useDashboardCopy: () => ({ language: 'pt-BR', tr: (text: string) => text }),
}));

vi.mock('../../../components/Workspace/WorkspaceShellPage', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

let lastAthleteState: Record<string, unknown> | null = null;
vi.mock('../operational-dashboard/AthleteDashboardMarkup', () => ({
  AthleteDashboardMarkup: ({ state }: { state: Record<string, unknown> }) => {
    lastAthleteState = state;
    return null;
  },
}));

import { AthleteView } from '../OperationalDashboardsShell';

const scoreboardProps = { rankingEntries: [] };

const planDoc = (id: string, weekdays: number[], exerciseName: string) => ({
  planId: id,
  name: `Plan ${id}`,
  blocks: [{ exercises: [{ exerciseId: id, name: exerciseName, sets: [{ reps: '8', load: '50' }] }] }],
  assignedWeekdays: weekdays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]),
});

describe('AthleteView schedule wiring (WSD-03..WSD-06)', () => {
  beforeEach(() => {
    lastAthleteState = null;
    getDashboardMe.mockClear();
    getWorkoutPlanById.mockClear();
    getWorkoutPlansByUser.mockReset();
    getWorkoutPlansByUser.mockImplementation(() => Promise.resolve({ items: plansResponse, nextCursor: null }));
  });

  it('does not call getDashboardMe(5) before plans resolve', async () => {
    plansResponse = [];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    expect(getDashboardMe).not.toHaveBeenCalledWith(5);
    await waitFor(() => expect(getDashboardMe).not.toHaveBeenCalled());
  });

  it('hides the today card and skips getWorkoutPlanById when no plan matches today', async () => {
    plansResponse = [planDoc('a', [2], 'Terça only')];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(lastAthleteState?.showTodayCard).toBe(false));
    expect(lastAthleteState?.exercises).toEqual([]);
    expect(getWorkoutPlanById).not.toHaveBeenCalled();
  });

  it('aggregates today exercises from two plans scheduled for the mocked weekday', async () => {
    plansResponse = [planDoc('a', [1], 'Agachamento'), planDoc('b', [1], 'Supino')];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(lastAthleteState?.showTodayCard).toBe(true));
    expect((lastAthleteState?.exercises as { name: string }[])?.map(ex => ex.name)).toEqual(['Agachamento', 'Supino']);
  });

  it('calls getDashboardMe with union size when weekdays are set (Mon+Thu and Tue → 3)', async () => {
    plansResponse = [planDoc('a', [1, 4], 'A'), planDoc('b', [2], 'B')];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(getDashboardMe).toHaveBeenCalledWith(3));
    expect(getDashboardMe).not.toHaveBeenCalledWith(5);
  });

  it('calls getDashboardMe with plan count when no weekdays are assigned', async () => {
    plansResponse = [planDoc('a', [], 'A'), planDoc('b', [], 'B')];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(getDashboardMe).toHaveBeenCalledWith(2));
  });

  it('skips getDashboardMe when the user has zero plans', async () => {
    plansResponse = [];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(lastAthleteState).not.toBeNull());
    expect(lastAthleteState?.dashboard).toBeNull();
    expect(getDashboardMe).not.toHaveBeenCalled();
  });

  it('skips getDashboardMe when loading plans fails', async () => {
    getWorkoutPlansByUser.mockRejectedValueOnce(new Error('network'));
    plansResponse = [planDoc('a', [1], 'A')];
    render(
      <MemoryRouter>
        <AthleteView {...scoreboardProps} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(lastAthleteState?.trainingError).toBeTruthy());
    expect(getDashboardMe).not.toHaveBeenCalled();
    expect(getDashboardMe).not.toHaveBeenCalledWith(5);
  });
});
