import FadeUp from '../../../components/motion/FadeUp';
import NumberFlow from '../../../components/motion/NumberFlow';
import AthleteScoreboard from '../../../components/gamification/AthleteScoreboard';
import type { AthleteScoreboardState } from '../../../components/gamification/AthleteScoreboard';
import WeeklyReadingCard from '../../../components/gamification/WeeklyReadingCard';
import type { WeeklyReadingState } from '../../../components/gamification/WeeklyReadingCard';
import type { ReactElement } from 'react';
import type { ChartPoint, NormalizedExercise, NormalizedPlan, StoredMessage } from './types';
import ActivityRings from './athlete/ActivityRings';
import VolumeChart from './athlete/VolumeChart';
import { athleteCopy } from './athlete/athleteCopy';
import BodyWeightCard from './athlete/BodyWeightCard';

export type AthleteDashboardState = AthleteScoreboardState & {
  userName: string;
  plan: NormalizedPlan | undefined;
  showTodayCard: boolean;
  exercises: NormalizedExercise[];
  chartData: ChartPoint[];
  trainingError: string;
  weeklyReading?: WeeklyReadingState;
  dashboard: {
    sessionsCompletionRate?: number;
    weeklyVolumeProgressPercent?: number;
    weeklyVolume?: number;
    sessionsCompletedThisWeek?: number;
    sessionsTargetPerWeek?: number;
  } | null;
  nutrition: {
    totals?: { kcal?: number; proteinG?: number };
    goal?: { kcal?: number; proteinG?: number; waterMl?: number | null };
    meals?: unknown[];
  };
  water: number;
  onAddWater: () => void;
  onRemoveWater: () => void;
  messages: StoredMessage[];
  language: string;
  tr: (text: string) => string;
  onNavigate: (path: string) => void;
};

const percent = (value: number | undefined, goal: number | undefined | null): number | null =>
  goal ? Math.min(100, Math.round(((value || 0) / goal) * 100)) : null;

const WATER_STEP = 250;

function Icon({ name, filled }: { name: string; filled?: boolean }): ReactElement {
  return (
    <span className="material-symbols-outlined" aria-hidden="true" style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}>
      {name}
    </span>
  );
}

export function AthleteDashboardMarkup({ state }: { state: AthleteDashboardState }): ReactElement {
  const {
    userName,
    plan,
    showTodayCard,
    exercises,
    chartData,
    trainingError,
    dashboard,
    nutrition,
    water,
    onAddWater,
    onRemoveWater,
    messages,
    language,
    onNavigate,
  } = state;
  const c = athleteCopy(language);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? c.morning : hour < 18 ? c.afternoon : c.evening;
  const firstName = (userName || '').trim().split(/\s+/)[0];
  const dateLabel = now.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });

  const waterGoal = nutrition.goal?.waterMl || 0;
  const kcal = nutrition.totals?.kcal || 0;
  const kcalGoal = nutrition.goal?.kcal || 0;
  const workoutsDone = dashboard?.sessionsCompletedThisWeek ?? 0;
  const workoutsTarget = dashboard?.sessionsTargetPerWeek ?? null;
  const workoutPct = Number.isFinite(dashboard?.sessionsCompletionRate) ? Math.min(100, dashboard!.sessionsCompletionRate!) : null;
  const caloriePct = percent(kcal, kcalGoal);
  const waterPct = percent(water, waterGoal);
  const proteinPct = percent(nutrition.totals?.proteinG, nutrition.goal?.proteinG);

  const muscles = [...new Set(exercises.flatMap(exercise => exercise.muscles ?? []))].slice(0, 4);
  const lastCoachMessage = messages[messages.length - 1];

  const glasses = waterGoal ? Math.min(12, Math.max(1, Math.ceil(waterGoal / WATER_STEP))) : 8;
  const filledGlasses = Math.min(glasses, Math.floor(water / WATER_STEP));

  const weekDay = (offset: number) => {
    const day = new Date();
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7) + offset);
    const done = chartData.some(item => new Date(item.startedAt).toDateString() === day.toDateString());
    const isToday = day.toDateString() === new Date().toDateString();
    const letter = day.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase();
    return (
      <li
        key={offset}
        title={day.toLocaleDateString(language, { dateStyle: 'full' })}
        aria-current={isToday ? 'date' : undefined}
        data-workout-completed={done}
        className="ah-day"
        data-today={isToday || undefined}
      >
        <span className="ah-day-letter">{letter}</span>
        {done ? <Icon name="check" /> : <i aria-hidden="true">{day.getDate()}</i>}
      </li>
    );
  };

  const hero = showTodayCard ? (
    <section className="ah-hero" aria-labelledby="ah-hero-title">
      <p className="ah-eyebrow">{c.todayEyebrow}</p>
      <h2 id="ah-hero-title">{plan?.name || c.planFallback}</h2>
      <p className="ah-hero-meta">
        {c.exercisesCount(exercises.length)}
        {plan?.phase ? ` · ${plan.phase}` : ''}
      </p>
      {muscles.length > 0 && (
        <ul className="ah-chips" aria-label="Grupos musculares">
          {muscles.map(muscle => <li key={muscle}>{muscle}</li>)}
        </ul>
      )}
      <button type="button" className="ah-hero-cta" onClick={() => onNavigate('/dashboard/training')}>
        <Icon name="play_arrow" filled />
        {c.start}
      </button>
    </section>
  ) : (
    <section className="ah-hero is-quiet" aria-labelledby="ah-hero-title">
      <Icon name={plan ? 'self_improvement' : 'event_available'} />
      <h2 id="ah-hero-title">{plan ? c.restTitle : c.noPlanTitle}</h2>
      <p className="ah-hero-meta">{plan ? c.restBody : c.noPlanBody}</p>
      <button type="button" className="ah-soft-cta" onClick={() => onNavigate('/dashboard/training')}>
        {c.seePlan}
      </button>
    </section>
  );

  return (
    <div className="ah" data-shell-content style={{ marginLeft: 256 }}>
      <main className="ah-page">
        {trainingError ? <p role="alert" className="ah-alert">{trainingError}</p> : null}

        <header className="ah-header" data-tour="client-header">
          <div>
            <p className="ah-date">{dateLabel}</p>
            <h1>{greeting}{firstName ? `, ${firstName}` : ''}</h1>
          </div>
        </header>

        <FadeUp>
          <div className="ah-grid">
            {hero}

            <section className="ah-card ah-summary" aria-label={c.summary}>
              <h3 className="ah-card-title">{c.summary}</h3>
              <div className="ah-summary-body">
                <div className="ah-rings-wrap">
                  <ActivityRings
                    summary={`${c.ringWorkouts}: ${workoutPct ?? 0}%, ${c.ringCalories}: ${caloriePct ?? 0}%, ${c.ringWater}: ${waterPct ?? 0}%`}
                    rings={[
                      { label: c.ringWorkouts, pct: workoutPct, color: 'var(--primary)' },
                      { label: c.ringCalories, pct: caloriePct, color: 'var(--accent)' },
                      { label: c.ringWater, pct: waterPct, color: 'var(--warning)' },
                    ]}
                  />
                </div>
                <dl className="ah-legend">
                  <div style={{ ['--dot' as string]: 'var(--primary)' }}>
                    <dt>{c.ringWorkouts}</dt>
                    <dd>{dashboard ? `${workoutsDone}/${workoutsTarget ?? '—'}` : '—'}</dd>
                  </div>
                  <div style={{ ['--dot' as string]: 'var(--accent)' }}>
                    <dt>{c.ringCalories}</dt>
                    <dd>{kcalGoal ? `${kcal.toLocaleString(language)}/${kcalGoal.toLocaleString(language)}` : c.noTarget}</dd>
                  </div>
                  <div style={{ ['--dot' as string]: 'var(--warning)' }}>
                    <dt>{c.ringWater}</dt>
                    <dd>{waterGoal ? `${(water / 1000).toLocaleString(language)}/${(waterGoal / 1000).toLocaleString(language)} L` : c.noTarget}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="ah-card ah-week" data-tour="client-metrics" aria-label={c.week}>
              <div className="ah-card-head">
                <h3 className="ah-card-title">{c.week}</h3>
                <p className="ah-card-sub">
                  {dashboard ? c.weekDone(workoutsDone, workoutsTarget) : '—'}
                </p>
              </div>
              <ol className="ah-days">{[0, 1, 2, 3, 4, 5, 6].map(weekDay)}</ol>
              <div className="ah-stat">
                <span className="ah-stat-label">{c.weeklyVolume}</span>
                <span className="ah-stat-value">
                  <NumberFlow
                    value={dashboard ? Number(dashboard.weeklyVolume || 0).toLocaleString(language) : '—'}
                  />
                  <small>kg</small>
                  {Number.isFinite(dashboard?.weeklyVolumeProgressPercent) && dashboard!.weeklyVolumeProgressPercent !== 0 && (
                    <em className="ah-pill">{dashboard!.weeklyVolumeProgressPercent}%</em>
                  )}
                </span>
              </div>
            </section>

            <section className="ah-card ah-volume" data-tour="client-chart" aria-label={c.volume}>
              <h3 className="ah-card-title">{c.volume}</h3>
              <VolumeChart data={chartData} language={language} unit={c.volumeUnit} empty={c.volumeEmpty} />
            </section>

            {showTodayCard && (
              <section className="ah-card ah-today" data-testid="today-workout-card" aria-label={c.todayList}>
                <div className="ah-card-head">
                  <h3 className="ah-card-title">{c.todayList}</h3>
                  <p className="ah-card-sub">{c.exercisesCount(exercises.length)}</p>
                </div>
                <ol className="ah-exercises">
                  {exercises.map((exercise, index) => {
                    const first = exercise.sets?.[0];
                    return (
                      <li key={exercise.id ?? index}>
                        <button type="button" onClick={() => onNavigate('/dashboard/training')}>
                          <span className="ah-index">{index + 1}</span>
                          <span className="ah-exercise-copy">
                            <strong>{exercise.name}</strong>
                            <small>{exercise.notes || exercise.muscles?.join(', ')}</small>
                          </span>
                          <span className="ah-prescription">
                            {exercise.sets?.length || 0} × {first?.reps || '—'}
                            {first?.load ? <small>{first.load} {c.load}</small> : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            <section className="ah-card ah-side" aria-label={`${c.nutrition} · ${c.hydration}`}>
              <div className="ah-block ah-nutrition">
              <div className="ah-card-head">
                <h3 className="ah-card-title">{c.nutrition}</h3>
                <button type="button" className="ah-link" onClick={() => onNavigate('/dashboard/nutrition/diary')}>{c.openDiary}</button>
              </div>
              <p className="ah-big">
                {kcal.toLocaleString(language)}
                <small>{kcalGoal ? ` / ${kcalGoal.toLocaleString(language)} kcal` : ' kcal'}</small>
              </p>
              <div className="ah-bar" role="progressbar" aria-label="kcal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={caloriePct ?? 0}>
                <i style={{ width: `${caloriePct ?? 0}%`, background: 'var(--accent)' }} />
              </div>
              <div className="ah-macro">
                <span>{c.protein}</span>
                <strong>{nutrition.totals?.proteinG || 0} g{nutrition.goal?.proteinG ? ` / ${nutrition.goal.proteinG} g` : ''}</strong>
              </div>
              <div className="ah-bar is-thin" role="progressbar" aria-label={c.protein} aria-valuemin={0} aria-valuemax={100} aria-valuenow={proteinPct ?? 0}>
                <i style={{ width: `${proteinPct ?? 0}%`, background: 'var(--primary)' }} />
              </div>
              <p className="ah-card-sub">{c.meals(nutrition.meals?.length || 0)}</p>
              </div>

              <div className="ah-block ah-water">
              <div className="ah-card-head">
                <h3 className="ah-card-title">{c.hydration}</h3>
                {!waterGoal && (
                  <button type="button" className="ah-link" onClick={() => onNavigate('/dashboard/nutrition/goal')}>{c.setWaterGoal}</button>
                )}
              </div>
              <p className="ah-big">
                <span id="waterDisplay">{(water / 1000).toLocaleString(language)}</span>
                <small>{waterGoal ? ` / ${(waterGoal / 1000).toLocaleString(language)} L` : ' L'}</small>
              </p>
              <ul className="ah-glasses" aria-hidden="true">
                {Array.from({ length: glasses }, (_, index) => <li key={index} data-filled={index < filledGlasses || undefined} />)}
              </ul>
              <div className="ah-water-actions">
                <button id="removeWaterQuickBtn" type="button" aria-label={`Remover ${WATER_STEP} ml de água`} disabled={water <= 0} onClick={onRemoveWater}>
                  −{WATER_STEP} ml
                </button>
                <button id="addWaterQuickBtn" type="button" className="is-primary" onClick={onAddWater}>
                  +{WATER_STEP} ml
                </button>
              </div>
              </div>

              <div className="ah-block ah-coach">
              <div className="ah-card-head">
                <h3 className="ah-card-title">{c.coach}</h3>
              </div>
              <p className={lastCoachMessage?.text ? 'ah-quote' : 'ah-quote is-empty'}>
                {lastCoachMessage?.text || c.noCoach}
              </p>
              <button type="button" className="ah-link" onClick={() => onNavigate('/dashboard/messages')}>
                <Icon name="chat_bubble" />
                {c.reply}
              </button>
              </div>
            </section>

            <BodyWeightCard />

            <section className="ah-card ah-progress" aria-label={c.progress}>
              <AthleteScoreboard state={state} />
            </section>

            {state.weeklyReading ? (
              <section className="ah-card ah-reading">
                <WeeklyReadingCard reading={state.weeklyReading} />
              </section>
            ) : null}
          </div>
        </FadeUp>
      </main>
    </div>
  );
}
