import type { ReactElement } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const labels = {
  'pt-BR': ['Seu progresso', 'Nível', 'para o próximo nível', 'Sequência de treinos', 'Placar', 'Você', 'Atleta', 'Carregar mais', 'Ainda não há posições no placar.', 'Não foi possível carregar o progresso.', 'Tentar novamente', 'Carregando…'],
  en: ['Your progress', 'Level', 'to the next level', 'Workout streak', 'Leaderboard', 'You', 'Athlete', 'Load more', 'No leaderboard entries yet.', 'Could not load progress.', 'Try again', 'Loading…'],
  es: ['Tu progreso', 'Nivel', 'para el próximo nivel', 'Racha de entrenamientos', 'Clasificación', 'Tú', 'Atleta', 'Cargar más', 'Aún no hay posiciones en la clasificación.', 'No se pudo cargar el progreso.', 'Reintentar', 'Cargando…'],
} as const;

type LanguageKey = keyof typeof labels;

export type GamificationProfile = {
  level: number;
  totalXp: number;
  currentStreak: number;
  shapeScore: number;
  shapeCoins: number;
};

export type RankingEntry = {
  userId: number | string;
  level: number;
  shapeScore: number;
};

export type AthleteScoreboardState = {
  gamificationProfile?: GamificationProfile | null;
  gamificationError?: boolean;
  reloadGamification?: () => void;
  rankingEntries: RankingEntry[];
  rankingError?: boolean;
  rankingLoading?: boolean;
  rankingCursor?: string | null;
  rankingLoadingMore?: boolean;
  fetchRanking?: (cursor?: string | null, loadMore?: boolean) => void;
};

type AthleteScoreboardProps = {
  state: AthleteScoreboardState;
};

export default function AthleteScoreboard({ state }: AthleteScoreboardProps): ReactElement {
  const { language } = useLanguage();
  const user = useUserProfile() as { id?: number | string; name: string };
  const l = labels[(language as LanguageKey)] || labels.en;
  const p = state.gamificationProfile;
  const number = (value: number) => Number(value).toLocaleString(language);
  return (
    <section data-athlete-scoreboard style={{ borderBottom: '1px solid #3a2d27', padding: '20px 0', color: '#f3eae5' }}>
      <style>{`[data-athlete-scoreboard] progress{appearance:none;border:0;background:#3a2d27;border-radius:2px;overflow:hidden}[data-athlete-scoreboard] progress::-webkit-progress-bar{background:#3a2d27}[data-athlete-scoreboard] progress::-webkit-progress-value{background:#e06c43}[data-athlete-scoreboard] progress::-moz-progress-bar{background:#e06c43}`}</style>
      <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{l[0]}</h2>
      {state.gamificationError ? (
        <p role="alert">
          {l[9]} <button type="button" onClick={state.reloadGamification}>{l[10]}</button>
        </p>
      ) : !p ? (
        <p role="status">{l[11]}</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 28, fontWeight: 600 }}>{l[1]} {p.level}</strong>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{number(p.totalXp)} XP</span>
          </div>
          <progress aria-label={l[0]} max={500} value={p.totalXp % 500} style={{ display: 'block', width: '100%', height: 6, accentColor: '#e06c43', margin: '12px 0' }} />
          <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between', flexWrap: 'wrap', fontSize: 12, color: '#b8aaa2' }}>
            <span>{number(500 - (p.totalXp % 500))} XP {l[2]}</span>
            <span>{l[3]}: {p.currentStreak}</span>
            <span>ShapeScore: {number(p.shapeScore)}</span>
            <span>ShapeCoins: {number(p.shapeCoins)}</span>
          </div>
        </>
      )}
      <details style={{ marginTop: 20, borderTop: '1px solid #3a2d27', paddingTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>{l[4]}</summary>
        {state.rankingError && (
          <p role="alert">
            {l[9]} <button type="button" onClick={() => state.fetchRanking?.()}>{l[10]}</button>
          </p>
        )}
        {state.rankingLoading ? (
          <p>{l[11]}</p>
        ) : !state.rankingEntries.length ? (
          <p style={{ padding: '12px 0', fontSize: 12 }}>{l[8]}</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: '8px 0' }}>
            {state.rankingEntries.map((entry, index) => (
              <li
                key={String(entry.userId)}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'baseline',
                  padding: '12px 0',
                  borderBottom: '1px solid #3a2d27',
                  fontSize: 13,
                  color: String(entry.userId) === String(user.id) ? '#e06c43' : '#f3eae5',
                }}
              >
                <span style={{ width: 28, fontVariantNumeric: 'tabular-nums' }}>{index + 1}</span>
                <span style={{ flex: 1 }}>
                  {String(entry.userId) === String(user.id) ? `${user.name} · ${l[5]}` : `${l[6]} #${entry.userId}`}
                </span>
                <span>{l[1]} {entry.level}</span>
                <strong>{number(entry.shapeScore)}</strong>
              </li>
            ))}
          </ol>
        )}
        {state.rankingCursor && (
          <button
            type="button"
            disabled={state.rankingLoadingMore}
            onClick={() => state.fetchRanking?.(state.rankingCursor, true)}
            style={{ fontSize: 12, padding: '8px 0', color: '#e06c43' }}
          >
            {state.rankingLoadingMore ? l[11] : l[7]}
          </button>
        )}
      </details>
    </section>
  );
}
