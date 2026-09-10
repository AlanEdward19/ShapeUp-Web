import React, { useState } from 'react';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const emptyItem = () => ({ mealSlot: 'Breakfast', foodId: '', quantityGramsOrMl: '100' });

const toDateKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const MealPlanManager = () => {
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
            setError(err.message || 'Falha ao criar cardápio');
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
            setError(err.message || 'Falha ao ativar cardápio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <h1 className="su-page-title su-mb-6">Cardápio fixo</h1>

            <Card className="su-mb-4" data-testid="meal-plan-form">
                <h3 className="su-section-title su-mb-4">Criar cardápio</h3>
                <form onSubmit={handleCreate}>
                    <Input
                        label="Nome do cardápio"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="plan-name-input"
                    />

                    {items.map((item, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <select
                                className="su-input"
                                value={item.mealSlot}
                                onChange={(e) => updateItem(index, 'mealSlot', e.target.value)}
                                data-testid={`plan-item-slot-${index}`}
                            >
                                {MEAL_SLOTS.map((slot) => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                            <Input
                                label="Food ID"
                                value={item.foodId}
                                onChange={(e) => updateItem(index, 'foodId', e.target.value)}
                                data-testid={`plan-item-food-${index}`}
                            />
                            <Input
                                label="Qtd (g)"
                                type="number"
                                value={item.quantityGramsOrMl}
                                onChange={(e) => updateItem(index, 'quantityGramsOrMl', e.target.value)}
                                data-testid={`plan-item-qty-${index}`}
                            />
                        </div>
                    ))}

                    <Button type="button" variant="secondary" onClick={addItem} className="su-mb-4">
                        + Adicionar item
                    </Button>

                    {error && <p className="su-input-error-text" role="alert">{error}</p>}

                    <Button type="submit" disabled={loading || !name.trim()} data-testid="create-plan-btn">
                        {loading ? 'Salvando...' : 'Criar cardápio'}
                    </Button>
                </form>
            </Card>

            {createdPlan && (
                <Card data-testid="created-plan-card">
                    <h3 className="su-section-title su-mb-4">Cardápio criado: {createdPlan.name}</h3>
                    <p className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>
                        {createdPlan.items?.length ?? 0} itens · ID: {createdPlan.id}
                    </p>
                    <Button onClick={handleActivate} disabled={loading} data-testid="activate-plan-btn">
                        Ativar para hoje
                    </Button>
                </Card>
            )}

            {activationResult && (
                <Card className="su-mt-4" data-testid="activation-result">
                    <h3 className="su-section-title su-mb-4">Diário preenchido</h3>
                    <p className="su-text-muted">
                        Totais do dia: {activationResult.diaryDay?.totals?.kcal ?? 0} kcal,
                        P {activationResult.diaryDay?.totals?.proteinG ?? 0}g
                    </p>
                    {(activationResult.unavailableItems?.length ?? 0) > 0 && (
                        <p className="su-warning-text" style={{ fontSize: '0.875rem' }}>
                            {activationResult.unavailableItems.length} item(ns) indisponível(is) — use substituição no diário.
                        </p>
                    )}
                </Card>
            )}
        </div>
    );
};

export default MealPlanManager;
