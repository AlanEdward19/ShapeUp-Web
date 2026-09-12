import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NutritionNav from './NutritionNav';
import SubstituteItemModal from './SubstituteItemModal';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import { isMacroGoalMet } from './nutritionUtils';
import './Nutrition.css';
import DiarySidebar from './DiarySidebar';
import HydrationMetric from '../../../components/HydrationMetric';
import { Link } from 'react-router-dom';

const MACRO_KEYS = [
    { key: 'kcal', labelKey: 'nutrition.macro.kcal', color: '#e06c43', informational: true },
    { key: 'proteinG', labelKey: 'nutrition.macro.protein', color: '#8da77b' },
    { key: 'carbG', labelKey: 'nutrition.macro.carb', color: '#d4a359' },
    { key: 'fatG', labelKey: 'nutrition.macro.fat', color: '#9d8b81' },
];

const toDateKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const MacroProgressBar = ({ label, consumed, goal, color, informational, infoLabel }) => {
    const percent = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
    return (
        <div className="su-macro-cell" data-testid={`macro-progress-${label}`}>
            <div className="su-macro-meta">
                <span className="su-macro-label" title={informational ? infoLabel : undefined}>{label}</span>
                <span className="su-macro-percentage">{goal ? `${percent}%` : '—'}</span>
            </div>
<div className="su-macro-nums"><strong>{consumed}</strong><small> / {goal || '—'} {informational ? 'kcal' : 'g'}</small></div>
            <div
                className="su-macro-track"
                role="progressbar"
                aria-valuenow={consumed}
                aria-valuemin={0}
                aria-valuemax={goal || 100}
            >
                <div
                    className="su-macro-fill"
                    style={{ width: `${percent}%`, background: color }}
                />
            </div>
            <p className="su-macro-remaining">{goal ? `${Math.max(0, goal - consumed)} ${informational ? 'kcal' : 'g'} restantes` : 'Meta não configurada'}</p>
        </div>
    );
};

const DiaryDay = ({ renderView } = {}) => {
    const { t } = useLanguage();
    const { getDiaryDay, getNutritionProfile, removeDiaryEntry } = useNutritionApi();
    const [date, setDate] = useState(toDateKey());
    const [diary, setDiary] = useState(null);
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [substituteEntry, setSubstituteEntry] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [dayData, profile] = await Promise.all([
                getDiaryDay(date),
                getNutritionProfile(),
            ]);
            setDiary(dayData);
            setGoal(profile?.activeGoal ?? null);
        } catch (err) {
            console.error('Failed to load diary', err);
            setDiary({ date, meals: [], totals: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 } });
        } finally {
            setLoading(false);
        }
    }, [date, getDiaryDay, getNutritionProfile]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totals = diary?.totals ?? { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 };
    const meals = diary?.meals ?? [];
    const isEmpty = meals.length === 0 || meals.every((m) => !m.items?.length);
    const goalMet = useMemo(() => isMacroGoalMet(totals, goal), [totals, goal]);

    const handleRemove = async (entryId) => {
        await removeDiaryEntry(entryId, date);
        await loadData();
    };

    if (renderView) return renderView({ date, setDate, diary, goal, loading, totals, meals, handleRemove, setSubstituteEntry, loadData });
    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.diary.kicker')}</span>
                    <h1 className="su-page-title">{localStorage.getItem('shapeup_user_name') || t('nutrition.diary.title')}</h1><p className="su-text-muted su-diary-prescribed-goal">Meta diária prescrita: <strong>{goal?.kcal ? `${goal.kcal.toLocaleString('pt-BR')} kcal` : 'Não configurada'}</strong></p>
                </div>
                <input
                    type="date"
                    className="su-input su-nutrition-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="diary-date-input"
                />
            </header>

            {goalMet && (
                <div className="su-goal-banner" data-testid="goal-celebration">
                    <span className="su-goal-stamp">{t('nutrition.diary.hit_stamp')}</span>
                    <div>
                        <strong>{t('nutrition.diary.hit')}</strong>
                        <p className="su-text-muted">{t('nutrition.diary.hit_body')}</p>
                    </div>
                </div>
            )}

            <section className="su-journal-sheet su-diary-macro-summary" data-testid="macro-summary">
                <h3 className="su-ledger-heading">{t('nutrition.diary.progress')}</h3>
                <div className="su-macro-ledger">
                    {MACRO_KEYS.map(({ key, labelKey, color, informational }) => (
                        <MacroProgressBar
                            key={key}
                            label={t(labelKey)}
                            consumed={totals[key] ?? 0}
                            goal={goal?.[key] ?? 0}
                            color={color}
                            informational={informational}
                            infoLabel={t('nutrition.diary.info')}
                        />
                    ))}
                    <HydrationMetric key={date} date={date} />
                </div>
                {!goal && (
                    <p className="su-text-muted" data-testid="no-goal-hint">
                        {t('nutrition.diary.no_goal')}
                    </p>
                )}
            </section>

            <div className="su-diary-layout"><div className="su-diary-meals">
            {loading ? (
                <p className="su-text-muted">{t('nutrition.diary.loading')}</p>
            ) : isEmpty ? (
                <section className="su-empty-ledger" data-testid="empty-day">
                    <p className="su-text-muted" style={{ margin: 0 }}>
                        {t('nutrition.diary.empty')}
                    </p>
                </section>
            ) : (
                meals.map((meal, mealIndex) => (
                    <section key={meal.mealSlot} className="su-journal-sheet" data-testid={`meal-${meal.mealSlot}`}>
                        <h3 className="su-ledger-heading">
                            Refeição {String(mealIndex + 1).padStart(2, '0')} — {t(`nutrition.meal.${meal.mealSlot}`) || meal.mealSlot}
                        </h3>
                        {meal.items?.length === 0 ? (
                            <p className="su-text-muted">{t('nutrition.diary.empty_meal')}</p>
                        ) : (
                            <div className="su-meal-table-scroll"><table className="su-meal-table"><thead><tr><th>Alimento / item</th><th>Porção</th><th>Calorias</th><th>P</th><th>C</th><th>G</th><th><span className="su-visually-hidden">Ações</span></th></tr></thead><tbody>{meal.items.map(item => <tr key={item.id} data-testid={`diary-entry-${item.id}`}><td><strong>{item.foodName || item.food?.namePt || item.food?.name || item.foodId}</strong>{item.usesOverride && <small>{t('nutrition.diary.override')}</small>}</td><td>{item.quantityGramsOrMl}g</td><td><strong>{item.computedMacros?.kcal ?? 0} kcal</strong></td><td>{item.computedMacros?.proteinG ?? 0}g</td><td>{item.computedMacros?.carbG ?? 0}g</td><td>{item.computedMacros?.fatG ?? 0}g</td><td><div className="su-meal-item-actions"><button type="button" title={t('nutrition.diary.substitute')} aria-label={t('nutrition.diary.substitute')} onClick={() => setSubstituteEntry(item)} data-testid={`substitute-btn-${item.id}`}>⇄</button><button type="button" title={t('nutrition.diary.remove')} aria-label={t('nutrition.diary.remove')} onClick={() => handleRemove(item.id)}>×</button></div></td></tr>)}</tbody></table></div>
                        )}
                        <footer className="su-meal-footer"><Link to="/dashboard/nutrition/foods">+ Adicionar alimento</Link><span>{meal.items?.reduce((sum, item) => sum + (item.computedMacros?.kcal || 0), 0)} kcal registradas</span></footer>
                    </section>
                ))
            )}

            </div><DiarySidebar key={date} date={date} goal={goal} totals={totals} /></div>
            {substituteEntry && (
                <SubstituteItemModal
                    entry={substituteEntry}
                    date={date}
                    onClose={() => setSubstituteEntry(null)}
                    onSubstituted={() => {
                        setSubstituteEntry(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default DiaryDay;
