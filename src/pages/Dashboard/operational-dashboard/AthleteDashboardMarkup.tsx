import FadeUp from '../../../components/motion/FadeUp';
import NumberFlow from '../../../components/motion/NumberFlow';
import AthleteScoreboard from '../../../components/gamification/AthleteScoreboard';
import type { AthleteScoreboardState } from '../../../components/gamification/AthleteScoreboard';
import HistoryChart from '../../../components/charts/HistoryChart';
import type { ReactElement } from 'react';
import type { ChartPoint, NormalizedExercise, NormalizedPlan, StoredMessage } from './types';

export type AthleteDashboardState = AthleteScoreboardState & {
  userName: string;
  plan: NormalizedPlan | undefined;
  showTodayCard: boolean;
  exercises: NormalizedExercise[];
  chartData: ChartPoint[];
  trainingError: string;
  dashboard: {
    sessionsCompletionRate?: number;
    weeklyVolumeProgressPercent?: number;
    weeklyVolume?: number;
    sessionsCompletedThisWeek?: number;
    sessionsTargetPerWeek?: number;
  } | null;
  nutrition: {
    totals?: { kcal?: number; proteinG?: number };
    goal?: { kcal?: number; proteinG?: number };
    meals?: unknown[];
  };
  water: number;
  onAddWater: () => void;
  messages: StoredMessage[];
  language: string;
  tr: (text: string) => string;
  onNavigate: (path: string) => void;
};

const weekdayTitles = [
  'Segunda',
  'Terça',
  'Quarta (Descanso)',
  'Quinta',
  'Sexta',
  'Sábado (Hoje)',
  'Domingo',
];

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
    messages,
    language,
    tr,
    onNavigate,
  } = state;

  const nutritionPercent = nutrition.goal?.kcal
    ? Math.round(((nutrition.totals?.kcal || 0) / nutrition.goal.kcal) * 100)
    : 0;

  const weekdayPill = (weekday: number) => {
    const day = new Date();
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7) + weekday);
    const done = chartData.some(item => new Date(item.startedAt).toDateString() === day.toDateString());
    const isToday = day.toDateString() === new Date().toDateString();
    const title = day.toLocaleDateString(language, { dateStyle: 'full' });
    const letter = day.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase();
    const style = {
      color: done ? 'var(--text-main)' : 'var(--text-muted)',
      background: done ? '#506443' : 'transparent',
      border: `2px solid ${isToday ? '#e06c43' : done ? '#506443' : 'var(--border-color)'}`,
      boxShadow: isToday ? '0 0 0 2px var(--bg-main)' : undefined,
    };
    return (
      <span
        key={weekday}
        title={title}
        aria-current={isToday ? 'date' : undefined}
        data-workout-completed={done}
        className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
        style={style}
      >
        {weekday === 2 ? '—' : letter}
      </span>
    );
  };

  return (
    <div className="sn-space flex min-h-screen flex-col flex-1 min-w-0 bg-[color:var(--bg-main)]" data-shell-content style={{ marginLeft: 256 }}>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[color:var(--border-color)] bg-[color:var(--bg-main)] px-8">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#eee0da]">{plan?.name || tr('Plano de treinamento')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden text-xs font-medium text-[#eee0da] md:block">
            {new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded bg-[#e06c43] px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-[#c85a33]"
            onClick={() => onNavigate('/dashboard/training')}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            <span>Iniciar Treino de Hoje</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-8 py-7">
        {trainingError ? <p role="alert">{trainingError}</p> : null}

        <section className="border-b border-[#2a201b] pb-6" data-tour="client-header">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-baseline">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#d4a359]">
                <span>{plan?.phase || 'Plano de treinamento'}</span>
              </div>
              <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-[#eee0da] md:text-4xl">
                {plan?.name || 'Seu Plano de Treinamento'}
              </h1>
              <p className="mt-1 max-w-2xl text-xs text-[#82736b]">
                {exercises.length} exercícios programados • {plan?.notes || tr('Siga as orientações da sua ficha.')}
              </p>
            </div>
          </div>
          <AthleteScoreboard state={state} />
        </section>

        <FadeUp>
        <section className="grid grid-cols-2 divide-y divide-[#2a201b] border-y border-[#2a201b] py-4 md:grid-cols-4 md:divide-x md:divide-y-0" data-tour="client-metrics">
          <div className="py-2 first:pl-0 md:px-5 md:py-0">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#82736b]">
              <span>Frequência</span>
              <span className="text-xs font-normal lowercase text-[#eee0da]">
                {dashboard ? `${dashboard.sessionsCompletedThisWeek ?? 0} / ${dashboard.sessionsTargetPerWeek ?? '—'}` : '—'}
              </span>
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <NumberFlow
                className="font-headline text-2xl font-bold text-[#eee0da]"
                value={Number.isFinite(dashboard?.sessionsCompletionRate) ? `${dashboard!.sessionsCompletionRate}%` : '—'}
              />
            </div>
            <div className="flex items-center gap-1">{weekdayTitles.map((_, index) => weekdayPill(index))}</div>
          </div>
          <div className="py-2 md:px-5 md:py-0">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#82736b]">
              <span>Volume Semanal</span>
              <span className="text-[11px] font-medium text-[#7d986b]">
                {Number.isFinite(dashboard?.weeklyVolumeProgressPercent)
                  ? `${dashboard!.weeklyVolumeProgressPercent}%`
                  : '—'}
              </span>
            </div>
            <div className="mb-1.5 flex items-baseline gap-1.5">
              <NumberFlow
                className="font-headline text-2xl font-bold text-[#eee0da]"
                value={dashboard ? Number(dashboard.weeklyVolume || 0).toLocaleString(language) : '—'}
              />
              <span className="text-xs text-[#82736b]">kg tonelagem</span>
            </div>
          </div>
          <div className="py-2 md:px-5 md:py-0">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#82736b]">
              <span>Nutrição Diária</span>
              <span className="text-xs font-medium text-[#eee0da]">
                {Number(nutrition.totals?.kcal || 0).toLocaleString(language)} / {nutrition.goal?.kcal || '—'} kcal
              </span>
            </div>
            <div className="my-2 h-1.5 w-full overflow-hidden rounded-full bg-[#241c18]">
              <div className="h-full rounded-full bg-[#7d986b]" style={{ width: `${Math.min(100, nutritionPercent || 0)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#bdaea6]">
              <span>
                Proteína: <strong className="text-[#eee0da]">{nutrition.totals?.proteinG || 0}g</strong>{' '}
                <span className="text-[#82736b]">/ {nutrition.goal?.proteinG || '—'}g</span>
              </span>
              <NumberFlow
                className="font-medium text-[#7d986b]"
                value={nutrition.goal?.kcal ? `${nutritionPercent}%` : '—'}
              />
            </div>
          </div>
          <div className="py-2 last:pr-0 md:px-5 md:py-0">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#82736b]">
              <span>Hidratação</span>
              <span id="waterPct" className="text-[11px] text-[#82736b]">Registro diário</span>
            </div>
            <div className="mb-1 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span id="waterDisplay" className="font-headline text-2xl font-bold text-[#eee0da]">
                  {(water / 1000).toLocaleString(language)}
                </span>
                <span className="text-xs text-[#82736b]">litros registrados</span>
              </div>
              <button
                id="addWaterQuickBtn"
                type="button"
                className="rounded border border-[#382b24] bg-[#1c1512] px-2 py-0.5 text-[11px] font-semibold text-[#7d986b] transition-colors hover:border-[#7d986b]"
                onClick={onAddWater}
              >
                +250ml
              </button>
            </div>
            <div className="text-[11px] text-[#82736b]">Registro diário neste dispositivo</div>
          </div>
        </section>
        </FadeUp>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div id="tabela-exercicios" className="space-y-8 lg:col-span-8">
            {showTodayCard ? (
              <div data-testid="today-workout-card">
                <div className="flex items-center justify-between border-b border-[#2a201b] pb-3">
                  <div>
                    <h2 className="font-headline text-xl font-bold uppercase tracking-tight text-[#eee0da]">
                      Exercícios Prescritos para Hoje
                    </h2>
                  </div>
                  <span className="text-xs text-[#bdaea6]">{exercises.length} exercícios</span>
                </div>
                <div className="divide-y divide-[#2a201b]">
                  {exercises.map((exercise, index) => (
                    <div key={exercise.id ?? index} className="group flex items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <span className="pt-0.5 font-mono text-xs font-bold text-[#82736b]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#eee0da]">{exercise.name}</h3>
                          <p className="mt-0.5 text-xs text-[#82736b]">
                            {exercise.notes || exercise.muscles?.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-5 text-right">
                        <div>
                          <p className="text-xs font-bold text-[#eee0da]">
                            {exercise.sets?.length || 0} {tr('séries ×')} {exercise.sets?.[0]?.reps || '—'} reps
                          </p>
                          <p className="text-xs font-medium text-[#d4a359]">
                            {tr('Carga:')} {exercise.sets?.[0]?.load || '—'} kg
                          </p>
                        </div>
                        <input
                          className="h-4 w-4 cursor-pointer rounded border-[#382b24] bg-[color:var(--bg-main)] text-[#e06c43] focus:ring-0"
                          title="Abrir sessão para registrar a execução"
                          type="checkbox"
                          onChange={() => onNavigate('/dashboard/training')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-[#2a201b] pt-4" data-tour="client-chart">
              <h3 className="font-headline text-lg font-bold uppercase">Histórico de Volume</h3>
              <HistoryChart data={chartData} />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="border-b border-[#2a201b] pb-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#e06c43]">record_voice_over</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#eee0da]">Feedback do Treinador</span>
                </div>
              </div>
              <p className="rounded border border-[#2a201b] bg-[#1b1411] p-3 text-xs leading-relaxed text-[#bdaea6]">
                {messages[messages.length - 1]?.text || 'Nenhuma orientação nova do treinador.'}
              </p>
              <button
                type="button"
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#e06c43] hover:underline"
                onClick={() => onNavigate('/dashboard/messages')}
              >
                <span className="material-symbols-outlined text-[15px]">chat_bubble</span>
                <span>Responder ao treinador</span>
              </button>
            </div>

            <div className="border-b border-[#2a201b] pb-5">
              <h3 className="text-xs font-bold uppercase">Diário de Nutrição</h3>
              <p className="py-3 text-sm">{nutrition.meals?.length || 0} refeições registradas</p>
              <button type="button" className="text-xs text-[#e06c43]" onClick={() => onNavigate('/dashboard/nutrition/diary')}>
                Abrir diário
              </button>
            </div>

            <div className="text-xs text-[#82736b]">
              <span className="font-semibold text-[#eee0da]">{userName}</span> — sessão ativa
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
