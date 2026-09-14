import DatePicker from '../../../components/DatePicker';
import { useLanguage } from '../../../contexts/LanguageContext';
import { copy } from '../../../stitch/copy';
import useHydration from '../../../stitch/useHydration';
import { createElement, useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryDay from './DiaryDay';
import Workspace from '../../../stitch/Workspace';
import { sourceDocument, renderSource, nodeText } from '../../../stitch/sourceRuntime';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import HistoryChart from '../../../stitch/HistoryChart';
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

const macroPlaceholders: Record<string, (typeof macroKeys)[number]> = {
  '580 kcal': 'kcal',
  '42g': 'proteinG',
  '65g': 'carbG',
  '16g': 'fatG',
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
  totals: Record<(typeof macroKeys)[number], number>;
  meals: Array<{
    mealSlot: string;
    items?: Array<{
      id: string;
      foodName?: string;
      food?: { name?: string };
      foodId?: string;
      quantityGramsOrMl: number;
      computedMacros?: Partial<Record<(typeof macroKeys)[number], number>>;
    }>;
  }>;
  handleRemove: (entryId: string) => void | Promise<void>;
};

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

  const document = sourceDocument('nutrition');
  const prototype = document.querySelector('article');
  const mealList = prototype?.parentElement;
  const metricSection = [...document.querySelectorAll('section')].find((section) =>
    section.className.includes('md:grid-cols-5'),
  );
  const noteKey = `shapeup_diary_note_${localStorage.getItem('shapeup_user_id') || 'current'}_${state.date}`;
  const [notes, setNotes] = useState<Record<string, string>>({});
  const note = notes[noteKey] ?? localStorage.getItem(noteKey) ?? '';
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const saved = savedKey === noteKey;
  const addFood = (mealSlot?: string) =>
    navigate(`/dashboard/nutrition/foods?date=${state.date}&mealSlot=${mealSlot || 'Breakfast'}`);

  return (
    <Workspace
      name="nutrition"
      css="article table{min-width:520px}article{overflow:auto}"
      bind={(node: Element, props: Record<string, unknown>) => {
        if (node.localName === 'button' && node.getAttribute('title') === 'Selecionar outra data') {
          return (
            <DatePicker
              {...(props as Record<string, unknown>)}
              iconOnly
              value={state.date}
              onChange={(event: ChangeEvent<HTMLInputElement>) => state.setDate(event.target.value)}
              required
              aria-label={tr('Data do diário')}
            />
          );
        }
        if (node.localName === 'button' && /Exportar.*PDF/.test(nodeText(node))) {
          props.onClick = () => {
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
          return;
        }
        if (
          node.localName === 'section' &&
          node.querySelector('h3')?.textContent?.trim() === 'Aderência Semanal ao Plano'
        ) {
          return (
            <section {...props}>
              <h3 className="text-xs font-semibold uppercase mb-4">Histórico Calórico</h3>
              <HistoryChart
                data={week}
                periods={[3, 7]}
                periodUnit={tr('dias')}
                seriesName={tr('Calorias')}
              />
            </section>
          );
        }
        if (
          node.localName === 'section' &&
          node.querySelector('h3')?.textContent?.trim() === 'Alertas & Próximas Ações'
        ) {
          return (
            <section {...props}>
              <h3 className="text-xs font-semibold uppercase mb-3">Meta diária prescrita:</h3>
              <p>{state.goal?.kcal || '—'} kcal</p>
              <button className="text-sm mt-3" type="button" onClick={() => navigate('/dashboard/nutrition/goal')}>
                Configurar meta nutricional
              </button>
            </section>
          );
        }
        if (node.localName === 'p' && nodeText(node).includes('Digestão do almoço')) {
          return <p {...props}>Registre suas observações no campo abaixo.</p>;
        }
        if (node.children.length === 0 && /^(•|Sincronizado em tempo real)$/.test(nodeText(node))) {
          return null;
        }
        if (
          node.children.length === 0 &&
          /^(Atleta Pro • 78.4 kg|Peso atual: 78.4 kg|Hipertrofia Fase 2)$/.test(nodeText(node))
        ) {
          return null;
        }
        if (node.children.length === 0 && nodeText(node) === '3.100 kcal') {
          return createElement(
            node.localName,
            props,
            state.goal?.kcal ? `${state.goal.kcal.toLocaleString(language)} kcal` : 'Não configurada',
          );
        }
        if (node.children.length === 0 && nodeText(node).startsWith('Hoje (')) {
          return createElement(
            node.localName,
            props,
            new Date(`${state.date}T12:00:00`).toLocaleDateString(language, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          );
        }
        if (node.children.length === 0 && nodeText(node) === '13:05') {
          return null;
        }
        if (node.children.length === 0 && nodeText(node) === 'Feedback do Atleta (Hoje)') {
          return createElement(node.localName, props, tr('Observações do dia'));
        }
        if (node.localName === 'h1') {
          return (
            <h1 {...props}>{localStorage.getItem('shapeup_user_name') || 'Diário Nutricional'}</h1>
          );
        }
        if (node === mealList) {
          return (
            <div {...props}>
              {state.loading ? (
                <p>Carregando diário…</p>
              ) : state.meals.length ? (
                state.meals.map((meal, index) =>
                  renderSource(
                    prototype!,
                    (item: Element, itemProps: Record<string, unknown>) => {
                      const text = nodeText(item);
                      if (
                        item.children.length === 0 &&
                        text === 'Pesagem aferida em balança de precisão'
                      ) {
                        return null;
                      }
                      if (item.localName === 'h2') {
                        return (
                          <h2 {...itemProps}>{`${tr('Refeição')} ${String(index + 1).padStart(2, '0')} — ${tr(slots[meal.mealSlot] || meal.mealSlot)}`}</h2>
                        );
                      }
                      if (item.localName === 'tbody') {
                        return (
                          <tbody {...itemProps}>
                            {(meal.items || []).map((entry) => (
                              <tr key={entry.id}>
                                <td className="py-2.5 font-medium">
                                  <button
                                    type="button"
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
                        );
                      }
                      if (item.localName === 'button' && text.includes('Adicionar Alimento')) {
                        itemProps.onClick = () => addFood(meal.mealSlot);
                      }
                      if (
                        item.children.length === 0 &&
                        /^(07:30|Confirmado pelo atleta às 08:15|580 kcal|42g|65g|16g)$/.test(text)
                      ) {
                        const totals = (meal.items || []).reduce(
                          (sum, entry) =>
                            macroKeys.reduce(
                              (next, key) => ({
                                ...next,
                                [key]: (sum[key] || 0) + (entry.computedMacros?.[key] || 0),
                              }),
                              {} as Record<string, number>,
                            ),
                          {} as Record<string, number>,
                        );
                        const value =
                          text === '07:30'
                            ? '—'
                            : text.startsWith('Confirmado')
                              ? 'Registrado no diário'
                              : `${Math.round(totals[macroPlaceholders[text] ?? 'kcal'] || 0)}${text.includes('kcal') ? ' kcal' : 'g'}`;
                        return createElement(item.localName, itemProps, value);
                      }
                    },
                    `meal-${index}`,
                  ),
                )
              ) : (
                <article className="p-5 bg-[#211A17] border border-[#3A2D27] rounded-lg">
                  <p>Nenhuma refeição registrada nesta data.</p>
                  <button className="mt-4 text-primary-container" type="button" onClick={() => addFood('Breakfast')}>
                    Adicionar Alimento
                  </button>
                </article>
              )}
            </div>
          );
        }
        if (node === metricSection) {
          return (
            <section {...props}>
              {[...node.children].map((metric, index) =>
                renderSource(
                  metric,
                  (item: Element, itemProps: Record<string, unknown>) => {
                    if (index >= macroKeys.length) {
                      if (item.classList.contains('text-2xl')) {
                        return createElement(
                          item.localName,
                          itemProps,
                          (water / 1000).toLocaleString(language),
                        );
                      }
                      if (item === metric.lastElementChild) {
                        return (
                          <button {...itemProps} type="button" onClick={addWater}>
                            +250 ml • Registrar água
                          </button>
                        );
                      }
                      if (
                        item.children.length === 0 &&
                        (/^\d+%$/.test(nodeText(item)) || nodeText(item).startsWith('/'))
                      ) {
                        return createElement(
                          item.localName,
                          itemProps,
                          nodeText(item).startsWith('/') ? 'litros registrados' : '',
                        );
                      }
                      if ((item as HTMLElement).style?.width) itemProps.style = { width: '0%' };
                      return;
                    }
                    const consumed = state.totals[macroKeys[index]] || 0;
                    const goal = state.goal?.[macroKeys[index]] || 0;
                    if (item.classList.contains('text-2xl')) {
                      return createElement(
                        item.localName,
                        itemProps,
                        Math.round(consumed).toLocaleString(language),
                      );
                    }
                    if (item.children.length === 0 && nodeText(item).startsWith('/')) {
                      return createElement(
                        item.localName,
                        itemProps,
                        `/ ${goal || '—'} ${index ? 'g' : 'kcal'}`,
                      );
                    }
                    if (item.children.length === 0 && /^\d+%$/.test(nodeText(item))) {
                      return createElement(
                        item.localName,
                        itemProps,
                        goal ? `${Math.round((consumed / goal) * 100)}%` : '—',
                      );
                    }
                    if ((item as HTMLElement).style?.width) {
                      itemProps.style = { width: `${goal ? Math.min(100, (consumed / goal) * 100) : 0}%` };
                    }
                    if (item === metric.lastElementChild) {
                      return createElement(
                        item.localName,
                        itemProps,
                        goal
                          ? `${tr('Restam')} ${Math.max(0, Math.round(goal - consumed))} ${index ? 'g' : 'kcal'}`
                          : 'Meta não configurada',
                      );
                    }
                  },
                  `metric-${index}`,
                ),
              )}
            </section>
          );
        }
        if (node.localName === 'button' && /Adicionar|Registrar|refeição/i.test(nodeText(node))) {
          props.onClick = () => addFood('Breakfast');
        }
        if (node.localName === 'div' && node.classList.contains('inline-flex') && nodeText(node).includes('Ontem')) {
          return (
            <div {...props} style={{ flexWrap: 'wrap', gap: 4 }}>
              <button
                type="button"
                className="px-2 py-1"
                aria-label={tr('Dia anterior')}
                onClick={() => {
                  const day = new Date(`${state.date}T12:00:00`);
                  day.setDate(day.getDate() - 1);
                  state.setDate(day.toLocaleDateString('en-CA'));
                }}
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
                className="px-2 py-1"
                aria-label={tr('Próximo dia')}
                onClick={() => {
                  const day = new Date(`${state.date}T12:00:00`);
                  day.setDate(day.getDate() + 1);
                  state.setDate(day.toLocaleDateString('en-CA'));
                }}
              >
                {tr('Próximo dia')} ›
              </button>
            </div>
          );
        }
        if (node.id === 'coach-note') {
          props.value = note;
          delete props.defaultValue;
          props.onChange = (event: { target: { value: string } }) => {
            setNotes((previous) => ({ ...previous, [noteKey]: event.target.value }));
            setSavedKey(null);
          };
        }
        if (node.localName === 'button' && /Salvar/.test(nodeText(node))) {
          props.onClick = () => {
            localStorage.setItem(noteKey, note);
            setSavedKey(noteKey);
          };
          if (saved) return <button {...props}>Salvo</button>;
        }
        if (node.localName === 'button' && /plano|meta/i.test(nodeText(node))) {
          props.onClick = () => navigate('/dashboard/nutrition/goal');
        }
        if (node.localName === 'button' && /chat|mensagem/i.test(nodeText(node))) {
          props.onClick = () => navigate('/dashboard/messages');
        }
      }}
    />
  );
}

export default function NutritionDiaryShell() {
  return (
    <DiaryDay
      renderView={(state) => <NutritionDiaryView {...(state as NutritionDiaryViewState)} />}
    />
  );
}
