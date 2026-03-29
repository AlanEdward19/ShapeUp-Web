import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useAuditLogsApi = () => {
    // --- AUDIT LOGS ---
    const getAuditLogs = useCallback(async (params) => {
        const query = new URLSearchParams();
        if (params?.Cursor) query.append('Cursor', params.Cursor);
        if (params?.PageSize) query.append('PageSize', params.PageSize);
        if (params?.Endpoint) query.append('Endpoint', params.Endpoint);
        if (params?.Method) query.append('Method', params.Method);
        if (params?.UserEmail) query.append('UserEmail', params.UserEmail);
        
        return await apiClient(`/api/audit-logs?${query.toString()}`);
    }, []);

    return {
        getAuditLogs
    };
};
