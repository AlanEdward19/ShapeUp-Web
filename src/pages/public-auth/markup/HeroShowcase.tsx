import type { ReactElement } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import ActivityRings from '../../Dashboard/operational-dashboard/athlete/ActivityRings';
import VolumeChart from '../../Dashboard/operational-dashboard/athlete/VolumeChart';

const copy = {
  'pt-BR': { today: 'Treino de hoje', plan: 'Hipertrofia — Upper A', meta: '4 exercícios · Semana 3', start: 'Começar treino', summary: 'Resumo da semana', workouts: 'Treinos', calories: 'Calorias', water: 'Água', week: 'Sua semana', weekMeta: '3 de 4 treinos', volume: 'Evolução de volume', chips: ['Peitoral', 'Dorsais', 'Ombros'], empty: '' },
  en: { today: "Today's workout", plan: 'Hypertrophy — Upper A', meta: '4 exercises · Week 3', start: 'Start workout', summary: 'Week summary', workouts: 'Workouts', calories: 'Calories', water: 'Water', week: 'Your week', weekMeta: '3 of 4 workouts', volume: 'Volume trend', chips: ['Chest', 'Back', 'Shoulders'], empty: '' },
  es: { today: 'Entrenamiento de hoy', plan: 'Hipertrofia — Upper A', meta: '4 ejercicios · Semana 3', start: 'Empezar entrenamiento', summary: 'Resumen de la semana', workouts: 'Entrenos', calories: 'Calorías', water: 'Agua', week: 'Tu semana', weekMeta: '3 de 4 entrenos', volume: 'Evolución de volumen', chips: ['Pecho', 'Espalda', 'Hombros'], empty: '' },
} as const;

const volumes = [3200, 3650, 3400, 4100, 3900, 4600, 4350, 5100];
const doneDays = [true, true, false, true, false, false, false];

/** Static, non-interactive preview of the athlete home, reusing its real building blocks. */
export function HeroShowcase(): ReactElement {
  const { language } = useLanguage() as { language: string };
  const c = copy[(language as keyof typeof copy) in copy ? (language as keyof typeof copy) : 'pt-BR'];
  const now = Date.now();
  const data = volumes.map((volume, index) => ({
    session: index + 1,
    volume,
    date: '',
    startedAt: new Date(now - (volumes.length - index) * 3 * 86400000).toISOString(),
  }));
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = doneDays.map((done, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return { done, letter: day.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase(), number: day.getDate(), today: day.toDateString() === new Date().toDateString() };
  });

  return (
    <div className="ah hs" role="img" aria-label={c.today}>
      <div className="ah-grid" aria-hidden="true">
        <section className="ah-hero">
          <p className="ah-eyebrow">{c.today}</p>
          <h2>{c.plan}</h2>
          <p className="ah-hero-meta">{c.meta}</p>
          <ul className="ah-chips">{c.chips.map(chip => <li key={chip}>{chip}</li>)}</ul>
          <span className="ah-hero-cta">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            {c.start}
          </span>
        </section>

        <section className="ah-card ah-summary">
          <h3 className="ah-card-title">{c.summary}</h3>
          <div className="ah-summary-body">
            <ActivityRings
              summary=""
              rings={[
                { label: c.workouts, pct: 75, color: 'var(--primary)' },
                { label: c.calories, pct: 72, color: 'var(--accent)' },
                { label: c.water, pct: 42, color: 'var(--warning)' },
              ]}
            />
            <dl className="ah-legend">
              <div style={{ ['--dot' as string]: 'var(--primary)' }}><dt>{c.workouts}</dt><dd>3/4</dd></div>
              <div style={{ ['--dot' as string]: 'var(--accent)' }}><dt>{c.calories}</dt><dd>1.720/2.400</dd></div>
              <div style={{ ['--dot' as string]: 'var(--warning)' }}><dt>{c.water}</dt><dd>1,25/3 L</dd></div>
            </dl>
          </div>
        </section>

        <section className="ah-card ah-week">
          <div className="ah-card-head">
            <h3 className="ah-card-title">{c.week}</h3>
            <p className="ah-card-sub">{c.weekMeta}</p>
          </div>
          <ol className="ah-days">
            {days.map(day => (
              <li key={day.number} className="ah-day" data-workout-completed={day.done} data-today={day.today || undefined}>
                <span className="ah-day-letter">{day.letter}</span>
                {day.done ? <span className="material-symbols-outlined">check</span> : <i>{day.number}</i>}
              </li>
            ))}
          </ol>
        </section>

        <section className="ah-card ah-volume">
          <h3 className="ah-card-title">{c.volume}</h3>
          <VolumeChart data={data} language={language} unit="kg" empty={c.empty} />
        </section>
      </div>
    </div>
  );
}
