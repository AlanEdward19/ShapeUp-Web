import { describe, expect, it } from 'vitest';
import {
    buildWorkoutPlanBody,
    createDefaultPlannedSet,
    findTimeBasedDurationError,
} from '../workoutPlanPayload';

describe('buildWorkoutPlanBody TimeBased sets (TBE-02)', () => {
    it('sends durationSeconds and null load/reps for TimeBased', () => {
        const body = buildWorkoutPlanBody({
            name: 'Run day',
            weeks: 4,
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            blocks: [{
                type: 'straight',
                exercises: [{
                    exerciseId: 10,
                    exerciseType: 'timeBased',
                    requireRpe: false,
                    sets: [{
                        type: 'working',
                        technique: 'Straight',
                        duration: '05:00',
                        distance: '',
                        intensityType: 'rpe',
                        intensityValue: '8',
                        rest: '90',
                    }],
                }],
            }],
        }, 'user-1');

        expect(body.blocks[0].exercises[0].sets[0]).toMatchObject({
            durationSeconds: 300,
            distanceMeters: null,
            load: null,
            repetitions: null,
            technique: 1,
        });
    });

    it('keeps WeightBased load and reps shape', () => {
        const body = buildWorkoutPlanBody({
            name: 'Lift',
            weeks: 4,
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            blocks: [{
                type: 'straight',
                exercises: [{
                    exerciseId: 1,
                    exerciseType: 'weightBased',
                    sets: [{
                        type: 'working',
                        technique: 'Straight',
                        reps: '8',
                        load: '100',
                        intensityType: 'rpe',
                        intensityValue: '8',
                        rest: '90',
                    }],
                }],
            }],
        }, 'user-1');

        expect(body.blocks[0].exercises[0].sets[0]).toMatchObject({
            repetitions: 8,
            load: 100,
            durationSeconds: null,
            distanceMeters: null,
        });
    });
});

describe('findTimeBasedDurationError (TBE-02)', () => {
    it('returns a message naming duration when missing', () => {
        const msg = findTimeBasedDurationError({
            blocks: [{
                exercises: [{
                    name: 'Corrida',
                    exerciseType: 'timeBased',
                    sets: [{ duration: '' }],
                }],
            }],
        });
        expect(msg).toMatch(/duration/i);
    });

    it('returns null when TimeBased duration is valid', () => {
        expect(findTimeBasedDurationError({
            blocks: [{
                exercises: [{
                    exerciseType: 'timeBased',
                    sets: [{ duration: '05:00' }],
                }],
            }],
        })).toBeNull();
    });
});

describe('mixed TimeBased and WeightBased blocks (TBE-02 AC5)', () => {
    const mixedPlan = {
        name: 'Mixed',
        weeks: 4,
        phase: 'Hypertrophy',
        difficulty: 'Intermediate',
        blocks: [{
            type: 'superset',
            exercises: [
                {
                    exerciseId: 10,
                    exerciseType: 'timeBased',
                    sets: [{ type: 'working', technique: 'Straight', duration: '05:00', distance: '', intensityType: 'rpe', intensityValue: '8', rest: '90' }],
                },
                {
                    exerciseId: 1,
                    exerciseType: 'weightBased',
                    sets: [{ type: 'working', technique: 'Straight', reps: '8', load: '100', intensityType: 'rpe', intensityValue: '8', rest: '90' }],
                },
            ],
        }],
    };

    it('builds both set shapes without homogeneity errors', () => {
        expect(findTimeBasedDurationError(mixedPlan)).toBeNull();
        const body = buildWorkoutPlanBody(mixedPlan, 'user-1');
        expect(body.blocks[0].exercises[0].sets[0]).toMatchObject({
            durationSeconds: 300,
            load: null,
            repetitions: null,
        });
        expect(body.blocks[0].exercises[1].sets[0]).toMatchObject({
            repetitions: 8,
            load: 100,
            durationSeconds: null,
        });
    });
});

describe('createDefaultPlannedSet (TBE-02)', () => {
    it('creates Straight preset with duration for timeBased', () => {
        const set = createDefaultPlannedSet('timeBased');
        expect(set).toMatchObject({
            technique: 'Straight',
            duration: '05:00',
            distance: '',
            reps: '',
            load: '',
        });
    });
});
