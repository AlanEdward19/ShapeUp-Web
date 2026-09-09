import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useGamificationApi = () => {
    const getGamificationProfile = useCallback(async () => {
        return await apiClient('/api/gamification/me');
    }, []);

    const getRanking = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gamification/ranking?${query.toString()}`);
    }, []);

    return {
        getGamificationProfile,
        getRanking
    };
};
