import { apiClient } from './apiClient';

const query = (params) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
    });
    const text = search.toString();
    return text ? `?${text}` : '';
};

export const asList = (value) => (Array.isArray(value) ? value : value?.items ?? value?.Items ?? []);

export const getMyTrainer = () => apiClient('/api/gym-management/trainer-clients/me');

export const listNutritionists = () => apiClient('/api/nutrition/nutritionists');

export const removeNutritionist = (professionalUserId) =>
    apiClient(`/api/nutrition/nutritionists/${professionalUserId}`, { method: 'DELETE' });

export const acceptTrainerInvite = (payload) =>
    apiClient('/api/gym-management/trainer-client-invites/accept', {
        method: 'POST',
        body: JSON.stringify({ payload }),
    });

export const acceptNutritionInvite = (token) =>
    apiClient('/api/nutrition/clients/invites/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });

export const listTrainerInvites = (trainerId, pageSize = 100) =>
    apiClient(`/api/gym-management/trainers/${trainerId}/clients/invites${query({ pageSize })}`);

export const revokeTrainerInvite = (trainerId, inviteId) =>
    apiClient(`/api/gym-management/trainers/${trainerId}/clients/invites/${inviteId}`, { method: 'DELETE' });

export const listNutritionClients = () => apiClient('/api/nutrition/clients');

export const listNutritionAdherence = () =>
    apiClient(`/api/nutrition/clients/adherence${query({ days: 7, pageSize: 100 })}`);

export const inviteNutritionClient = (clientEmail) =>
    apiClient('/api/nutrition/clients/invites', {
        method: 'POST',
        body: JSON.stringify(clientEmail ? { clientEmail, expiresInHours: null } : {}),
    });

export const listNutritionInvites = () =>
    apiClient(`/api/nutrition/clients/invites${query({ pageSize: 100 })}`);

export const revokeNutritionInvite = (inviteId) =>
    apiClient(`/api/nutrition/clients/invites/${inviteId}`, { method: 'DELETE' });

export const endNutritionRelationship = (clientId) =>
    apiClient(`/api/nutrition/clients/${clientId}`, { method: 'DELETE' });

export const getClientDiary = (userId, date) =>
    apiClient(`/api/nutrition/users/${userId}/diary${query({ date })}`);

export const getClientProfile = (userId) => apiClient(`/api/nutrition/users/${userId}/profile`);

export const getClientWeight = (userId, startDateUtc, endDateUtc) =>
    apiClient(`/api/nutrition/users/${userId}/weight/registers${query({ startDateUtc, endDateUtc })}`);

export const getClientHydration = (userId, date) =>
    apiClient(`/api/nutrition/users/${userId}/hydration${query({ date })}`);

export const setClientGoal = (userId, goal) =>
    apiClient(`/api/nutrition/users/${userId}/goal`, {
        method: 'PUT',
        body: JSON.stringify({ goal }),
    });

export const getClientFasting = (userId) => apiClient(`/api/nutrition/users/${userId}/fasting`);

export const getClientFastingHistory = (userId) =>
    apiClient(`/api/nutrition/users/${userId}/fasting/history${query({ pageSize: 10 })}`);

export const listMealPlanTemplates = () => apiClient('/api/nutrition/meal-plan-templates');

export const createMealPlanTemplate = (command) =>
    apiClient('/api/nutrition/meal-plan-templates', {
        method: 'POST',
        body: JSON.stringify(command),
    });

export const deleteMealPlanTemplate = (templateId) =>
    apiClient(`/api/nutrition/meal-plan-templates/${templateId}`, { method: 'DELETE' });

export const assignMealPlanTemplate = (templateId, clientId, planName) =>
    apiClient(`/api/nutrition/meal-plan-templates/${templateId}/assign/${clientId}`, {
        method: 'POST',
        body: JSON.stringify(planName ? { planName } : {}),
    });

export const getMyCredentials = () => apiClient('/api/credentials/me');

export const submitCredential = (command) =>
    apiClient('/api/credentials', { method: 'POST', body: JSON.stringify(command) });

export const resubmitCredential = (id, command) =>
    apiClient(`/api/credentials/${id}`, { method: 'PUT', body: JSON.stringify(command) });
