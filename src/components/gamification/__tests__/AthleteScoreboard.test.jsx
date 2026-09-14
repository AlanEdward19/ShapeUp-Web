import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import AthleteScoreboard from '../AthleteScoreboard';

vi.mock('../../../contexts/UserProfileContext', () => ({ useUserProfile: () => ({ id: 42, name: 'Nome real' }) }));

it('shows server level, XP and score, identifies the user and paginates ranking', () => {
  localStorage.setItem('shapeup_language', 'pt-BR');
  const fetchRanking = vi.fn();
  render(
    <LanguageProvider>
      <AthleteScoreboard
        state={{
          gamificationProfile: { level: 4, totalXp: 1720, currentStreak: 3, shapeScore: 910, shapeCoins: 12 },
          rankingEntries: [{ userId: 42, level: 4, shapeScore: 910 }],
          rankingCursor: 'next-page',
          fetchRanking,
        }}
      />
    </LanguageProvider>,
  );
  expect(screen.getByText('Nível 4', { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '220');
  expect(screen.getByText('280 XP para o próximo nível')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Placar'));
  expect(screen.getByText('Nome real · Você')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
  expect(fetchRanking).toHaveBeenCalledWith('next-page', true);
});

it('does not replace a backend failure with level one or zero XP', () => {
  render(
    <LanguageProvider>
      <AthleteScoreboard state={{ gamificationError: true, rankingEntries: [] }} />
    </LanguageProvider>,
  );
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
