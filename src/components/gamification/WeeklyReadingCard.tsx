import type { ReactElement } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const labels = {
  'pt-BR': {
    title: 'Sua semana',
    days: (n: number) => (n === 1 ? 'dia com treino registrado' : 'dias com treino registrado'),
    trends: 'Tendência de carga',
    up: 'subiu',
    same: 'igual',
    down: 'caiu',
    noPrevious: 'sem semana anterior',
    noTrends: 'Nenhum exercício com carga registrada nesta semana.',
    locked: 'A leitura da semana faz parte do plano Progresso. Sem o plano, ela não é exibida.',
    error: 'Não foi possível carregar a leitura da semana.',
    loading: 'Carregando…',
  },
  en: {
    title: 'Your week',
    days: (n: number) => (n === 1 ? 'day with a logged workout' : 'days with a logged workout'),
    trends: 'Load trend',
    up: 'up',
    same: 'same',
    down: 'down',
    noPrevious: 'no previous week',
    noTrends: 'No exercise with a logged load this week.',
    locked: 'The weekly reading is part of the Progresso plan. Without the plan it is not shown.',
    error: 'Could not load the weekly reading.',
    loading: 'Loading…',
  },
  es: {
    title: 'Tu semana',
    days: (n: number) => (n === 1 ? 'día con entrenamiento registrado' : 'días con entrenamiento registrado'),
    trends: 'Tendencia de carga',
    up: 'subió',
    same: 'igual',
    down: 'bajó',
    noPrevious: 'sin semana anterior',
    noTrends: 'Ningún ejercicio con carga registrada esta semana.',
    locked: 'La lectura de la semana es parte del plan Progresso. Sin el plan no se muestra.',
    error: 'No se pudo cargar la lectura de la semana.',
    loading: 'Cargando…',
  },
} as const;

type LanguageKey = keyof typeof labels;
type Trend = 'up' | 'same' | 'down' | 'noPrevious';

export type WeeklyReading = {
  daysWithWork: number;
  loadTrends: { exerciseId: number; exerciseName: string; currentMaxLoad: number; previousMaxLoad: number | null; trend: Trend }[];
};

export type WeeklyReadingState =
  | { status: 'loading' | 'locked' | 'error' }
  | { status: 'ready'; data: WeeklyReading };

export default function WeeklyReadingCard({ reading }: { reading: WeeklyReadingState }): ReactElement {
  const { language, formatWeight } = useLanguage() as { language: string; formatWeight: (value: number) => string };
  const l = labels[language as LanguageKey] || labels.en;

  return (
    <section data-weekly-reading style={{ borderBottom: '1px solid var(--border-color)', padding: '20px 0', color: 'var(--text-main)' }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{l.title}</h2>
      {reading.status === 'loading' ? <p role="status">{l.loading}</p> : null}
      {reading.status === 'error' ? <p role="alert">{l.error}</p> : null}
      {reading.status === 'locked' ? <p data-weekly-reading-locked>{l.locked}</p> : null}
      {reading.status === 'ready' ? (
        <>
          <p>
            <strong data-weekly-reading-days style={{ fontSize: 28 }}>{reading.data.daysWithWork}</strong>{' '}
            <span>{l.days(reading.data.daysWithWork)}</span>
          </p>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: '16px 0 8px' }}>{l.trends}</h3>
          {reading.data.loadTrends.length === 0 ? (
            <p>{l.noTrends}</p>
          ) : (
            <ul>
              {reading.data.loadTrends.map(item => (
                <li key={item.exerciseId} data-trend={item.trend}>
                  {item.exerciseName}: {formatWeight(item.currentMaxLoad)} ({l[item.trend]})
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  );
}
