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
  messages: [],
  language: 'pt-BR',
  tr: (text: string) => text,
  onNavigate: vi.fn(),
  rankingEntries: [],
};

describe('AthleteDashboardMarkup today card (WSD-03)', () => {
  it('does not render the today card when showTodayCard is false', () => {
    render(withLang(<AthleteDashboardMarkup state={baseState} />));
    expect(screen.queryByText('Exercícios Prescritos para Hoje')).not.toBeInTheDocument();
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
    expect(screen.getByText('2 exercícios')).toBeInTheDocument();
  });
});

describe('AthleteDashboardMarkup Frequência empty state (WSD-06)', () => {
  it('keeps data-tour anchors for empty dashboard sections', () => {
    const { container } = render(withLang(<AthleteDashboardMarkup state={baseState} />));
    expect(container.querySelector('[data-tour="client-header"]')).toBeTruthy();
    expect(container.querySelector('[data-tour="client-metrics"]')).toBeTruthy();
    expect(container.querySelector('[data-tour="client-chart"]')).toBeTruthy();
  });

  it('shows em-dash for alvo and taxa when dashboard is null', () => {
    render(withLang(<AthleteDashboardMarkup state={baseState} />));
    const headerRow = screen.getByText('Frequência').parentElement!;
    expect(within(headerRow).getByText('—')).toBeInTheDocument();
    const freqColumn = screen.getByText('Frequência').closest('div.py-2') as HTMLElement;
    const rateEl = freqColumn.querySelector('.mb-2 .font-headline') as HTMLElement;
    expect(rateEl).toHaveTextContent('—');
  });
});
