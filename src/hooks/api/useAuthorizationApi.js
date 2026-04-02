import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useAuthorizationApi = () => {
    // --- USERS ---
    const getUserById = useCallback(async (id) => {
        return await apiClient(`/api/users/${id}`);
    }, []);

    const getMe = useCallback(async () => {
        return await apiClient('/api/users/me');
    }, []);

    const logout = useCallback(async () => {
        return await apiClient('/api/users/logout', {
            method: 'POST'
        });
    }, []);

    const updateUserRole = useCallback(async (groupId, userId, command) => {
        return await apiClient(`/api/groups/${groupId}/members/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    // --- SCOPES ---
    const getScopes = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/scopes?${query.toString()}`);
    }, []);

    const createScope = useCallback(async (command) => {
        return await apiClient('/api/scopes', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const getScopesByUser = useCallback(async (userId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/scopes/user/${userId}?${query.toString()}`);
    }, []);

    const assignScopeToUser = useCallback(async (userId, command) => {
        return await apiClient(`/api/scopes/assign-to-user/${userId}`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const removeScopeFromUser = useCallback(async (userId, command) => {
        return await apiClient(`/api/scopes/remove-from-user/${userId}`, {
            method: 'DELETE',
            body: JSON.stringify(command)
        });
    }, []);

    const syncUserScopes = useCallback(async (userId) => {
        return await apiClient(`/api/scopes/sync/user/${userId}`, { method: 'POST' });
    }, []);

    const syncMyScopes = useCallback(async () => {
        return await apiClient('/api/scopes/sync/me', { method: 'POST' });
    }, []);

    const assignScopeToGroup = useCallback(async (groupId, command) => {
        return await apiClient(`/api/groups/${groupId}/scopes`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    // --- GROUPS ---
    const getGroups = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/groups?${query.toString()}`);
    }, []);

    const getGroupById = useCallback(async (groupId) => {
        return await apiClient(`/api/groups/${groupId}`);
    }, []);

    const createGroup = useCallback(async (command) => {
        return await apiClient('/api/groups', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteGroup = useCallback(async (groupId) => {
        return await apiClient(`/api/groups/${groupId}`, {
            method: 'DELETE'
        });
    }, []);

    const addUserToGroup = useCallback(async (groupId, command) => {
        return await apiClient(`/api/groups/${groupId}/members`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const removeUserFromGroup = useCallback(async (groupId, userId) => {
        return await apiClient(`/api/groups/${groupId}/members/${userId}`, {
            method: 'DELETE'
        });
    }, []);

    return {
        // Users
        getUserById, getMe, logout, updateUserRole,
        // Scopes
        getScopes, createScope, getScopesByUser, assignScopeToUser, removeScopeFromUser, syncUserScopes, syncMyScopes, assignScopeToGroup,
        // Groups
        getGroups, getGroupById, createGroup, deleteGroup, addUserToGroup, removeUserFromGroup
    };
};
