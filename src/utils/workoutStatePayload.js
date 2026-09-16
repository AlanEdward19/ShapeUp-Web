import { mapIntensityType, mapLoadUnit, mapSetType, mapTechnique } from './trainingEnums';

/**
 * Pull the first positive integer from free-form prescription text ("8-10", "15", "").
 * API validators require Repetitions > 0 on executed/synced sets.
 */
export const parsePositiveInt = (value, fallback = 1) => {
    const match = String(value ?? '').match(/\d+/);
    const n = match ? parseInt(match[0], 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const resolveLoad = (set) => {
    const loggedRaw = set.log?.weight;
    if (loggedRaw !== '' && loggedRaw != null) {
        const logged = parseFloat(loggedRaw);
        if (Number.isFinite(logged) && logged >= 0) return logged;
    }
    const prescribed = parseFloat(set.prescribedLoad);
    return Number.isFinite(prescribed) && prescribed >= 0 ? prescribed : 0;
};

/**
 * Builds the PUT /workouts/{id}/state (and finish) body the Training API expects.
 * Falls back to prescribed reps/load/RPE when the athlete marks Done without typing logs.
 */
export const buildWorkoutStatePayload = ({ sessionId, exercises, unitSystem }) => {
    const loadUnit = mapLoadUnit(unitSystem === 'imperial' ? 'lbs' : 'kg');

    const exercisesWithProgress = (exercises || []).map((ex) => {
        const sets = (ex.sets || [])
            .filter((s) => !!s.completed)
            .map((s) => {
                const rpe = Math.min(
                    10,
                    Math.max(1, parsePositiveInt(s.log?.rpe, parsePositiveInt(s.prescribedRpe, 8)))
                );
                return {
                    repetitions: parsePositiveInt(s.log?.reps, parsePositiveInt(s.prescribedReps, 1)),
                    load: resolveLoad(s),
                    loadUnit,
                    setType: mapSetType(s.type),
                    technique: mapTechnique(s.technique || 'Straight'),
                    intensity: {
                        type: mapIntensityType(s.prescribedIntensityType || 'rpe'),
                        value: rpe,
                    },
                    restSeconds: parseInt(s.prescribedRest, 10) || 90,
                    isExtra: !!s.isExtra,
                };
            });

        if (sets.length === 0) return null;

        return {
            exerciseId: parseInt(ex.exerciseId ?? ex.id, 10) || 0,
            sets,
        };
    }).filter(Boolean);

    return {
        sessionId: String(sessionId),
        savedAtUtc: new Date().toISOString(),
        exercises: exercisesWithProgress,
    };
};

/**
 * Fill blank name/muscles from the exercise library so body-map SVG can paint.
 */
export const enrichExercisesFromCatalog = (exercises, catalog = []) =>
    (exercises || []).map((ex) => {
        const hasMuscles = Array.isArray(ex.muscles) && ex.muscles.length > 0;
        const hasName = Boolean(ex.name && String(ex.name).trim());
        if (hasMuscles && hasName) return ex;

        const id = Number(ex.exerciseId ?? ex.id);
        const match = Number.isFinite(id)
            ? catalog.find((item) => Number(item.id) === id)
            : null;
        if (!match) return ex;

        return {
            ...ex,
            name: hasName ? ex.name : (match.name || match.namePt || ex.name || ''),
            muscles: hasMuscles ? ex.muscles : (match.muscles || []),
        };
    });
