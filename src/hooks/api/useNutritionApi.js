import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';
import { enqueueMutation } from '../../services/mutationQueue';
import { generateObjectId } from '../../utils/objectId';

export const useNutritionApi = () => {
    // --- FOODS ---
    const searchFoods = useCallback(async (query, cursor, pageSize) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (cursor) params.append('cursor', cursor);
        if (pageSize) params.append('pageSize', pageSize);
        return await apiClient(`/api/nutrition/foods?${params.toString()}`);
    }, []);

    const getFoodByBarcode = useCallback(async (barcode) => {
        return await apiClient(`/api/nutrition/foods/barcode/${encodeURIComponent(barcode)}`);
    }, []);

    const createFood = useCallback(async (command) => {
        return await apiClient('/api/nutrition/foods', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const createFoodOverride = useCallback(async (foodId, command) => {
        return await apiClient(`/api/nutrition/foods/${foodId}/override`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const setActiveFoodVersion = useCallback(async (foodId, command) => {
        return await apiClient(`/api/nutrition/foods/${foodId}/active-version`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteFood = useCallback(async (foodId) => {
        return await apiClient(`/api/nutrition/foods/${foodId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- DIARY ---
    const addDiaryEntry = useCallback((command) => {
        const id = command.id ?? generateObjectId();
        const body = { ...command, id };
        enqueueMutation({
            endpoint: '/api/nutrition/diary/entries',
            method: 'POST',
            body,
        });
        return id;
    }, []);

    const removeDiaryEntry = useCallback((entryId, date) => {
        const query = new URLSearchParams({ date });
        return enqueueMutation({
            endpoint: `/api/nutrition/diary/entries/${entryId}?${query.toString()}`,
            method: 'DELETE',
        });
    }, []);

    const getDiaryDay = useCallback(async (date) => {
        const query = new URLSearchParams({ date });
        return await apiClient(`/api/nutrition/diary?${query.toString()}`);
    }, []);

    const suggestSubstitutes = useCallback(async (date, entryId) => {
        const query = new URLSearchParams({ date, entryId });
        return await apiClient(`/api/nutrition/diary/substitutes?${query.toString()}`);
    }, []);

    const substituteDiaryItem = useCallback(async (entryId, command) => {
        return await apiClient(`/api/nutrition/diary/entries/${entryId}/substitute`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    // --- MEAL PLANS ---
    const createMealPlan = useCallback(async (command) => {
        return await apiClient('/api/nutrition/meal-plans', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const activateMealPlan = useCallback(async (mealPlanId, date) => {
        const query = new URLSearchParams({ date });
        return await apiClient(`/api/nutrition/meal-plans/${mealPlanId}/activate?${query.toString()}`, {
            method: 'POST'
        });
    }, []);

    // --- PROFILE ---
    const getNutritionProfile = useCallback(async () => {
        return await apiClient('/api/nutrition/profile');
    }, []);

    const completeOnboarding = useCallback(async (command) => {
        const activityAliases = { LightlyActive: 'Light', ModeratelyActive: 'Moderate', ExtraActive: 'VeryActive' };
        return await apiClient('/api/nutrition/profile/onboarding', {
            method: 'POST',
            body: JSON.stringify({ ...command, activityLevel: activityAliases[command.activityLevel] || command.activityLevel })
        });
    }, []);

    const setManualGoal = useCallback(async (command) => {
        return await apiClient('/api/nutrition/profile/goal', {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    // --- FOOD MODERATION (ADMIN) ---
    const getPendingModerations = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/nutrition/food-moderation/pending?${query.toString()}`);
    }, []);

    const decideModeration = useCallback(async (requestId, decision) => {
        return await apiClient(`/api/nutrition/food-moderation/${requestId}/decide`, {
            method: 'POST',
            body: JSON.stringify({ decision })
        });
    }, []);

    // --- WEIGHT TRACKING ---
    const upsertTargetWeight = useCallback(async (command) => {
        return await apiClient('/api/nutrition/weight/target', {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const upsertDailyWeightRegister = useCallback(async (command) => {
        return await apiClient('/api/nutrition/weight/registers', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const getWeightRegisters = useCallback(async (startDateUtc, endDateUtc) => {
        const query = new URLSearchParams();
        if (startDateUtc) query.append('startDateUtc', startDateUtc);
        if (endDateUtc) query.append('endDateUtc', endDateUtc);
        return await apiClient(`/api/nutrition/weight/registers?${query.toString()}`);
    }, []);

    return {
        // Foods
        searchFoods, getFoodByBarcode, createFood, createFoodOverride, setActiveFoodVersion, deleteFood,
        // Diary
        addDiaryEntry, removeDiaryEntry, getDiaryDay, suggestSubstitutes, substituteDiaryItem,
        // Meal Plans
        createMealPlan, activateMealPlan,
        // Profile
        getNutritionProfile, completeOnboarding, setManualGoal,
        // Moderation
        getPendingModerations, decideModeration,
        // Weight
        upsertTargetWeight, upsertDailyWeightRegister, getWeightRegisters,
    };
};
