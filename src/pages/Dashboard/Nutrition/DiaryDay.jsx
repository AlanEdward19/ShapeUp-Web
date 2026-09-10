import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PartyPopper } from 'lucide-react';
import Card from '../../../components/Card';
import NutritionNav from './NutritionNav';
import SubstituteItemModal from './SubstituteItemModal';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

const MEAL_SLOT_LABELS = {
    Breakfast: 'Café da manhã',
    Lunch: 'Almoço',
    Dinner: 'Jantar',
    Snack: 'Lanche',
};

const MACRO_FIELDS = [
    { key: 'proteinG', label: 'Proteína', color: 'var(--primary)' },
    { key: 'carbG', label: 'Carboidrato', color: 'var(--accent)' },
    { key: 'fatG', label: 'Gordura', color: 'var(--warning)' },
    { key: 'kcal', label: 'Kcal', color: 'var(--success)', informational: true },
];

const toDateKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const isMacroGoalMet = (totals, goal) => {
    if (!goal || !totals) return false;
    const tolerance = 0.1;
    return ['proteinG', 'carbG', 'fatG'].every((macro) => {
        const target = goal[macro];
        const consumed = totals[macro] ?? 0;
        if (!target || target <= 0) return false;
        return Math.abs(consumed - target) / target <= tolerance;
    });
};

const MacroProgressBar = ({ label, consumed, goal, color, informational }) => {
    const percent = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
    return (
        <div className="su-mb-3" data-testid={`macro-progress-${label}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>{label}{informational ? ' (info)' : ''}</span>
                <span>{consumed} / {goal || '—'}</span>
            </div>
            <div
                role="progressbar"
                aria-valuenow={consumed}
                aria-valuemin={0}
                aria-valuemax={goal || 100}
                style={{ height: '0.5rem', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
            >
                <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
            </div>
        </div>
    );
};

const DiaryDay = () => {
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

    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="su-page-title" style={{ margin: 0 }}>Diário alimentar</h1>
                <input
                    type="date"
                    className="su-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="diary-date-input"
                    style={{ width: 'auto' }}
                />
            </div>

            {goalMet && (
                <Card className="su-mb-4" data-testid="goal-celebration" style={{ background: 'rgba(var(--success-rgb, 34, 197, 94), 0.1)', borderColor: 'var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PartyPopper size={24} className="su-success-text" />
                        <div>
                            <strong>Meta batida!</strong>
                            <p className="su-text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                                Parabéns — seus macros estão dentro da tolerância de hoje.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="su-mb-4" data-testid="macro-summary">
                <h3 className="su-section-title su-mb-4">Progresso do dia</h3>
                {MACRO_FIELDS.map(({ key, label, color, informational }) => (
                    <MacroProgressBar
                        key={key}
                        label={label}
                        consumed={totals[key] ?? 0}
                        goal={goal?.[key] ?? 0}
                        color={color}
                        informational={informational}
                    />
                ))}
                {!goal && (
                    <p className="su-text-muted" style={{ fontSize: '0.85rem' }} data-testid="no-goal-hint">
                        Defina uma meta em &quot;Meta&quot; para ver o progresso.
                    </p>
                )}
            </Card>

            {loading ? (
                <p className="su-text-muted">Carregando...</p>
            ) : isEmpty ? (
                <Card data-testid="empty-day">
                    <p className="su-text-muted" style={{ margin: 0 }}>
                        Nenhuma refeição registrada neste dia. Adicione alimentos ou ative um cardápio fixo.
                    </p>
                </Card>
            ) : (
                meals.map((meal) => (
                    <Card key={meal.mealSlot} className="su-mb-4" data-testid={`meal-${meal.mealSlot}`}>
                        <h3 className="su-section-title su-mb-4">
                            {MEAL_SLOT_LABELS[meal.mealSlot] ?? meal.mealSlot}
                        </h3>
                        {meal.items?.length === 0 ? (
                            <p className="su-text-muted">Sem itens</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {meal.items.map((item) => (
                                    <li
                                        key={item.id}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}
                                        data-testid={`diary-entry-${item.id}`}
                                    >
                                        <div>
                                            <span>{item.foodId}</span>
                                            <span className="su-text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                                                {item.quantityGramsOrMl}g{item.usesOverride ? ' (sua versão)' : ''}
                                            </span>
                                            <div className="su-text-muted" style={{ fontSize: '0.8rem' }}>
                                                {item.computedMacros?.kcal} kcal · P {item.computedMacros?.proteinG}g
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                className="su-btn su-btn-secondary"
                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                                onClick={() => setSubstituteEntry(item)}
                                                data-testid={`substitute-btn-${item.id}`}
                                            >
                                                Substituir
                                            </button>
                                            <button
                                                type="button"
                                                className="su-btn su-btn-secondary"
                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                                onClick={() => handleRemove(item.id)}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                ))
            )}

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
