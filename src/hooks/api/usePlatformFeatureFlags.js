import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const usePlatformFeatureFlags = () => {
    const getFeatureFlags = useCallback(async () => {
        return await apiClient('/api/platform/feature-flags');
    }, []);

    const putFeatureFlag = useCallback(async (key, enabled) => {
        return await apiClient(`/api/platform/feature-flags/${encodeURIComponent(key)}`, {
            method: 'PUT',
            body: JSON.stringify({ enabled }),
        });
    }, []);

    return {
        getFeatureFlags,
        putFeatureFlag,
    };
};
