import React, { useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const emptyItem = () => ({ mealSlot: 'Breakfast', foodId: '', quantityGramsOrMl: '100' });

const toDateKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const MealPlanManager = () => {
    const { t } = useLanguage();
    const { createMealPlan, activateMealPlan } = useNutritionApi();
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
            <NutritionNav />
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.plan.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.plan.title')}</h1>
                </div>
            </header>

            <section className="su-journal-sheet" data-testid="meal-plan-form">
                <h3 className="su-ledger-heading">{t('nutrition.plan.create')}</h3>
                <form onSubmit={handleCreate}>
                    <Input
                        label={t('nutrition.plan.name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="plan-name-input"
                    />

                    {items.map((item, index) => (
                        <div key={index} className="su-plan-item-row">
                            <select
                                className="su-input"
                                value={item.mealSlot}
                                onChange={(e) => updateItem(index, 'mealSlot', e.target.value)}
                                data-testid={`plan-item-slot-${index}`}
                            >
                                {MEAL_SLOTS.map((slot) => (
                                    <option key={slot} value={slot}>{t(`nutrition.meal.${slot}`)}</option>
                                ))}
                            </select>
                            <Input
                                label={t('nutrition.plan.food_id')}
                                value={item.foodId}
                                onChange={(e) => updateItem(index, 'foodId', e.target.value)}
                                data-testid={`plan-item-food-${index}`}
                            />
                            <Input
                                label={t('nutrition.plan.qty')}
                                type="number"
                                value={item.quantityGramsOrMl}
                                onChange={(e) => updateItem(index, 'quantityGramsOrMl', e.target.value)}
                                data-testid={`plan-item-qty-${index}`}
                            />
                        </div>
                    ))}

                    <Button type="button" variant="secondary" onClick={addItem} className="su-mb-4">
                        {t('nutrition.plan.add')}
                    </Button>

                    {error && <p className="su-input-error-text" role="alert">{error}</p>}

                    <Button type="submit" disabled={loading || !name.trim()} data-testid="create-plan-btn">
                        {loading ? t('nutrition.form.saving') : t('nutrition.plan.submit')}
                    </Button>
                </form>
            </section>

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
