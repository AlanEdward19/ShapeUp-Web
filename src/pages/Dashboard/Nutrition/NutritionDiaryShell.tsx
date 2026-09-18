import DatePicker from '../../../components/DatePicker';
import HistoryChart from '../../../components/charts/HistoryChart';
import { useLanguage } from '../../../contexts/LanguageContext';
import { copy } from '../../shell-assets/copy';
import useHydration from '../../../hooks/useHydration';
import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryDay from './DiaryDay';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const slots: Record<string, string> = {
  Breakfast: 'Café da Manhã',
  Lunch: 'Almoço',
  Dinner: 'Jantar',
  Snack: 'Lanche',
  MorningSnack: 'Lanche da Manhã',
  AfternoonSnack: 'Lanche da Tarde',
};

const macroKeys = ['kcal', 'proteinG', 'carbG', 'fatG'] as const;

type MacroKey = (typeof macroKeys)[number];

const macroMeta: Record<
  MacroKey,
  { label: string; labelClass: string; barClass: string; unit: string; extraClass?: string }
> = {
  kcal: {
    label: 'Total Calórico',
    labelClass: 'text-text-muted',
    barClass: 'bg-primary-container',
    unit: 'kcal',
    extraClass: 'col-span-2 md:col-span-1 pr-4 border-r border-[color:var(--border-color)]',
  },
  proteinG: {
    label: 'Proteínas',
    labelClass: 'text-olive',
    barClass: 'bg-olive',
    unit: 'g',
    extraClass: 'pr-4 border-r border-[color:var(--border-color)]',
  },
  carbG: {
    label: 'Carboidratos',
    labelClass: 'text-ochre',
    barClass: 'bg-ochre',
    unit: 'g',
    extraClass: 'pr-4 border-r border-[color:var(--border-color)]',
  },
  fatG: {
    label: 'Gorduras',
    labelClass: 'text-on-surface-variant',
    barClass: 'bg-on-surface-variant/80',
    unit: 'g',
    extraClass: 'pr-4 border-r border-[color:var(--border-color)]',
  },
};

export type NutritionDiaryViewState = {
  date: string;
  setDate: (date: string) => void;
  goal: {
    kcal?: number;
    proteinG?: number;
    carbG?: number;
    fatG?: number;
  } | null;
  loading: boolean;
  totals: Record<MacroKey, number>;
  meals: Array<{
    mealSlot: string;
    items?: Array<{
      id: string;
      foodName?: string;
      food?: { name?: string };
      foodId?: string;
      quantityGramsOrMl: number;
      computedMacros?: Partial<Record<MacroKey, number>>;
    }>;
  }>;
  handleRemove: (entryId: string) => void | Promise<void>;
};

function shiftDate(date: string, delta: number): string {
  const day = new Date(`${date}T12:00:00`);
  day.setDate(day.getDate() + delta);
  return day.toLocaleDateString('en-CA');
}

function mealTotals(
  items: NutritionDiaryViewState['meals'][number]['items'],
): Record<MacroKey, number> {
  return (items || []).reduce(
    (sum, entry) =>
      macroKeys.reduce(
        (next, key) => ({
          ...next,
          [key]: (sum[key] || 0) + (entry.computedMacros?.[key] || 0),
        }),
        {} as Record<MacroKey, number>,
      ),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );
}

type MacroMetricProps = {
  keyName: MacroKey;
  consumed: number;
  goal: number;
  language: string;
  tr: (text: string) => string;
};

function MacroMetric({ keyName, consumed, goal, language, tr }: MacroMetricProps): ReactElement {
  const meta = macroMeta[keyName];
  const percent = goal ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  const remaining = goal ? Math.max(0, Math.round(goal - consumed)) : 0;
  const unit = meta.unit;

  return (
    <div className={`flex flex-col justify-between space-y-2 ${meta.extraClass ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${meta.labelClass}`}>
          {meta.label}
        </span>
        <span className={`text-[12px] font-medium tabular-nums ${meta.labelClass}`}>
          {goal ? `${percent}%` : '—'}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
          {Math.round(consumed).toLocaleString(language)}
        </span>
        <span className="text-[13px] text-text-muted tabular-nums">
          / {goal || '—'} {unit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#29211D] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${meta.barClass}`}
          style={{ width: `${goal ? percent : 0}%` }}
        />
      </div>
      <div className="text-[12px] text-text-muted">
        {goal
          ? `${tr('Restam')} ${remaining.toLocaleString(language)} ${unit}`
          : 'Meta não configurada'}
      </div>
    </div>
  );
}

function NutritionDiaryView(state: NutritionDiaryViewState): ReactElement {
  const navigate = useNavigate();
  const { language, translateCopy } = useLanguage();
  const tr = (text: string) =>
    language === 'pt-BR'
      ? text
      : copy[text]?.[language === 'es' ? 1 : 0] || translateCopy(text);
  const { water, addWater } = useHydration(state.date);
  const { getDiaryDay } = useNutritionApi();
  const [week, setWeek] = useState<Array<{ session: number; date: string; volume: number }>>([]);

  const noteKey = `shapeup_diary_note_${localStorage.getItem('shapeup_user_id') || 'current'}_${state.date}`;
  const [notes, setNotes] = useState<Record<string, string>>({});
  const note = notes[noteKey] ?? localStorage.getItem(noteKey) ?? '';
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const saved = savedKey === noteKey;

  const addFood = (mealSlot?: string) =>
    navigate(`/dashboard/nutrition/foods?date=${state.date}&mealSlot=${mealSlot || 'Breakfast'}`);

  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.text(`ShapeUp — ${state.date}`, 14, 18);
    autoTable(pdf, {
      startY: 26,
      head: [['Refeição', 'Alimento', 'Porção', 'kcal', 'P', 'C', 'G'].map(tr)],
      body: state.meals.flatMap((meal) =>
        (meal.items || []).map((entry) => [
          tr(slots[meal.mealSlot] || meal.mealSlot),
          entry.foodName || entry.food?.name || entry.foodId,
          `${entry.quantityGramsOrMl}g`,
          ...macroKeys.map((key) => entry.computedMacros?.[key] ?? 0),
        ]),
      ),
    });
    pdf.save(`ShapeUp-${state.date}.pdf`);
  };

  useEffect(() => {
    let active = true;
    const dates = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(`${state.date}T12:00:00`);
      day.setDate(day.getDate() - 6 + index);
      return day.toLocaleDateString('en-CA');
    });
    Promise.all(dates.map(async (date) => ({ date, diary: await getDiaryDay(date) })))
      .then((days) => {
        if (active) {
          setWeek(
            days.map(({ date, diary }) => ({
              session: new Date(`${date}T12:00:00`).getDate(),
              date,
              volume: diary.totals?.kcal || 0,
            })),
          );
        }
      })
      .catch(() => {
        if (active) setWeek([]);
      });
    return () => {
      active = false;
    };
  }, [state.date, state.totals.kcal, getDiaryDay]);

  const displayName = localStorage.getItem('shapeup_user_name') || 'Diário Nutricional';

  return (
      <div className="pl-64">
        <header
          className="sticky top-0 z-40 h-16 bg-[#211A17]/95 backdrop-blur border-b border-[color:var(--border-color)] px-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] text-text-muted font-headline tracking-wide uppercase font-semibold">
              <span>Atleta</span>
              <span className="text-[color:var(--border-color)]">/</span>
              <span className="text-on-surface font-headline font-bold text-[15px] tracking-wide uppercase">
                Diário de Nutrição
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-[#29211D] transition-colors border border-[color:var(--border-color)]"
              onClick={exportPdf}
            >
              <span className="material-symbols-outlined text-[17px]">file_download</span>
              <span>{tr('Exportar PDF')}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary-container text-on-primary-container text-[13px] font-semibold hover:brightness-110 transition-all shadow-sm"
              onClick={() => addFood('Breakfast')}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{tr('Registrar Refeição')}</span>
            </button>
          </div>
        </header>

        <main className="p-8 max-w-[1400px] mx-auto space-y-8">
          <section
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[color:var(--border-color)]"
          >
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="font-headline font-bold text-3xl tracking-tight text-on-surface uppercase m-0">
                  {displayName}
                </h1>
                <span className="text-[13px] text-text-muted">
                  Meta diária prescrita:{' '}
                  <strong className="text-on-surface font-semibold tabular-nums">
                    {state.goal?.kcal
                      ? `${state.goal.kcal.toLocaleString(language)} kcal`
                      : 'Não configurada'}
                  </strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center bg-[#211A17] border border-[color:var(--border-color)] rounded p-0.5 text-[13px]"
                style={{ flexWrap: 'wrap', gap: 4 }}
              >
                <button
                  type="button"
                  className="px-2 py-1 rounded text-text-muted hover:text-on-surface hover:bg-[#29211D] transition-colors"
                  aria-label={tr('Dia anterior')}
                  onClick={() => state.setDate(shiftDate(state.date, -1))}
                >
                  ‹ {tr('Dia anterior')}
                </button>
                <span className="px-3 py-1" aria-live="polite">
                  {new Date(`${state.date}T12:00:00`).toLocaleDateString(language, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  className="px-2 py-1 rounded text-text-muted hover:text-on-surface hover:bg-[#29211D] transition-colors"
                  aria-label={tr('Próximo dia')}
                  onClick={() => state.setDate(shiftDate(state.date, 1))}
                >
                  {tr('Próximo dia')} ›
                </button>
              </div>
              <label
                className="relative p-1.5 text-text-muted hover:text-on-surface hover:bg-[#29211D] rounded border border-[color:var(--border-color)] transition-colors cursor-pointer inline-flex"
                title={tr('Selecionar outra data')}
              >
                <DatePicker
                  iconOnly
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  value={state.date}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => state.setDate(event.target.value)}
                  required
                  aria-label={tr('Data do diário')}
                />
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-5 gap-6 pb-7 border-b border-[color:var(--border-color)]">
            {macroKeys.map((key) => (
              <MacroMetric
                key={key}
                keyName={key}
                consumed={state.totals[key] || 0}
                goal={state.goal?.[key] || 0}
                language={language}
                tr={tr}
              />
            ))}
            <div className="flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Hidratação
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
                  {(water / 1000).toLocaleString(language)}
                </span>
                <span className="text-[13px] text-text-muted tabular-nums">litros registrados</span>
              </div>
              <div className="w-full h-1.5 bg-[#29211D] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
              </div>
              <button
                type="button"
                className="text-[12px] text-left text-text-muted hover:text-on-surface"
                onClick={addWater}
              >
                +250 ml • Registrar água
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-7">
              {state.loading ? (
                <p className="text-text-muted">Carregando diário…</p>
              ) : state.meals.length ? (
                state.meals.map((meal, index) => {
                  const totals = mealTotals(meal.items);
                  return (
                    <article
                      key={`${meal.mealSlot}-${index}`}
                      className="bg-[#211A17] border border-[color:var(--border-color)] rounded-lg p-5"
                    >
                      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[color:var(--border-color)]">
                        <h2 className="font-semibold text-base text-on-surface m-0">
                          {`${tr('Refeição')} ${String(index + 1).padStart(2, '0')} — ${tr(slots[meal.mealSlot] || meal.mealSlot)}`}
                        </h2>
                        <div className="text-right text-[13px] text-text-muted tabular-nums">
                          <span className="font-bold text-on-surface">
                            {Math.round(totals.kcal)} kcal
                          </span>
                          <span className="mx-1.5">•</span>
                          P: <span className="text-olive font-medium">{Math.round(totals.proteinG)}g</span>
                          {' | '}
                          C: <span className="text-ochre font-medium">{Math.round(totals.carbG)}g</span>
                          {' | '}
                          G:{' '}
                          <span className="text-on-surface-variant font-medium">
                            {Math.round(totals.fatG)}g
                          </span>
                        </div>
                      </header>
                      <div className="overflow-auto mt-3">
                        <table className="w-full text-left text-[13px]">
                          <thead>
                            <tr className="text-text-muted text-[11px] font-semibold uppercase tracking-wider border-b border-[color:var(--border-color)]">
                              <th className="py-2 font-semibold">Alimento / Item</th>
                              <th className="py-2 text-right font-semibold">Porção</th>
                              <th className="py-2 text-right font-semibold">Calorias</th>
                              <th className="py-2 text-right font-semibold text-olive">P</th>
                              <th className="py-2 text-right font-semibold text-ochre">C</th>
                              <th className="py-2 text-right font-semibold text-on-surface-variant">
                                G
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[color:color-mix(in_srgb,var(--border-color)_50%,transparent)] text-on-surface">
                            {(meal.items || []).map((entry) => (
                              <tr key={entry.id}>
                                <td className="py-2.5 font-medium">
                                  <button
                                    type="button"
                                    className="text-left hover:text-primary-container"
                                    onClick={() =>
                                      navigate(
                                        `/dashboard/nutrition/foods?date=${state.date}&mealSlot=${meal.mealSlot}`,
                                      )
                                    }
                                  >
                                    {entry.foodName || entry.food?.name || entry.foodId}
                                  </button>
                                  <button
                                    aria-label={`${tr('Remover alimento')}: ${entry.foodName || entry.foodId}`}
                                    title={tr('Remover alimento')}
                                    type="button"
                                    onClick={() => state.handleRemove(entry.id)}
                                    className="ml-2 text-text-muted"
                                  >
                                    ×
                                  </button>
                                </td>
                                <td className="py-2.5 text-right text-text-muted tabular-nums">
                                  {entry.quantityGramsOrMl} g
                                </td>
                                {macroKeys.map((key, i) => (
                                  <td
                                    key={key}
                                    className={`py-2.5 text-right tabular-nums ${i === 1 ? 'text-olive' : i === 2 ? 'text-ochre' : ''}`}
                                  >
                                    {entry.computedMacros?.[key] ?? 0}
                                    {i === 0 ? ' kcal' : 'g'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <footer className="pt-3 mt-2 border-t border-[color:var(--border-color)] flex items-center justify-between text-[12px]">
                        <button
                          type="button"
                          className="text-primary-container hover:underline font-medium flex items-center gap-1"
                          onClick={() => addFood(meal.mealSlot)}
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                          <span>{tr('Adicionar Alimento')}</span>
                        </button>
                        <span className="text-text-muted">Registrado no diário</span>
                      </footer>
                    </article>
                  );
                })
              ) : (
                <article className="p-5 bg-[#211A17] border border-[color:var(--border-color)] rounded-lg">
                  <p className="text-text-muted m-0">Nenhuma refeição registrada nesta data.</p>
                  <button
                    className="mt-4 text-primary-container"
                    type="button"
                    onClick={() => addFood('Breakfast')}
                  >
                    {tr('Adicionar Alimento')}
                  </button>
                </article>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <section className="bg-[#211A17] border border-[color:var(--border-color)] rounded-lg p-5">
                <h3 className="text-xs font-semibold uppercase mb-4 m-0">Histórico Calórico</h3>
                <HistoryChart
                  data={week}
                  periods={[3, 7]}
                  periodUnit={tr('dias')}
                  seriesName={tr('Calorias')}
                />
              </section>

              <section className="bg-[#211A17] border border-[color:var(--border-color)] rounded-lg p-5">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-muted mb-3 m-0">
                  {tr('Observações do dia')}
                </h3>
                <p className="text-[13px] text-on-surface-variant leading-relaxed m-0 mb-3">
                  Registre suas observações no campo abaixo.
                </p>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block mb-2"
                  htmlFor="coach-note"
                >
                  Anotação do Atleta / Ajuste
                </label>
                <textarea
                  id="coach-note"
                  className="w-full px-3 py-2 text-[13px] bg-[#29211D] border border-[color:var(--border-color)] rounded text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary-container resize-none"
                  placeholder="Ex: Manter aporte de carboidrato no jantar..."
                  rows={2}
                  value={note}
                  onChange={(event) => {
                    setNotes((previous) => ({ ...previous, [noteKey]: event.target.value }));
                    setSavedKey(null);
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-[#29211D] border border-[color:var(--border-color)] hover:bg-surface-hover text-[12px] font-medium text-on-surface transition-colors"
                    onClick={() => {
                      localStorage.setItem(noteKey, note);
                      setSavedKey(noteKey);
                    }}
                  >
                    {saved ? 'Salvo' : tr('Salvar Nota')}
                  </button>
                </div>
              </section>

              <section className="bg-[#211A17] border border-[color:var(--border-color)] rounded-lg p-5">
                <h3 className="text-xs font-semibold uppercase mb-3 m-0">Meta diária prescrita:</h3>
                <p className="text-on-surface m-0">{state.goal?.kcal || '—'} kcal</p>
                <button
                  className="text-sm mt-3 text-primary-container"
                  type="button"
                  onClick={() => navigate('/dashboard/nutrition/goal')}
                >
                  Configurar meta nutricional
                </button>
                <div className="pt-4 mt-4 border-t border-[color:var(--border-color)] flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full py-2 rounded bg-[#29211D] border border-[color:var(--border-color)] hover:bg-surface-hover text-[13px] font-medium text-on-surface transition-colors flex items-center justify-center gap-2"
                    onClick={exportPdf}
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-container">
                      picture_as_pdf
                    </span>
                    <span>{tr('Exportar Plano Alimentar em PDF')}</span>
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 rounded bg-[#29211D] border border-[color:var(--border-color)] hover:bg-surface-hover text-[13px] font-medium text-on-surface transition-colors flex items-center justify-center gap-2"
                    onClick={() => navigate('/dashboard/messages')}
                  >
                    <span className="material-symbols-outlined text-[16px] text-text-muted">chat</span>
                    <span>{tr('Falar com o Treinador')}</span>
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
  );
}

export default function NutritionDiaryShell() {
  return (
    <DiaryDay
      renderView={(state) => <NutritionDiaryView {...(state as NutritionDiaryViewState)} />}
    />
  );
}
