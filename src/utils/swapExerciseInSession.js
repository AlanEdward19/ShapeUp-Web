import { buildWorkoutStatePayload } from './workoutStatePayload';

const exerciseKey = (ex) => String(ex.exerciseId ?? ex.id ?? '');

/**
 * Completed sets on the original exercise, mapped for POST swap-exercise.
 */
export const buildRetainedSetsForOriginal = (originalExercise, unitSystem = 'metric') => {
    const payload = buildWorkoutStatePayload({
        sessionId: '0',
        exercises: [originalExercise],
        unitSystem,
    });
    return payload.exercises?.[0]?.sets ?? [];
};

/**
 * Apply swap locally: original keeps completed sets only; replacement appended with empty sets.
 */
export const applyExerciseSwap = (exercises, { originalExerciseId, replacement }) => {
    const origKey = String(originalExerciseId);
    const newKey = String(replacement.exerciseId ?? replacement.id);

    if (exercises.some((ex) => exerciseKey(ex) === newKey)) {
        return { error: 'already-in-session' };
    }

    const origIdx = exercises.findIndex((ex) => exerciseKey(ex) === origKey);
    if (origIdx === -1) {
        return { error: 'original-missing' };
    }

    const original = exercises[origIdx];
    const completedSets = (original.sets || []).filter((s) => s.completed);
    const updatedOriginal = { ...original, sets: completedSets };

    const newExercise = {
        ...replacement,
        id: replacement.id ?? replacement.exerciseId ?? newKey,
        exerciseId: replacement.exerciseId ?? replacement.id,
        name: replacement.name || original.name,
        muscles: replacement.muscles || original.muscles || [],
        target: replacement.target || original.target,
        sets: [],
    };

    const next = [...exercises];
    next[origIdx] = updatedOriginal;
    next.splice(origIdx + 1, 0, newExercise);

    return { exercises: next };
};

export const enqueueExerciseSwap = ({
    enqueueMutation,
    sessionId,
    originalExerciseId,
    newExerciseId,
    retainedSetsForOriginal,
}) =>
    enqueueMutation({
        method: 'POST',
        endpoint: `/api/training/workouts/${sessionId}/swap-exercise`,
        body: {
            originalExerciseId: parseInt(originalExerciseId, 10),
            newExerciseId: parseInt(newExerciseId, 10),
            retainedSetsForOriginal,
        },
        dedupeKey: `workout-swap-${sessionId}-${originalExerciseId}`,
    });
