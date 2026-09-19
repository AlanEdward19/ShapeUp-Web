import { mapIntensityType, mapLoadUnit, mapSetType, mapTechnique, unmapExerciseType } from './trainingEnums';
import { parseDistanceMeters, parseDurationInput } from './durationDistance';

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
        const exerciseType = ex.exerciseType || 'weightBased';
        const sets = (ex.sets || [])
            .filter((s) => !!s.completed)
            .map((s) => {
                const rpe = Math.min(
                    10,
                    Math.max(1, parsePositiveInt(s.log?.rpe, parsePositiveInt(s.prescribedRpe, 8)))
                );
                const base = {
                    setType: mapSetType(s.type),
                    technique: mapTechnique(s.technique || 'Straight'),
                    intensity: {
                        type: mapIntensityType(s.prescribedIntensityType || 'rpe'),
                        value: rpe,
                    },
                    restSeconds: parseInt(s.prescribedRest, 10) || 90,
                    isExtra: !!s.isExtra,
                };

                if (exerciseType === 'timeBased') {
                    const durationSeconds = parseDurationInput(s.log?.duration)
                        ?? parseDurationInput(s.prescribedDuration);
                    const dist = parseDistanceMeters(s.log?.distance);
                    const distanceMeters = dist.ok ? dist.value : null;
                    return {
                        ...base,
                        durationSeconds,
                        distanceMeters,
                        load: null,
                        repetitions: null,
                        loadUnit,
                    };
                }

                return {
                    ...base,
                    repetitions: parsePositiveInt(s.log?.reps, parsePositiveInt(s.prescribedReps, 1)),
                    load: resolveLoad(s),
                    loadUnit,
                    durationSeconds: null,
                    distanceMeters: null,
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

const catalogItemId = (item) => Number(item?.exerciseId ?? item?.id);

const catalogHasMuscles = (item) =>
    (Array.isArray(item?.muscles) && item.muscles.length > 0)
    || (Array.isArray(item?.muscleDetails) && item.muscleDetails.length > 0);

const foldCatalogName = (value) => String(value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const catalogNameKeys = (item) =>
    [item?.name, item?.nameEn, item?.namePt, item?.exerciseName, item?.exerciseNamePt]
        .map(foldCatalogName)
        .filter(Boolean);

/**
 * Fill blank name/muscles from the exercise library so body-map SVG can paint.
 */
export const enrichExercisesFromCatalog = (exercises, catalog = []) =>
    (exercises || []).map((ex) => {
        const id = catalogItemId(ex);
        const byId = Number.isFinite(id)
            ? catalog.filter((item) => catalogItemId(item) === id)
            : [];
        const names = catalogNameKeys(ex);
        const byName = names.length
            ? catalog.filter((item) => catalogNameKeys(item).some((name) => names.includes(name)))
            : [];
        const match = byId.find(catalogHasMuscles) || byName.find(catalogHasMuscles) || byId[0] || byName[0];
        if (!match) return ex;

        const hasName = Boolean(ex.name && String(ex.name).trim());
        return {
            ...ex,
            name: hasName ? ex.name : (match.name || match.namePt || ex.name || ''),
            muscles: [
                ...(Array.isArray(ex.muscles) ? ex.muscles : []),
                ...(Array.isArray(match.muscles) ? match.muscles : []),
            ],
            muscleDetails: [
                ...(Array.isArray(ex.muscleDetails) ? ex.muscleDetails : []),
                ...(Array.isArray(match.muscleDetails) ? match.muscleDetails : []),
            ],
            muscleActivations: { ...match.muscleActivations, ...ex.muscleActivations },
            exerciseType: ex.exerciseType ?? unmapExerciseType(match.exerciseType),
        };
    });
