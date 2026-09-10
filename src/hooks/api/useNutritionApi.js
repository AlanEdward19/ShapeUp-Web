import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useNutritionApi = () => {
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
        upsertTargetWeight,
        upsertDailyWeightRegister,
        getWeightRegisters
    };
};
