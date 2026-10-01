import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { withLang } from '../../../test/withLang';
import WeeklyReadingCard from '../WeeklyReadingCard';

beforeEach(() => localStorage.setItem('shapeup_language', 'pt-BR'));

describe('WeeklyReadingCard', () => {
  it('shows the days with logged work and the load trend', () => {
    render(withLang(<WeeklyReadingCard reading={{
      status: 'ready',
      data: {
        daysWithWork: 3,
        loadTrends: [
          { exerciseId: 1, exerciseName: 'Supino', currentMaxLoad: 85, previousMaxLoad: 80, trend: 'up' },
          { exerciseId: 2, exerciseName: 'Remada', currentMaxLoad: 60, previousMaxLoad: null, trend: 'noPrevious' },
        ],
      },
    }} />));
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/Supino: 85 kg \(subiu\)/)).toBeInTheDocument();
    expect(screen.getByText(/Remada: 60 kg \(sem semana anterior\)/)).toBeInTheDocument();
  });

  it('without the plan explains it and shows no number or chart', () => {
    const { container } = render(withLang(<WeeklyReadingCard reading={{ status: 'locked' }} />));
    expect(screen.getByText(/faz parte do plano Progresso/)).toBeInTheDocument();
    expect(container.querySelector('[data-weekly-reading-days]')).toBeNull();
    expect(container.querySelector('li')).toBeNull();
  });

  it('shows an error without inventing numbers', () => {
    const { container } = render(withLang(<WeeklyReadingCard reading={{ status: 'error' }} />));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(container.querySelector('[data-weekly-reading-days]')).toBeNull();
  });
});
