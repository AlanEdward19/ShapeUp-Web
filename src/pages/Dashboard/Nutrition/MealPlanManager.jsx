import React, { useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import Skeleton from '../../../components/Skeleton';
import FoodPicker from './FoodPicker';
import useNutritionist from '../../../hooks/useNutritionist';
import './Nutrition.css';

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const emptyItem = () => ({ mealSlot: 'Breakfast', foodId: '', foodName: '', quantityGramsOrMl: '100' });

const lockedCopy = {
    'pt-BR': ['Cardápio definido pelo seu nutricionista', 'Você pode registrar alimentos extras no diário a qualquer momento, mas as refeições do plano só mudam pelo seu nutricionista.'],
    en: ['Meal plan set by your nutritionist', 'You can still log extra foods in your diary, but the plan meals can only be changed by your nutritionist.'],
    es: ['Menú definido por tu nutricionista', 'Aún puedes registrar alimentos extra en el diario, pero las comidas del plan solo las cambia tu nutricionista.'],
};

const toDateKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const MealPlanManager = () => {
    const { t, language } = useLanguage();
    const slotLabel = { 'pt-BR': 'Refeição', en: 'Meal', es: 'Comida' }[language] || 'Refeição';
    const { createMealPlan, activateMealPlan } = useNutritionApi();
    const { linked } = useNutritionist();
    const [lockedTitle, lockedBody] = lockedCopy[language] || lockedCopy['pt-BR'];
    const [name, setName] = useState('');
    const [items, setItems] = useState([emptyItem()]);
    const [createdPlan, setCreatedPlan] = useState(null);
    const [activationResult, setActivationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateItem = (index, field, value) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addItem = () => setItems((prev) => [...prev, emptyItem()]);
    const removeItem = (index) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    const ready = name.trim() && items.every((item) => item.foodId && parseFloat(item.quantityGramsOrMl) > 0);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                items: items.map((item) => ({
                    mealSlot: item.mealSlot,
                    foodId: item.foodId.trim(),
                    quantityGramsOrMl: parseFloat(item.quantityGramsOrMl),
                })),
            };
            const plan = await createMealPlan(payload);
            setCreatedPlan(plan);
            setActivationResult(null);
        } catch (err) {
            setError(err.message || t('nutrition.plan.error.create'));
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!createdPlan?.id) return;
        setLoading(true);
        setError('');
        try {
            const result = await activateMealPlan(createdPlan.id, toDateKey());
            setActivationResult(result);
        } catch (err) {
            setError(err.message || t('nutrition.plan.error.activate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-nutrition-page">
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.plan.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.plan.title')}</h1>
                </div>
            </header>

            {linked ? (
                <section className="su-plan-locked" role="status" data-testid="meal-plan-locked">
                    <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                    <div>
                        <p><strong>{lockedTitle}</strong></p>
                        <p>{lockedBody}</p>
                    </div>
                </section>
            ) : (
            <section className="su-journal-sheet" data-testid="meal-plan-form">
                <h3 className="su-ledger-heading">{t('nutrition.plan.create')}</h3>
                {loading ? (
                    <Skeleton variant="card" />
                ) : (
                <form onSubmit={handleCreate}>
                    <Input
                        id="plan-name"
                        label={t('nutrition.plan.name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="plan-name-input"
                    />

                    <div className="su-plan-items">
                        {items.map((item, index) => (
                            <div key={index} className="su-plan-item-row">
                                <div className="su-input-group">
                                    <label className="su-input-label" htmlFor={`plan-slot-${index}`}>{slotLabel}</label>
                                    <select
                                        id={`plan-slot-${index}`}
                                        className="su-input"
                                        value={item.mealSlot}
                                        onChange={(e) => updateItem(index, 'mealSlot', e.target.value)}
                                        data-testid={`plan-item-slot-${index}`}
                                    >
                                        {MEAL_SLOTS.map((slot) => (
                                            <option key={slot} value={slot}>{t(`nutrition.meal.${slot}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <FoodPicker
                                    testId={`plan-item-food-${index}`}
                                    value={item}
                                    onSelect={(food) => setItems((prev) => prev.map((entry, i) => (i === index
                                        ? { ...entry, foodId: food?.foodId ?? '', foodName: food?.foodName ?? '' }
                                        : entry)))}
                                />
                                <Input
                                    id={`plan-qty-${index}`}
                                    label={t('nutrition.plan.qty')}
                                    type="number"
                                    min="1"
                                    inputMode="decimal"
                                    value={item.quantityGramsOrMl}
                                    onChange={(e) => updateItem(index, 'quantityGramsOrMl', e.target.value)}
                                    data-testid={`plan-item-qty-${index}`}
                                />
                                {items.length > 1 && (
                                    <button type="button" className="su-plan-item-remove" onClick={() => removeItem(index)} aria-label="Remover item">×</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {error && <p className="su-input-error-text" role="alert">{error}</p>}

                    <div className="su-form-actions" data-testid="meal-plan-form-actions">
                        <Button type="button" variant="secondary" onClick={addItem}>
                            {t('nutrition.plan.add')}
                        </Button>
                        <Button type="submit" disabled={loading || !ready} data-testid="create-plan-btn">
                            {loading ? t('nutrition.form.saving') : t('nutrition.plan.submit')}
                        </Button>
                    </div>
                </form>
                )}
            </section>
            )}

            {createdPlan && (
                <section className="su-journal-sheet" data-testid="created-plan-card">
                    <h3 className="su-ledger-heading">{t('nutrition.plan.created', { name: createdPlan.name })}</h3>
                    <p className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>
                        {t('nutrition.plan.items_count', { n: createdPlan.items?.length ?? 0, id: createdPlan.id })}
                    </p>
                    <Button onClick={handleActivate} disabled={loading} data-testid="activate-plan-btn">
                        {t('nutrition.plan.activate')}
                    </Button>
                </section>
            )}

            {activationResult && (
                <section className="su-journal-sheet" data-testid="activation-result">
                    <h3 className="su-ledger-heading">{t('nutrition.plan.filled')}</h3>
                    <p className="su-text-muted">
                        {t('nutrition.plan.totals', {
                            kcal: activationResult.diaryDay?.totals?.kcal ?? 0,
                            protein: activationResult.diaryDay?.totals?.proteinG ?? 0,
                        })}
                    </p>
                    {(activationResult.unavailableItems?.length ?? 0) > 0 && (
                        <p className="su-warning-text" style={{ fontSize: '0.875rem' }}>
                            {t('nutrition.plan.unavailable', { n: activationResult.unavailableItems.length })}
                        </p>
                    )}
                </section>
            )}
        </div>
    );
};

export default MealPlanManager;
