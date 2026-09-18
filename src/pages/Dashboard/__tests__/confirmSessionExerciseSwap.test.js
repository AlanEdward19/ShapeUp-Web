import { describe, expect, it, vi } from 'vitest';
import { confirmSessionExerciseSwap } from '../confirmSessionExerciseSwap';

const set = (completed) => ({
    completed,
    type: 'work',
    technique: 'Straight',
    prescribedReps: '10',
    prescribedLoad: '40',
    prescribedRpe: '8',
    prescribedIntensityType: 'rpe',
    prescribedRest: '90',
    log: { weight: '40', reps: '10', rpe: '8' },
});

describe('confirmSessionExerciseSwap', () => {
    it('applies swap and enqueues swap-exercise without apiClient', () => {
        const enqueueMutation = vi.fn();
        const onApplied = vi.fn();
        const exercises = [{ id: 1, exerciseId: 1, name: 'Bench', sets: [set(true)] }];
        const result = confirmSessionExerciseSwap({
            exercises,
            sessionId: 'sess-1',
            originalExercise: exercises[0],
            replacement: { exerciseId: 2, id: 2, name: 'DB Bench' },
            unitSystem: 'metric',
            enqueueMutation,
            onApplied,
        });
        expect(result.ok).toBe(true);
        expect(onApplied).toHaveBeenCalled();
        expect(enqueueMutation).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                endpoint: '/api/training/workouts/sess-1/swap-exercise',
                dedupeKey: 'workout-swap-sess-1-1',
            }),
        );
    });

    it('surfaces duplicate-in-session without enqueueing', () => {
        const enqueueMutation = vi.fn();
        const onDuplicate = vi.fn();
        const exercises = [
            { id: 1, exerciseId: 1, name: 'Bench', sets: [] },
            { id: 2, exerciseId: 2, name: 'Other', sets: [] },
        ];
        const result = confirmSessionExerciseSwap({
            exercises,
            sessionId: 'sess-1',
            originalExercise: exercises[0],
            replacement: { exerciseId: 2, name: 'DB Bench' },
            unitSystem: 'metric',
            enqueueMutation,
            onDuplicate,
        });
        expect(result.ok).toBe(false);
        expect(onDuplicate).toHaveBeenCalled();
        expect(enqueueMutation).not.toHaveBeenCalled();
    });
});
