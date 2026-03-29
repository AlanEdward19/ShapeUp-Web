import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useTrainingApi = () => {
    // --- WORKOUT TEMPLATES ---
    const getWorkoutTemplates = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/training/workout-templates?${query.toString()}`);
    }, []);

    const getWorkoutTemplateById = useCallback(async (templateId) => {
        return await apiClient(`/api/training/workout-templates/${templateId}`);
    }, []);

    const createWorkoutTemplate = useCallback(async (command) => {
        return await apiClient('/api/training/workout-templates', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const copyWorkoutTemplate = useCallback(async (templateId, command) => {
        return await apiClient(`/api/training/workout-templates/${templateId}/copy`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const assignWorkoutTemplate = useCallback(async (templateId, targetUserId, command) => {
        return await apiClient(`/api/training/workout-templates/${templateId}/assign/${targetUserId}`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    // --- WORKOUT PLANS ---
    const createWorkoutPlan = useCallback(async (command) => {
        return await apiClient('/api/training/workout-plans', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const getWorkoutPlanById = useCallback(async (planId) => {
        return await apiClient(`/api/training/workout-plans/${planId}`);
    }, []);

    const copyWorkoutPlan = useCallback(async (planId, command) => {
        return await apiClient(`/api/training/workout-plans/${planId}/copy`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const getWorkoutPlansByUser = useCallback(async (targetUserId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/training/workout-plans/user/${targetUserId}?${query.toString()}`);
    }, []);

    // --- WORKOUT EXECUTIONS ---
    const startWorkout = useCallback(async (command) => {
        return await apiClient('/api/training/workouts/start', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const finishWorkout = useCallback(async (sessionId, command) => {
        return await apiClient(`/api/training/workouts/${sessionId}/finish`, {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateWorkoutState = useCallback(async (sessionId, command) => {
        return await apiClient(`/api/training/workouts/${sessionId}/state`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const getWorkoutById = useCallback(async (sessionId) => {
        return await apiClient(`/api/training/workouts/${sessionId}`);
    }, []);

    const getWorkoutsByUser = useCallback(async (targetUserId, cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/training/workouts/user/${targetUserId}?${query.toString()}`);
    }, []);

    // --- EXERCISES ---
    const getExercises = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/training/exercises?${query.toString()}`);
    }, []);

    const getExerciseById = useCallback(async (exerciseId) => {
        return await apiClient(`/api/training/exercises/${exerciseId}`);
    }, []);

    const createExercise = useCallback(async (command) => {
        return await apiClient('/api/training/exercises', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateExercise = useCallback(async (exerciseId, command) => {
        return await apiClient(`/api/training/exercises/${exerciseId}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteExercise = useCallback(async (exerciseId) => {
        return await apiClient(`/api/training/exercises/${exerciseId}`, {
            method: 'DELETE'
        });
    }, []);

    const suggestExercises = useCallback(async (query) => {
        return await apiClient('/api/training/exercises/suggest', {
            method: 'POST',
            body: JSON.stringify(query)
        });
    }, []);

    // --- EQUIPMENTS ---
    const getEquipments = useCallback(async (cursor, pageSize) => {
        const query = new URLSearchParams();
        if (cursor) query.append('cursor', cursor);
        if (pageSize) query.append('pageSize', pageSize);
        return await apiClient(`/api/training/equipments?${query.toString()}`);
    }, []);

    const getEquipmentById = useCallback(async (equipmentId) => {
        return await apiClient(`/api/training/equipments/${equipmentId}`);
    }, []);

    const createEquipment = useCallback(async (command) => {
        return await apiClient('/api/training/equipments', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const updateEquipment = useCallback(async (equipmentId, command) => {
        return await apiClient(`/api/training/equipments/${equipmentId}`, {
            method: 'PUT',
            body: JSON.stringify(command)
        });
    }, []);

    const deleteEquipment = useCallback(async (equipmentId) => {
        return await apiClient(`/api/training/equipments/${equipmentId}`, {
            method: 'DELETE'
        });
    }, []);

    // --- DASHBOARD ---
    const getDashboardMe = useCallback(async (sessionsTargetPerWeek) => {
        const query = new URLSearchParams();
        if (sessionsTargetPerWeek) query.append('sessionsTargetPerWeek', sessionsTargetPerWeek);
        return await apiClient(`/api/training/dashboard/me?${query.toString()}`);
    }, []);

    return {
        // Workout Templates
        getWorkoutTemplates, getWorkoutTemplateById, createWorkoutTemplate, copyWorkoutTemplate, assignWorkoutTemplate,
        // Workout Plans
        createWorkoutPlan, getWorkoutPlanById, copyWorkoutPlan, getWorkoutPlansByUser,
        // Workouts
        startWorkout, finishWorkout, updateWorkoutState, getWorkoutById, getWorkoutsByUser,
        // Exercises
        getExercises, getExerciseById, createExercise, updateExercise, deleteExercise, suggestExercises,
        // Equipments
        getEquipments, getEquipmentById, createEquipment, updateEquipment, deleteEquipment,
        // Dashboard
        getDashboardMe
    };
};
