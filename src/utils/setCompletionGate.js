import { parseDistanceMeters, parseDurationInput } from './durationDistance';
import { canCompleteLoggedSet } from './setExecutionValidation';

const rpeOnlyGate = (log, requireRpe, failure) => {
    const gate = canCompleteLoggedSet({
        weight: '0',
        reps: '1',
        rpe: log?.rpe,
        requireRpe,
        failure,
    });
    return gate.missing.filter((m) => m === 'rpe');
};

export const canCompleteSet = (exercise, set) => {
    const exerciseType = exercise.exerciseType || 'weightBased';
    const log = set.log || {};
    const requireRpe = Boolean(exercise.requireRpe);
    const failure = Boolean(set.failure);

    if (exerciseType === 'timeBased') {
        const missing = [];
        const durationSec = parseDurationInput(log.duration);
        if (durationSec == null || durationSec < 1) missing.push('duration');
        const dist = parseDistanceMeters(log.distance);
        if (!dist.ok) missing.push('distance');
        missing.push(...rpeOnlyGate(log, requireRpe, failure));
        return { ok: missing.length === 0, missing };
    }

    const gate = canCompleteLoggedSet({
        weight: log.weight,
        reps: log.reps,
        rpe: log.rpe,
        requireRpe,
        failure,
    });
    return { ok: gate.ok, missing: gate.missing };
};

export const shouldUncompleteSet = (exercise, set) => {
    if (!set.completed) return false;
    return !canCompleteSet(exercise, set).ok;
};
