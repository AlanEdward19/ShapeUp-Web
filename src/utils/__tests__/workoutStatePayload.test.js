import { expect, it } from 'vitest';
import { buildWorkoutStatePayload, enrichExercisesFromCatalog, parsePositiveInt } from '../workoutStatePayload';

it('parses the first positive integer from ranges and blanks', () => {
    expect(parsePositiveInt('8-10')).toBe(8);
    expect(parsePositiveInt('15')).toBe(15);
    expect(parsePositiveInt('')).toBe(1);
    expect(parsePositiveInt(null, 12)).toBe(12);
});

it('falls back to prescribed reps/load/rpe when logs are empty', () => {
    const payload = buildWorkoutStatePayload({
        sessionId: 'sess-1',
        unitSystem: 'metric',
        exercises: [{
            exerciseId: 7,
            sets: [{
                completed: true,
                type: 'warmup',
                technique: 'straight',
                prescribedReps: '15',
                prescribedLoad: '50',
                prescribedRpe: '8',
                prescribedIntensityType: 'rpe',
                prescribedRest: '90',
                log: { weight: '', reps: '', rpe: '' },
            }],
        }],
    });

    expect(payload.sessionId).toBe('sess-1');
    expect(payload.exercises).toHaveLength(1);
    expect(payload.exercises[0].exerciseId).toBe(7);
    expect(payload.exercises[0].sets[0]).toMatchObject({
        repetitions: 15,
        load: 50,
        loadUnit: 1,
        setType: 1,
        technique: 1,
        intensity: { type: 1, value: 8 },
        restSeconds: 90,
    });
});

it('sends durationSeconds and null load/reps for completed TimeBased sets (TBE-05)', () => {
    const payload = buildWorkoutStatePayload({
        sessionId: 'sess-tbe',
        unitSystem: 'metric',
        exercises: [{
            exerciseId: 99,
            exerciseType: 'timeBased',
            sets: [{
                completed: true,
                type: 'working',
                technique: 'Straight',
                prescribedDuration: '05:00',
                prescribedIntensityType: 'rpe',
                prescribedRest: '60',
                log: { duration: '10:00', distance: '1000', rpe: '7' },
            }],
        }],
    });

    expect(payload.exercises[0].sets[0]).toMatchObject({
        durationSeconds: 600,
        distanceMeters: 1000,
        load: null,
        repetitions: null,
        intensity: { type: 1, value: 7 },
    });
});

it('enriches blank plan exercises from the catalog by exerciseId', () => {
    const enriched = enrichExercisesFromCatalog(
        [{ exerciseId: 1, name: '', muscles: [] }],
        [{ id: 1, name: 'Supino', muscles: ['Chest', 'Triceps'] }]
    );
    expect(enriched[0]).toMatchObject({
        name: 'Supino',
        muscles: ['Chest', 'Triceps'],
    });
});
