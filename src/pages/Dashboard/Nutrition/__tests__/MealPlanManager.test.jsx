import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { withLang } from '../../../../test/withLang';
import MealPlanManager from '../MealPlanManager';

const mockCreateMealPlan = vi.fn();
const mockActivateMealPlan = vi.fn();
const mockSearchFoods = vi.fn();
let mockLinked = false;

vi.mock('../../../../hooks/useNutritionist', () => ({
    default: () => ({ linked: mockLinked, loading: false }),
}));

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        createMealPlan: mockCreateMealPlan,
        activateMealPlan: mockActivateMealPlan,
        searchFoods: mockSearchFoods,
    }),
}));

const renderManager = () =>
        render(
            withLang(
            <MemoryRouter>
                <MealPlanManager />
            </MemoryRouter>
            )
        );

const pickFood = async (getByTestId, findByRole) => {
    fireEvent.change(getByTestId('plan-item-food-0'), { target: { value: 'arroz' } });
    fireEvent.click(await findByRole('option', { name: /Arroz branco/ }));
};

describe('MealPlanManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLinked = false;
        mockSearchFoods.mockResolvedValue({ items: [{ id: 'food-1', name: 'Arroz branco', macrosPer100: { kcal: 130 } }] });
        mockCreateMealPlan.mockResolvedValue({
            id: 'plan-1',
            name: 'Semana leve',
            items: [{ mealSlot: 'Breakfast', foodId: 'food-1', quantityGramsOrMl: 100 }],
        });
        mockActivateMealPlan.mockResolvedValue({
            plan: { id: 'plan-1', name: 'Semana leve' },
            diaryDay: { totals: { kcal: 130, proteinG: 3, carbG: 28, fatG: 1 } },
            unavailableItems: [],
        });
    });

    it('shows card skeleton while plan creation is pending', async () => {
        let resolveCreate;
        mockCreateMealPlan.mockImplementation(
            () => new Promise((resolve) => { resolveCreate = resolve; }),
        );

        const { getByTestId, findByRole } = renderManager();
        fireEvent.change(getByTestId('plan-name-input'), { target: { value: 'Semana leve' } });
        await pickFood(getByTestId, findByRole);
        fireEvent.click(getByTestId('create-plan-btn'));

        expect(getByTestId('skeleton')).toHaveAttribute('data-variant', 'card');
        resolveCreate({
            id: 'plan-1',
            name: 'Semana leve',
            items: [{ mealSlot: 'Breakfast', foodId: 'food-1', quantityGramsOrMl: 100 }],
        });
        await waitFor(() => {
            expect(getByTestId('created-plan-card')).toBeInTheDocument();
        });
    });

    it('groups add and submit actions in su-form-actions', () => {
        const { getByTestId } = renderManager();
        expect(getByTestId('meal-plan-form-actions')).toHaveClass('su-form-actions');
    });

    it('creates and activates a meal plan filling the diary', async () => {
        const { getByTestId, findByRole } = renderManager();

        fireEvent.change(getByTestId('plan-name-input'), { target: { value: 'Semana leve' } });
        await pickFood(getByTestId, findByRole);
        fireEvent.click(getByTestId('create-plan-btn'));

        await waitFor(() => {
            expect(getByTestId('created-plan-card')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('activate-plan-btn'));

        await waitFor(() => {
            expect(mockActivateMealPlan).toHaveBeenCalledWith('plan-1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
            expect(getByTestId('activation-result')).toHaveTextContent('130 kcal');
        });
    });

    it('locks plan editing when a nutritionist is linked', () => {
        mockLinked = true;
        const { getByTestId, queryByTestId } = renderManager();
        expect(getByTestId('meal-plan-locked')).toBeInTheDocument();
        expect(queryByTestId('meal-plan-form')).not.toBeInTheDocument();
    });
});
