import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useGymManagementApi = () => {
    // --- GYMS ---
    const getGyms = useCallback(async (cursor, pageSize, ownerId) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        if (ownerId) query.append('ownerId', ownerId);
        return await apiClient(`/api/gym-management/gyms?${query.toString()}`);
    }, []);

    const getGymById = useCallback(async (gymId) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}`);
    }, []);

    const createGym = useCallback(async (command) => {
        return await apiClient('/api/gym-management/gyms', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateGym = useCallback(async (gymId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteGym = useCallback(async (gymId) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- GYM STAFF ---
    const getGymStaff = useCallback(async (gymId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gym-management/gyms/${gymId}/staff?${query.toString()}`);
    }, []);

    const addGymStaff = useCallback(async (gymId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/staff`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const removeGymStaff = useCallback(async (gymId, staffId) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/staff/${staffId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- GYM PLANS ---
    const getGymPlans = useCallback(async (gymId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gym-management/gyms/${gymId}/plans?${query.toString()}`);
    }, []);

    const createGymPlan = useCallback(async (gymId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/plans`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateGymPlan = useCallback(async (gymId, planId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/plans/${planId}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteGymPlan = useCallback(async (gymId, planId) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/plans/${planId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- GYM CLIENTS ---
    const getGymClients = useCallback(async (gymId, cursor, pageSize, trainerId) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        if (trainerId) query.append('trainerId', trainerId);
        return await apiClient(`/api/gym-management/gyms/${gymId}/clients?${query.toString()}`);
    }, []);

    const enrollGymClient = useCallback(async (gymId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/clients`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const assignClientTrainer = useCallback(async (gymId, clientId, command) => {
        return await apiClient(`/api/gym-management/gyms/${gymId}/clients/${clientId}/trainer`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    // --- TRAINER PLANS ---
    const getTrainerPlans = useCallback(async (trainerId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gym-management/trainers/${trainerId}/plans?${query.toString()}`);
    }, []);

    const createTrainerPlan = useCallback(async (trainerId, command) => {
        return await apiClient(`/api/gym-management/trainers/${trainerId}/plans`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateTrainerPlan = useCallback(async (trainerId, planId, command) => {
        return await apiClient(`/api/gym-management/trainers/${trainerId}/plans/${planId}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteTrainerPlan = useCallback(async (trainerId, planId) => {
        return await apiClient(`/api/gym-management/trainers/${trainerId}/plans/${planId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- TRAINER CLIENTS ---
    const getTrainerClients = useCallback(async (trainerId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gym-management/trainers/${trainerId}/clients?${query.toString()}`);
    }, []);

    const addTrainerClient = useCallback(async (trainerId, command) => {
        return await apiClient(`/api/gym-management/trainers/${trainerId}/clients`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const transferTrainerClient = useCallback(async (trainerId, clientId, command) => {
        return await apiClient(`/api/gym-management/trainers/${trainerId}/clients/${clientId}/transfer`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    // --- PLATFORM TIERS ---
    const getPlatformTiers = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/gym-management/platform-tiers?${query.toString()}`);
    }, []);

    const createPlatformTier = useCallback(async (command) => {
        return await apiClient('/api/gym-management/platform-tiers', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updatePlatformTier = useCallback(async (id, command) => {
        return await apiClient(`/api/gym-management/platform-tiers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deletePlatformTier = useCallback(async (id) => {
        return await apiClient(`/api/gym-management/platform-tiers/${id}`, {
            method: 'DELETE'
        });
    }, []);

    // --- USER ROLES ---
    const getUserRoles = useCallback(async (userId) => {
        return await apiClient(`/api/gym-management/user-roles/${userId}`);
    }, []);

    const assignUserRole = useCallback(async (command) => {
        return await apiClient('/api/gym-management/user-roles', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    return {
        // Gyms
        getGyms, getGymById, createGym, updateGym, deleteGym,
        // Gym Staff
        getGymStaff, addGymStaff, removeGymStaff,
        // Gym Plans
        getGymPlans, createGymPlan, updateGymPlan, deleteGymPlan,
        // Gym Clients
        getGymClients, enrollGymClient, assignClientTrainer,
        // Trainer Plans
        getTrainerPlans, createTrainerPlan, updateTrainerPlan, deleteTrainerPlan,
        // Trainer Clients
        getTrainerClients, addTrainerClient, transferTrainerClient,
        // Platform Tiers
        getPlatformTiers, createPlatformTier, updatePlatformTier, deletePlatformTier,
        // User Roles
        getUserRoles, assignUserRole
    };
};
