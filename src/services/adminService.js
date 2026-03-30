import { apiClient } from './apiClient';

/**
 * Admin Service - Integrates with UserManagement, Scopes, Group, and Exercises
 * as specified in ShapeUp.json (Swagger).
 */

// --- User Management ---
export const getUsers = async (cursor = '', pageSize = 20) => {
    return apiClient(`/api/users?cursor=${cursor}&pageSize=${pageSize}`);
};

export const getUserById = async (id) => {
    return apiClient(`/api/users/${id}`);
};

export const deleteUser = async (id) => {
    return apiClient(`/api/users/${id}`, { method: 'DELETE' });
};

// --- Scopes Management ---
export const getScopes = async (cursor = '', pageSize = 50) => {
    return apiClient(`/api/scopes?cursor=${cursor}&pageSize=${pageSize}`);
};

export const assignScopeToUser = async (userId, scopeId) => {
    return apiClient(`/api/scopes/assign-to-user/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ scopeId }),
    });
};

export const removeScopeFromUser = async (userId, scopeId) => {
    return apiClient(`/api/scopes/remove-from-user/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ scopeId }),
    });
};

export const syncUserScopes = async (userId) => {
    return apiClient(`/api/scopes/sync/user/${userId}`, { method: 'POST' });
};

// --- Group Management ---
export const getGroups = async (cursor = '', pageSize = 50) => {
    return apiClient(`/api/groups?cursor=${cursor}&pageSize=${pageSize}`);
};

export const createGroup = async (groupData) => {
    return apiClient('/api/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
    });
};

export const deleteGroup = async (groupId) => {
    return apiClient(`/api/groups/${groupId}`, { method: 'DELETE' });
};

// --- Global Exercise Library Management ---
export const getGlobalExercises = async (cursor = '', pageSize = 50) => {
    return apiClient(`/api/training/exercises?cursor=${cursor}&pageSize=${pageSize}`);
};

export const createExercise = async (exerciseData) => {
    return apiClient('/api/training/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData),
    });
};

export const updateExercise = async (id, exerciseData) => {
    return apiClient(`/api/training/exercises/${id}`, {
        method: 'PUT',
        body: JSON.stringify(exerciseData),
    });
};

export const deleteExercise = async (id) => {
    return apiClient(`/api/training/exercises/${id}`, { method: 'DELETE' });
};
