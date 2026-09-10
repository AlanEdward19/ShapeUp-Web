import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/apiClient', () => ({
    apiClient: vi.fn(),
}));

vi.mock('../../../services/mutationQueue', () => ({
    enqueueMutation: vi.fn(() => 'mutation-id-1'),
}));

vi.mock('../../../utils/objectId', () => ({
    generateObjectId: vi.fn(() => 'generated-entry-id'),
}));

import { apiClient } from '../../../services/apiClient';
import { enqueueMutation } from '../../../services/mutationQueue';
import { generateObjectId } from '../../../utils/objectId';
import { useNutritionApi } from '../useNutritionApi';

const apiError = new Error('API failed');

describe('useNutritionApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiClient.mockResolvedValue({ ok: true });
        enqueueMutation.mockReturnValue('mutation-id-1');
        generateObjectId.mockReturnValue('generated-entry-id');
    });

    const runApiClientHappy = async (invoke) => {
        const { result } = renderHook(() => useNutritionApi());
        let response;
        await act(async () => {
            response = await invoke(result.current);
        });
        expect(response).toEqual({ ok: true });
    };

    const runApiClientError = async (invoke) => {
        apiClient.mockRejectedValueOnce(apiError);
        const { result } = renderHook(() => useNutritionApi());
        await expect(act(async () => invoke(result.current))).rejects.toThrow('API failed');
    };

    describe('searchFoods', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.searchFoods('rice', 'c1', 20));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods?query=rice&cursor=c1&pageSize=20');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.searchFoods('rice'));
        });
    });

    describe('getFoodByBarcode', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getFoodByBarcode('789123'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods/barcode/789123');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getFoodByBarcode('789123'));
        });
    });

    describe('createFood', () => {
        const command = { name: 'Rice', macrosPer100: { kcal: 130, proteinG: 2.7, carbG: 28, fatG: 0.3 } };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.createFood(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods', {
                method: 'POST',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.createFood(command));
        });
    });

    describe('createFoodOverride', () => {
        const command = { macrosPer100: { kcal: 120, proteinG: 2, carbG: 25, fatG: 0.2 } };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.createFoodOverride('food-1', command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods/food-1/override', {
                method: 'POST',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.createFoodOverride('food-1', command));
        });
    });

    describe('setActiveFoodVersion', () => {
        const command = { usePersonalOverride: true };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.setActiveFoodVersion('food-1', command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods/food-1/active-version', {
                method: 'PUT',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.setActiveFoodVersion('food-1', command));
        });
    });

    describe('deleteFood', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.deleteFood('food-1'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/foods/food-1', { method: 'DELETE' });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.deleteFood('food-1'));
        });
    });

    describe('addDiaryEntry', () => {
        const command = {
            date: '2026-09-10',
            mealSlot: 'breakfast',
            foodId: 'food-1',
            quantityGramsOrMl: 150,
        };

        it('happy path enqueues with generated id and never calls apiClient', () => {
            const { result } = renderHook(() => useNutritionApi());
            let entryId;
            act(() => {
                entryId = result.current.addDiaryEntry(command);
            });
            expect(entryId).toBe('generated-entry-id');
            expect(generateObjectId).toHaveBeenCalled();
            expect(enqueueMutation).toHaveBeenCalledWith({
                endpoint: '/api/nutrition/diary/entries',
                method: 'POST',
                body: { ...command, id: 'generated-entry-id' },
            });
            expect(apiClient).not.toHaveBeenCalled();
        });

        it('uses provided id without calling generateObjectId', () => {
            const { result } = renderHook(() => useNutritionApi());
            act(() => {
                result.current.addDiaryEntry({ ...command, id: 'preset-id' });
            });
            expect(generateObjectId).not.toHaveBeenCalled();
            expect(enqueueMutation).toHaveBeenCalledWith({
                endpoint: '/api/nutrition/diary/entries',
                method: 'POST',
                body: { ...command, id: 'preset-id' },
            });
        });

        it('error path propagates enqueueMutation failure', () => {
            enqueueMutation.mockImplementationOnce(() => {
                throw new Error('queue failed');
            });
            const { result } = renderHook(() => useNutritionApi());
            expect(() => result.current.addDiaryEntry(command)).toThrow('queue failed');
            expect(apiClient).not.toHaveBeenCalled();
        });
    });

    describe('removeDiaryEntry', () => {
        it('happy path enqueues delete', () => {
            const { result } = renderHook(() => useNutritionApi());
            let mutationId;
            act(() => {
                mutationId = result.current.removeDiaryEntry('entry-1', '2026-09-10');
            });
            expect(mutationId).toBe('mutation-id-1');
            expect(enqueueMutation).toHaveBeenCalledWith({
                endpoint: '/api/nutrition/diary/entries/entry-1?date=2026-09-10',
                method: 'DELETE',
            });
            expect(apiClient).not.toHaveBeenCalled();
        });

        it('error path propagates enqueueMutation failure', () => {
            enqueueMutation.mockImplementationOnce(() => {
                throw new Error('queue failed');
            });
            const { result } = renderHook(() => useNutritionApi());
            expect(() => result.current.removeDiaryEntry('entry-1', '2026-09-10')).toThrow('queue failed');
        });
    });

    describe('getDiaryDay', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getDiaryDay('2026-09-10'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/diary?date=2026-09-10');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getDiaryDay('2026-09-10'));
        });
    });

    describe('suggestSubstitutes', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.suggestSubstitutes('2026-09-10', 'entry-1'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/diary/substitutes?date=2026-09-10&entryId=entry-1');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.suggestSubstitutes('2026-09-10', 'entry-1'));
        });
    });

    describe('substituteDiaryItem', () => {
        const command = { date: '2026-09-10', replacementFoodId: 'food-2', quantityGramsOrMl: 100 };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.substituteDiaryItem('entry-1', command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/diary/entries/entry-1/substitute', {
                method: 'PUT',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.substituteDiaryItem('entry-1', command));
        });
    });

    describe('createMealPlan', () => {
        const command = { name: 'Weekday plan', items: [] };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.createMealPlan(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/meal-plans', {
                method: 'POST',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.createMealPlan(command));
        });
    });

    describe('activateMealPlan', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.activateMealPlan('plan-1', '2026-09-10'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/meal-plans/plan-1/activate?date=2026-09-10', {
                method: 'POST',
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.activateMealPlan('plan-1', '2026-09-10'));
        });
    });

    describe('getNutritionProfile', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getNutritionProfile());
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/profile');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getNutritionProfile());
        });
    });

    describe('completeOnboarding', () => {
        const command = { heightCm: 175, age: 30, biologicalSex: 'male', activityLevel: 'moderate' };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.completeOnboarding(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/profile/onboarding', {
                method: 'POST',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.completeOnboarding(command));
        });
    });

    describe('setManualGoal', () => {
        const command = { goal: { kcal: 2000, proteinG: 150, carbG: 200, fatG: 65 } };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.setManualGoal(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/profile/goal', {
                method: 'PUT',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.setManualGoal(command));
        });
    });

    describe('getPendingModerations', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getPendingModerations('c1', 10));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/food-moderation/pending?cursor=c1&pageSize=10');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getPendingModerations());
        });
    });

    describe('decideModeration', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.decideModeration('req-1', 'Approved'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/food-moderation/req-1/decide', {
                method: 'POST',
                body: JSON.stringify({ decision: 'Approved' }),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.decideModeration('req-1', 'Rejected'));
        });
    });

    describe('upsertTargetWeight', () => {
        const command = { targetWeight: 75, unit: 'metric' };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.upsertTargetWeight(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/weight/target', {
                method: 'PUT',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.upsertTargetWeight(command));
        });
    });

    describe('upsertDailyWeightRegister', () => {
        const command = { weight: 74.5, dateUtc: '2026-09-10T12:00:00.000Z' };
        it('happy path', async () => {
            await runApiClientHappy((api) => api.upsertDailyWeightRegister(command));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/weight/registers', {
                method: 'POST',
                body: JSON.stringify(command),
            });
        });
        it('error path', async () => {
            await runApiClientError((api) => api.upsertDailyWeightRegister(command));
        });
    });

    describe('getWeightRegisters', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getWeightRegisters('2026-09-01', '2026-09-10'));
            expect(apiClient).toHaveBeenCalledWith('/api/nutrition/weight/registers?startDateUtc=2026-09-01&endDateUtc=2026-09-10');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getWeightRegisters('2026-09-01', '2026-09-10'));
        });
    });
});
