import { describe, expect, it, vi } from 'vitest';
import {
    applyExerciseSwap,
    buildRetainedSetsForOriginal,
    enqueueExerciseSwap,
} from '../swapExerciseInSession';

const baseSet = (overrides = {}) => ({
    id: 's1',
    type: 'work',
    technique: 'Straight',
    prescribedReps: '10',
    prescribedLoad: '40',
    prescribedRpe: '8',
    prescribedIntensityType: 'rpe',
    prescribedRest: '90',
    log: { weight: '40', reps: '10', rpe: '8' },
    completed: false,
    ...overrides,
});

describe('buildRetainedSetsForOriginal', () => {
    it('includes only completed sets', () => {
        const retained = buildRetainedSetsForOriginal({
            exerciseId: 1,
            sets: [
                baseSet({ completed: true }),
                baseSet({ id: 's2', completed: false }),
            ],
        });
        expect(retained).toHaveLength(1);
        expect(retained[0].repetitions).toBe(10);
    });
});

describe('applyExerciseSwap', () => {
    const session = [{
        id: 1,
        exerciseId: 1,
        name: 'Bench',
        muscles: ['Chest'],
        target: 'Chest',
        sets: [
            baseSet({ completed: true }),
            baseSet({ id: 's2', completed: false }),
        ],
    }];

    it('retains completed sets on original and appends replacement with empty sets', () => {
        const result = applyExerciseSwap(session, {
            originalExerciseId: 1,
            replacement: { exerciseId: 2, id: 2, name: 'DB Bench', muscles: ['Chest'] },
        });
        expect(result.exercises).toHaveLength(2);
        expect(result.exercises[0].sets).toHaveLength(1);
        expect(result.exercises[0].sets[0].completed).toBe(true);
        expect(result.exercises[1]).toMatchObject({ exerciseId: 2, sets: [] });
    });

    it('returns already-in-session when replacement exists', () => {
        const withTwo = [
            ...session,
            { id: 2, exerciseId: 2, name: 'Other', sets: [] },
        ];
        expect(
            applyExerciseSwap(withTwo, {
                originalExerciseId: 1,
                replacement: { exerciseId: 2, name: 'DB Bench' },
            }),
        ).toEqual({ error: 'already-in-session' });
    });

    it('returns original-missing when id not found', () => {
        expect(
            applyExerciseSwap(session, {
                originalExerciseId: 99,
                replacement: { exerciseId: 2, name: 'DB Bench' },
            }),
        ).toEqual({ error: 'original-missing' });
    });
});

describe('enqueueExerciseSwap', () => {
    it('posts swap-exercise with dedupeKey and retained sets', () => {
        const enqueueMutation = vi.fn();
        const retained = [{ repetitions: 8, load: 50 }];
        enqueueExerciseSwap({
            enqueueMutation,
            sessionId: 'sess-9',
            originalExerciseId: 1,
            newExerciseId: 2,
            retainedSetsForOriginal: retained,
        });
        expect(enqueueMutation).toHaveBeenCalledWith({
            method: 'POST',
            endpoint: '/api/training/workouts/sess-9/swap-exercise',
            body: {
                originalExerciseId: 1,
                newExerciseId: 2,
                retainedSetsForOriginal: retained,
            },
            dedupeKey: 'workout-swap-sess-9-1',
        });
    });
});
