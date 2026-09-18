import {
    applyExerciseSwap,
    buildRetainedSetsForOriginal,
    enqueueExerciseSwap,
} from '../../utils/swapExerciseInSession';

export function confirmSessionExerciseSwap({
    exercises,
    sessionId,
    originalExercise,
    replacement,
    unitSystem,
    enqueueMutation,
    onApplied,
    onDuplicate,
    onMissing,
}) {
    const originalExerciseId = originalExercise.exerciseId ?? originalExercise.id;
    const result = applyExerciseSwap(exercises, { originalExerciseId, replacement });

    if (result.error === 'already-in-session') {
        onDuplicate?.();
        return { ok: false, reason: result.error };
    }
    if (result.error === 'original-missing') {
        onMissing?.();
        return { ok: false, reason: result.error };
    }

    const retainedSetsForOriginal = buildRetainedSetsForOriginal(originalExercise, unitSystem);
    onApplied?.(result.exercises);
    enqueueExerciseSwap({
        enqueueMutation,
        sessionId,
        originalExerciseId,
        newExerciseId: replacement.exerciseId ?? replacement.id,
        retainedSetsForOriginal,
    });

    return { ok: true, exercises: result.exercises };
}
