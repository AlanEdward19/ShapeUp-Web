import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../../test/withLang';
import { AthleteDashboardMarkup, type AthleteDashboardState } from '../AthleteDashboardMarkup';

vi.mock('../../../../components/gamification/AthleteScoreboard', () => ({
  default: () => null,
}));

vi.mock('../../../../components/charts/HistoryChart', () => ({
  default: () => null,
}));

const baseState: AthleteDashboardState = {
  userName: 'Atleta',
  plan: { name: 'Plano A' },
  showTodayCard: false,
  exercises: [],
  chartData: [],
  trainingError: '',
  dashboard: null,
  nutrition: {},
  water: 0,
  onAddWater: vi.fn(),
  onRemoveWater: vi.fn(),
  messages: [],
  language: 'pt-BR',
  tr: (text: string) => text,
  onNavigate: vi.fn(),
  rankingEntries: [],
};

describe('AthleteDashboardMarkup today card (WSD-03)', () => {
  it('does not render the today card when showTodayCard is false', () => {
    render(withLang(<AthleteDashboardMarkup state={baseState} />));
    expect(screen.queryByText('Exercícios de hoje')).not.toBeInTheDocument();
    expect(screen.queryByTestId('today-workout-card')).not.toBeInTheDocument();
  });

  it('lists aggregated exercises from two plans when showTodayCard is true', () => {
    render(withLang(
      <AthleteDashboardMarkup
        state={{
          ...baseState,
          showTodayCard: true,
          exercises: [
            { id: 'a', name: 'Agachamento' },
            { id: 'b', name: 'Supino' },
          ],
        }}
      />,
    ));
    expect(screen.getByTestId('today-workout-card')).toBeInTheDocument();
    expect(screen.getByText('Agachamento')).toBeInTheDocument();
    expect(screen.getByText('Supino')).toBeInTheDocument();
    expect(within(screen.getByTestId('today-workout-card')).getByText('2 exercícios')).toBeInTheDocument();
  });
});

describe('AthleteDashboardMarkup Frequência empty state (WSD-06)', () => {
  it('keeps data-tour anchors for empty dashboard sections', () => {
    const { container } = render(withLang(<AthleteDashboardMarkup state={baseState} />));
    expect(container.querySelector('[data-tour="client-header"]')).toBeTruthy();
    expect(container.querySelector('[data-tour="client-metrics"]')).toBeTruthy();
    expect(container.querySelector('[data-tour="client-chart"]')).toBeTruthy();
  });

  it('renders weekday initials including Wednesday instead of a rest dash', () => {
    const { container } = render(withLang(<AthleteDashboardMarkup state={baseState} />));
    const pills = container.querySelectorAll('[data-tour="client-metrics"] [data-workout-completed]');
    expect(pills).toHaveLength(7);
    expect([...pills].map(pill => pill.querySelector('.ah-day-letter')?.textContent)).toEqual(['S', 'T', 'Q', 'Q', 'S', 'S', 'D']);
  });

  it('shows em-dash for the workouts ring and the week summary when dashboard is null', () => {
    const { container } = render(withLang(<AthleteDashboardMarkup state={baseState} />));
    const workouts = screen.getByText('Treinos').closest('div') as HTMLElement;
    expect(within(workouts).getByText('—')).toBeInTheDocument();
    expect(container.querySelector('.ah-week .ah-card-sub')).toHaveTextContent('—');
  });

  it('offers the rest-day state instead of the start CTA when nothing is scheduled', () => {
    render(withLang(<AthleteDashboardMarkup state={baseState} />));
    expect(screen.getByText('Hoje é dia de descanso')).toBeInTheDocument();
    expect(screen.queryByText('Começar treino')).not.toBeInTheDocument();
  });
});
