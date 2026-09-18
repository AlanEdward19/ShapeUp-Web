import { mapBlockType, mapDifficulty, mapIntensityType, mapLoadUnit, mapSetType, mapTechnique } from './trainingEnums';
import { parseDistanceMeters, parseDurationInput } from './durationDistance';
import { mapAssignedWeekdaysToApi } from './workoutSchedule';

export const createDefaultPlannedSet = (exerciseType = 'weightBased') => {
    if (exerciseType === 'timeBased') {
        return {
            type: 'working',
            technique: 'Straight',
            duration: '05:00',
            distance: '',
            reps: '',
            load: '',
            intensityType: 'rpe',
            intensityValue: '8',
            rest: '90',
        };
    }
    return {
        type: 'working',
        technique: 'Straight',
        reps: '8-10',
        load: '75',
        intensityType: 'rpe',
        intensityValue: '8',
        rest: '90',
    };
};

const mapPlannedSetToApi = (s, exerciseType) => {
    const base = {
        setType: mapSetType(s.type ?? s.setType),
        intensity: s.intensityType && s.intensityValue !== ''
            ? { type: mapIntensityType(s.intensityType), value: parseInt(s.intensityValue, 10) }
            : null,
        restSeconds: s.rest === '' || s.rest == null ? null : parseInt(s.rest, 10),
        isExtra: false,
    };

    if (exerciseType === 'timeBased') {
        const durationSeconds = parseDurationInput(s.duration);
        const dist = parseDistanceMeters(s.distance);
        return {
            ...base,
            durationSeconds,
            distanceMeters: dist.ok ? dist.value : null,
            load: null,
            repetitions: null,
            loadUnit: mapLoadUnit(s.loadUnit),
            technique: mapTechnique('Straight'),
        };
    }

    return {
        ...base,
        repetitions: s.reps === '' || s.reps == null ? null : parseInt(s.reps, 10),
        load: parseFloat(s.load) || 0,
        loadUnit: mapLoadUnit(s.loadUnit),
        technique: mapTechnique(s.technique),
        durationSeconds: null,
        distanceMeters: null,
    };
};

export const findTimeBasedDurationError = (plan, durationLabel = 'duration') => {
    for (const block of plan.blocks || []) {
        for (const ex of block.exercises || []) {
            if (ex.exerciseType !== 'timeBased') continue;
            for (const s of ex.sets || []) {
                const seconds = parseDurationInput(s.duration);
                if (seconds == null || seconds < 1) {
                    return `Missing or invalid ${durationLabel} on ${ex.name || 'exercise'}`;
                }
            }
        }
    }
    return null;
};

export const buildWorkoutPlanBody = (plan, targetUserId) => ({
    targetUserId,
    name: plan.name || 'Novo Treino',
    notes: plan.notes || null,
    durationInWeeks: parseInt(plan.weeks, 10) || 4,
    phase: plan.phase || 'Hypertrophy',
    difficulty: mapDifficulty(plan.difficulty),
    assignedWeekdays: mapAssignedWeekdaysToApi(plan.assignedWeekdays ?? []),
    blocks: (plan.blocks || []).map((block) => ({
        type: mapBlockType(block.type),
        timeCapSeconds: block.timeCapSeconds === '' || block.timeCapSeconds == null ? null : parseInt(block.timeCapSeconds, 10),
        intervalSeconds: block.intervalSeconds === '' || block.intervalSeconds == null ? null : parseInt(block.intervalSeconds, 10),
        totalRounds: block.totalRounds === '' || block.totalRounds == null ? null : parseInt(block.totalRounds, 10),
        restAfterSeconds: block.restAfterSeconds === '' || block.restAfterSeconds == null ? null : parseInt(block.restAfterSeconds, 10),
        exercises: (block.exercises || []).map((ex) => ({
            exerciseId: parseInt(ex.exerciseId, 10) || 1,
            requireRpe: Boolean(ex.requireRpe),
            sets: (ex.sets || []).map((s) => mapPlannedSetToApi(s, ex.exerciseType || 'weightBased')),
        })),
    })),
});
