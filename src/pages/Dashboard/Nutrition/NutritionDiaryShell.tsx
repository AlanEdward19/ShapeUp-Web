import DatePicker from '../../../components/DatePicker';
import ActivityRings from '../../Dashboard/operational-dashboard/athlete/ActivityRings';
import Skeleton from '../../../components/Skeleton';
import HistoryChart from '../../../components/charts/HistoryChart';
import { useLanguage } from '../../../contexts/LanguageContext';
import { copy } from '../../shell-assets/copy';
import useHydration, { waterPercent } from '../../../hooks/useHydration';
import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DiaryDay from './DiaryDay';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useFastingApi } from '../../../hooks/api/useFastingApi';
import useNutritionist from '../../../hooks/useNutritionist';
import GoalSheet from './GoalSheet';
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

const diaryCopy = {
  'pt-BR': { title: 'Diário nutricional', target: 'Meta diária', notSet: 'Não configurada', summary: 'Resumo do dia', calories: 'Calorias', protein: 'Proteínas', carbs: 'Carboidratos', fat: 'Gorduras', left: 'restantes', over: 'acima da meta', hydration: 'Hidratação', item: 'item', items: 'itens', emptyMeal: 'Nada registrado', history: 'Histórico calórico', note: 'Anotação do dia', notePlaceholder: 'Ex.: manter o carboidrato no jantar…', today: 'Hoje', goal: 'Metas', plan: 'Cardápio', foods: 'Alimentos', fasting: 'Jejum', practice: 'Prática', locked: 'Definido pelo seu nutricionista', actions: 'Atalhos da nutrição', promptTitle: 'Quer definir uma meta?', promptBody: 'É opcional. Com uma meta, o diário mostra quanto falta para fechar o dia.', promptCta: 'Definir meta', promptSkip: 'Agora não' },
  en: { title: 'Nutrition diary', target: 'Daily target', notSet: 'Not set', summary: 'Day summary', calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', left: 'left', over: 'over target', hydration: 'Hydration', item: 'item', items: 'items', emptyMeal: 'Nothing logged', history: 'Calorie history', note: 'Note for the day', notePlaceholder: 'E.g. keep carbs at dinner…', today: 'Today', goal: 'Goals', plan: 'Meal plan', foods: 'Foods', fasting: 'Fasting', practice: 'Practice', locked: 'Set by your nutritionist', actions: 'Nutrition shortcuts', promptTitle: 'Want to set a goal?', promptBody: 'It is optional. With a goal, the diary shows how much is left to close the day.', promptCta: 'Set a goal', promptSkip: 'Not now' },
  es: { title: 'Diario nutricional', target: 'Meta diaria', notSet: 'No configurada', summary: 'Resumen del día', calories: 'Calorías', protein: 'Proteínas', carbs: 'Carbohidratos', fat: 'Grasas', left: 'restantes', over: 'sobre la meta', hydration: 'Hidratación', item: 'ítem', items: 'ítems', emptyMeal: 'Nada registrado', history: 'Historial calórico', note: 'Nota del día', notePlaceholder: 'Ej.: mantener los carbohidratos en la cena…', today: 'Hoy', goal: 'Metas', plan: 'Menú', foods: 'Alimentos', fasting: 'Ayuno', practice: 'Práctica', locked: 'Definido por tu nutricionista', actions: 'Atajos de nutrición', promptTitle: '¿Quieres definir una meta?', promptBody: 'Es opcional. Con una meta, el diario muestra cuánto falta para cerrar el día.', promptCta: 'Definir meta', promptSkip: 'Ahora no' },
} as const;

const macroKeys = ['kcal', 'proteinG', 'carbG', 'fatG'] as const;

type MacroKey = (typeof macroKeys)[number];

export type NutritionDiaryViewState = {
  date: string;
  setDate: (date: string) => void;
  goal: {
    kcal?: number;
    proteinG?: number;
    carbG?: number;
    fatG?: number;
    waterMl?: number | null;
  } | null;
  loading: boolean;
  loadError: string | null;
  loadData: () => Promise<void>;
  diary: { date: string; meals: NutritionDiaryViewState['meals']; totals?: Record<MacroKey, number> } | null;
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

const todayKey = () => new Date().toLocaleDateString('en-CA');

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

export function NutritionDiaryView(state: NutritionDiaryViewState): ReactElement {
  const navigate = useNavigate();
  const { language, translateCopy } = useLanguage();
  const tr = (text: string) =>
    language === 'pt-BR'
      ? text
      : copy[text]?.[language === 'es' ? 1 : 0] || translateCopy(text);
  const { water, addWater, removeWater } = useHydration(state.date);
  const waterGoal = state.goal?.waterMl || 0;
  const waterPct = waterPercent(water, waterGoal);
  const { getDiaryDay } = useNutritionApi();
  const { getClock } = useFastingApi();
  const { linked, loading: linkLoading } = useNutritionist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [goalOpen, setGoalOpen] = useState(searchParams.get('goal') === '1');
  const [fastingOn, setFastingOn] = useState(false);
  // The sheet waits for the first load so it can prefill, and stays mounted while a save reloads the day.
  const [loadedOnce, setLoadedOnce] = useState(false);
  useEffect(() => {
    if (!state.loading && !linkLoading) setLoadedOnce(true);
  }, [state.loading, linkLoading]);
  const promptKey = `shapeup_goal_prompt_dismissed_${localStorage.getItem('shapeup_user_id') || 'current'}`;
  const [promptDismissed, setPromptDismissed] = useState(() => localStorage.getItem(promptKey) === '1');
  const professional = ['professional', 'gym'].includes(localStorage.getItem('shapeup_role') || '');
  const [week, setWeek] = useState<Array<{ session: number; date: string; volume: number }>>([]);

  const noteKey = `shapeup_diary_note_${localStorage.getItem('shapeup_user_id') || 'current'}_${state.date}`;
  const [notes, setNotes] = useState<Record<string, string>>({});
  const note = notes[noteKey] ?? localStorage.getItem(noteKey) ?? '';
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const saved = savedKey === noteKey;

  useEffect(() => {
    let active = true;
    getClock()
      .then(() => { if (active) setFastingOn(true); })
      .catch((err: { status?: number; code?: string }) => {
        if (active) setFastingOn(!(err?.status === 404 && err?.code === 'nutrition.fasting.disabled'));
      });
    return () => { active = false; };
  }, [getClock]);

  const openGoal = () => setGoalOpen(true);
  const closeGoal = () => {
    setGoalOpen(false);
    if (searchParams.get('goal')) {
      const next = new URLSearchParams(searchParams);
      next.delete('goal');
      setSearchParams(next, { replace: true });
    }
  };
  const dismissPrompt = () => {
    localStorage.setItem(promptKey, '1');
    setPromptDismissed(true);
  };

  const addFood = (mealSlot?: string) =>
    navigate(`/dashboard/nutrition/foods?date=${state.date}&mealSlot=${mealSlot || 'Breakfast'}`);

  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.text(`ShapeUp, ${state.date}`, 14, 18);
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

  const c = diaryCopy[(language as keyof typeof diaryCopy) in diaryCopy ? (language as keyof typeof diaryCopy) : 'pt-BR'];
  const number = (value: number) => Math.round(value).toLocaleString(language);
  const goalOf = (key: MacroKey) => state.goal?.[key] || 0;
  const pct = (key: MacroKey) => (goalOf(key) ? Math.min(100, Math.round(((state.totals[key] || 0) / goalOf(key)) * 100)) : null);
  const kcalGoal = goalOf('kcal');
  const kcalLeft = Math.round(kcalGoal - (state.totals.kcal || 0));
  const glasses = waterGoal ? Math.min(12, Math.max(1, Math.ceil(waterGoal / 250))) : 8;
  const filledGlasses = Math.min(glasses, Math.floor(water / 250));
  const isToday = state.date === todayKey();
  const dateLabel = new Date(`${state.date}T12:00:00`).toLocaleDateString(language, { weekday: 'short', day: '2-digit', month: 'short' });
  const macroRows: Array<[MacroKey, string, string]> = [
    ['proteinG', c.protein, 'var(--accent)'],
    ['carbG', c.carbs, 'var(--warning)'],
    ['fatG', c.fat, 'var(--text-muted)'],
  ];

  return (
    <div className="nd">
      <header className="nd-head">
        <div className="nd-title">
          <h1>{c.title}</h1>
          <p>
            {c.target}: <strong>{kcalGoal ? `${number(kcalGoal)} kcal` : c.notSet}</strong>
          </p>
        </div>
        <div className="nd-tools">
          <div className="nd-stepper" role="group" aria-label={tr('Data do diário')}>
            <button type="button" aria-label={tr('Dia anterior')} onClick={() => state.setDate(shiftDate(state.date, -1))}>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <span className="nd-stepper-date" aria-live="polite">
              {isToday && <em className="nd-today">{c.today}</em>}
              {dateLabel}
            </span>
            <button type="button" aria-label={tr('Próximo dia')} onClick={() => state.setDate(shiftDate(state.date, 1))}>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
            {!isToday && (
              <button type="button" className="nd-back-today" onClick={() => state.setDate(todayKey())}>{c.today}</button>
            )}
            <span className="nd-calendar" title={tr('Selecionar outra data')}>
              <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <DatePicker
                iconOnly
                className="nd-calendar-input"
                value={state.date}
                onChange={(event: ChangeEvent<HTMLInputElement>) => state.setDate(event.target.value)}
                required
                aria-label={tr('Data do diário')}
              />
            </span>
          </div>
          <button type="button" className="nd-soft" onClick={exportPdf}>
            <span className="material-symbols-outlined" aria-hidden="true">file_download</span>
            {tr('Exportar PDF')}
          </button>
          <button type="button" className="nd-solid" onClick={() => addFood('Breakfast')}>
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {tr('Registrar Refeição')}
          </button>
        </div>
      </header>

      <nav className="nd-actions" aria-label={c.actions}>
        <button type="button" onClick={openGoal} data-testid="diary-goal-btn">
          <span className="material-symbols-outlined" aria-hidden="true">{linked ? 'lock' : 'flag'}</span>
          <span className="nd-actions-text">
            <strong>{c.goal}</strong>
            <small>{linked ? c.locked : kcalGoal ? `${number(kcalGoal)} kcal` : c.notSet}</small>
          </span>
        </button>
        <button type="button" onClick={() => navigate('/dashboard/nutrition/meal-plans')}>
          <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
          <span className="nd-actions-text"><strong>{c.plan}</strong></span>
        </button>
        <button type="button" onClick={() => addFood()}>
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <span className="nd-actions-text"><strong>{c.foods}</strong></span>
        </button>
        {fastingOn && (
          <button type="button" onClick={() => navigate('/dashboard/nutrition/fasting')}>
            <span className="material-symbols-outlined" aria-hidden="true">timer</span>
            <span className="nd-actions-text"><strong>{c.fasting}</strong></span>
          </button>
        )}
        {professional && (
          <button type="button" onClick={() => navigate('/dashboard/nutrition/practice')}>
            <span className="material-symbols-outlined" aria-hidden="true">stethoscope</span>
            <span className="nd-actions-text"><strong>{c.practice}</strong></span>
          </button>
        )}
      </nav>

      {!state.goal && !state.loading && !linkLoading && !linked && !promptDismissed && (
        <aside className="nd-card nd-prompt" data-testid="goal-prompt">
          <span className="material-symbols-outlined" aria-hidden="true">flag</span>
          <div>
            <h2>{c.promptTitle}</h2>
            <p>{c.promptBody}</p>
          </div>
          <div className="nd-prompt-actions">
            <button type="button" className="nd-solid" onClick={openGoal}>{c.promptCta}</button>
            <button type="button" className="nd-soft" onClick={dismissPrompt}>{c.promptSkip}</button>
          </div>
        </aside>
      )}

      <section className="nd-summary" aria-label={c.summary}>
        <div className="nd-card nd-energy">
          <div className="nd-ring">
            <ActivityRings
              size={168}
              stroke={11}
              summary={`${c.calories}: ${pct('kcal') ?? 0}%`}
              rings={[
                { label: c.calories, pct: pct('kcal'), color: 'var(--primary)' },
                { label: c.protein, pct: pct('proteinG'), color: 'var(--accent)' },
                { label: c.carbs, pct: pct('carbG'), color: 'var(--warning)' },
              ]}
            />
            <div className="nd-ring-center">
              <strong>{number(state.totals.kcal || 0)}</strong>
              <span>{kcalGoal ? (kcalLeft >= 0 ? `${number(kcalLeft)} ${c.left}` : `${number(-kcalLeft)} ${c.over}`) : 'kcal'}</span>
            </div>
          </div>
          <ul className="nd-macros">
            {macroRows.map(([key, label, color]) => (
              <li key={key}>
                <div>
                  <span>{label}</span>
                  <strong>
                    {number(state.totals[key] || 0)}
                    <small>{goalOf(key) ? ` / ${number(goalOf(key))} g` : ' g'}</small>
                  </strong>
                </div>
                <div className="nd-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct(key) ?? 0}>
                  <i style={{ width: `${pct(key) ?? 0}%`, background: color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="nd-card nd-water">
          <div className="nd-card-head">
            <h2>{c.hydration}</h2>
            <span>{waterPct !== null ? `${waterPct}%` : '-'}</span>
          </div>
          <p className="nd-big">
            {(water / 1000).toLocaleString(language)}
            <small>{waterGoal ? ` / ${(waterGoal / 1000).toLocaleString(language)} L` : ' L'}</small>
          </p>
          <ul className="nd-glasses" aria-hidden="true">
            {Array.from({ length: glasses }, (_, index) => <li key={index} data-filled={index < filledGlasses || undefined} />)}
          </ul>
          <p className="nd-note">
            {waterGoal ? (
              <span>{waterPct}% da meta</span>
            ) : (
              <button type="button" className="nd-link" onClick={openGoal}>
                Sem meta definida • Definir
              </button>
            )}
          </p>
          <div className="nd-water-actions">
            <button type="button" aria-label="Remover 250 ml de água" disabled={water <= 0} onClick={removeWater}>−250 ml</button>
            <button type="button" className="is-primary" onClick={addWater}>+250 ml</button>
          </div>
        </div>
      </section>

      <div className="nd-grid">
        <div className="nd-meals">
          {state.loadError ? (
            <div className="nd-card" data-testid="diary-shell-load-error">
              <p role="alert" className="nd-error">{state.loadError}</p>
              <button type="button" className="nd-soft" onClick={() => state.loadData()} data-testid="diary-shell-retry-btn">
                Tentar novamente
              </button>
            </div>
          ) : state.loading && !state.diary ? (
            <Skeleton variant="table" rows={5} />
          ) : state.meals.length ? (
            state.meals.map((meal, index) => {
              const totals = mealTotals(meal.items);
              const entries = meal.items || [];
              return (
                <article key={`${meal.mealSlot}-${index}`} className="nd-card nd-meal">
                  <header>
                    <div>
                      <h2>{tr(slots[meal.mealSlot] || meal.mealSlot)}</h2>
                      <p>{entries.length ? `${entries.length} ${entries.length === 1 ? c.item : c.items}` : c.emptyMeal}</p>
                    </div>
                    <div className="nd-meal-total">
                      <strong>{number(totals.kcal)} kcal</strong>
                      <small>
                        P {number(totals.proteinG)} · C {number(totals.carbG)} · G {number(totals.fatG)}
                      </small>
                    </div>
                  </header>
                  {entries.length > 0 && (
                    <ul className="nd-entries">
                      {entries.map((entry) => {
                        const name = entry.foodName || entry.food?.name || entry.foodId;
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              className="nd-entry-name"
                              onClick={() => navigate(`/dashboard/nutrition/foods?date=${state.date}&mealSlot=${meal.mealSlot}`)}
                            >
                              <strong>{name}</strong>
                              <small>{entry.quantityGramsOrMl} g</small>
                            </button>
                            <span className="nd-entry-macros">
                              <b>{entry.computedMacros?.kcal ?? 0} kcal</b>
                              <small>
                                P {entry.computedMacros?.proteinG ?? 0} · C {entry.computedMacros?.carbG ?? 0} · G {entry.computedMacros?.fatG ?? 0}
                              </small>
                            </span>
                            <button
                              aria-label={`${tr('Remover alimento')}: ${name}`}
                              title={tr('Remover alimento')}
                              type="button"
                              className="nd-remove"
                              onClick={() => state.handleRemove(entry.id)}
                            >
                              <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button type="button" className="nd-add" onClick={() => addFood(meal.mealSlot)}>
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                    {tr('Adicionar Alimento')}
                  </button>
                </article>
              );
            })
          ) : (
            <article className="nd-card nd-empty">
              <span className="material-symbols-outlined" aria-hidden="true">restaurant</span>
              <h2>Nenhuma refeição registrada nesta data.</h2>
              <button type="button" className="nd-solid" onClick={() => addFood('Breakfast')}>
                {tr('Adicionar Alimento')}
              </button>
            </article>
          )}
        </div>

        <aside className="nd-aside">
          <section className="nd-card">
            <h2>{c.history}</h2>
            <HistoryChart data={week} periods={[3, 7]} periodUnit={tr('dias')} seriesName={tr('Calorias')} />
          </section>

          <section className="nd-card">
            <h2>{tr('Observações do dia')}</h2>
            <label className="nd-field" htmlFor="coach-note">
              <span>{c.note}</span>
              <textarea
                id="coach-note"
                placeholder={c.notePlaceholder}
                rows={3}
                value={note}
                onChange={(event) => {
                  setNotes((previous) => ({ ...previous, [noteKey]: event.target.value }));
                  setSavedKey(null);
                }}
              />
            </label>
            <button
              type="button"
              className="nd-soft"
              onClick={() => {
                localStorage.setItem(noteKey, note);
                setSavedKey(noteKey);
              }}
            >
              {saved ? 'Salvo' : tr('Salvar Nota')}
            </button>
          </section>

          <section className="nd-card nd-links">
            <button type="button" onClick={() => navigate('/dashboard/messages')}>
              <span className="material-symbols-outlined" aria-hidden="true">chat</span>
              <span>{tr('Falar com o Treinador')}</span>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </section>
        </aside>
      </div>

      {goalOpen && loadedOnce && (
        <GoalSheet
          goal={state.goal}
          locked={linked}
          onClose={closeGoal}
          onSaved={() => { dismissPrompt(); state.loadData(); }}
        />
      )}
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
