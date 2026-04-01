import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useUserManagementApi = () => {
    const getMe = useCallback(async () => {
        return await apiClient('/api/users/me', {
            method: 'GET'
        });
    }, []);

    const getUserById = useCallback(async (id) => {
        return await apiClient(`/api/users/${id}`, {
            method: 'GET'
        });
    }, []);

    const logoutSession = useCallback(async () => {
        return await apiClient('/api/users/logout', {
            method: 'POST'
        });
    }, []);

    return {
        getMe,
        getUserById,
        logoutSession
    };
};
