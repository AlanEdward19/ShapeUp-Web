import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { withLang } from '../../../../test/withLang';
import MealPlanManager from '../MealPlanManager';

const mockCreateMealPlan = vi.fn();
const mockActivateMealPlan = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        createMealPlan: mockCreateMealPlan,
        activateMealPlan: mockActivateMealPlan,
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

describe('MealPlanManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

    it('creates and activates a meal plan filling the diary', async () => {
        const { getByTestId } = renderManager();

        fireEvent.change(getByTestId('plan-name-input'), { target: { value: 'Semana leve' } });
        fireEvent.change(getByTestId('plan-item-food-0'), { target: { value: 'food-1' } });
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
});
