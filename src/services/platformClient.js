import { apiClient } from './apiClient';

/**
 * @typedef {Object} KeysetPage
 * @property {Array<Record<string, unknown>>} items
 * @property {string|null} nextCursor
 */

const query = (params) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
    });
    const text = search.toString();
    return text ? `?${text}` : '';
};

/** @returns {Promise<{ usersTotal: number, usersActive: number, credentialsUnderReview: number, openSafetyReports: number }>} */
export const getAdminOverview = () => apiClient('/api/admin/overview');

/** @returns {Promise<KeysetPage>} */
export const listUsers = ({ cursor, pageSize = 20, search } = {}) =>
    apiClient(`/api/users${query({ cursor, pageSize, search })}`);

/** @returns {Promise<{ userId: number, email: string, displayName: string|null, isActive: boolean }>} */
export const setUserActive = (userId, isActive) =>
    apiClient(`/api/users/${userId}/active`, { method: 'PUT', body: JSON.stringify({ isActive }) });

/** @returns {Promise<KeysetPage>} */
export const listCredentialsUnderReview = ({ cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/credentials/under-review${query({ cursor, pageSize })}`);

export const approveCredential = (id, expiresAt) =>
    apiClient(`/api/credentials/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(expiresAt ? { expiresAt } : {}),
    });

export const rejectCredential = (id, reason) =>
    apiClient(`/api/credentials/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });

export const requestCredentialChanges = (id, message) =>
    apiClient(`/api/credentials/${id}/request-changes`, { method: 'POST', body: JSON.stringify({ message }) });

export const suspendCredential = (id, reason) =>
    apiClient(`/api/credentials/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) });

export const revokeCredential = (id, reason) =>
    apiClient(`/api/credentials/${id}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) });

/** @returns {Promise<KeysetPage>} */
export const listProfessionalDirectory = ({ professionType, cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/credentials/directory${query({ professionType, cursor, pageSize })}`);

/** @returns {Promise<KeysetPage>} */
export const listRoleAssignments = ({ cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/gym-management/user-roles/assignments${query({ cursor, pageSize })}`);

export const assignUserRole = (command) =>
    apiClient('/api/gym-management/user-roles', { method: 'POST', body: JSON.stringify(command) });

/** @returns {Promise<KeysetPage>} */
export const listSafetyReports = ({ status = 'Open', cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/safety/reports${query({ status, cursor, pageSize })}`);

export const resolveSafetyReport = (id, decision, note) =>
    apiClient(`/api/safety/reports/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ decision, note: note || null }),
    });

/** @returns {Promise<KeysetPage>} */
export const listNotices = ({ cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/notifications/inbox${query({ cursor, pageSize })}`);

export const markNoticeRead = (id) => apiClient(`/api/notifications/inbox/${id}/read`, { method: 'POST' });

export const sendNotice = (command) =>
    apiClient('/api/notifications/inbox', { method: 'POST', body: JSON.stringify(command) });

export const getMe = () => apiClient('/api/users/me');

export const listTrainerPlans = (trainerId, { cursor, pageSize = 20 } = {}) =>
    apiClient(`/api/gym-management/trainers/${trainerId}/plans${query({ cursor, pageSize })}`);

export const createTrainerPlan = (trainerId, command) =>
    apiClient(`/api/gym-management/trainers/${trainerId}/plans`, {
        method: 'POST',
        body: JSON.stringify(command),
    });

export const deleteTrainerPlan = (trainerId, planId) =>
    apiClient(`/api/gym-management/trainers/${trainerId}/plans/${planId}`, { method: 'DELETE' });
