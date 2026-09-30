import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMarkSetBody, enqueueMarkedSet } from '../markWorkoutSet';

const exercise = { id: 7, exerciseType: 'weightBased', sets: [] };
const set = { id: 's_0_0', type: 'working', log: { reps: '8', weight: '50', rpe: '8' }, prescribedRest: 90 };

describe('markWorkoutSet', () => {
    beforeEach(() => sessionStorage.clear());

    it('builds the POST /sets body with a client operationId', () => {
        const body = buildMarkSetBody({ sessionId: 'abc', exercise, set, unitSystem: 'metric' });
        expect(body.operationId).toBeTruthy();
        expect(body.exerciseId).toBe(7);
        expect(body.set).toMatchObject({ repetitions: 8, load: 50 });
    });

    it('reuses the same operationId for the same set (re-check does not duplicate)', () => {
        const a = buildMarkSetBody({ sessionId: 'abc', exercise, set, unitSystem: 'metric' });
        const b = buildMarkSetBody({ sessionId: 'abc', exercise, set, unitSystem: 'metric' });
        expect(b.operationId).toBe(a.operationId);
        const other = buildMarkSetBody({ sessionId: 'abc', exercise, set: { ...set, id: 's_0_1' }, unitSystem: 'metric' });
        expect(other.operationId).not.toBe(a.operationId);
    });

    it('enqueues one durable mutation per set', () => {
        const enqueueMutation = vi.fn();
        enqueueMarkedSet({ enqueueMutation, sessionId: 'abc', exercise, set, unitSystem: 'metric' });
        const call = enqueueMutation.mock.calls[0][0];
        expect(call.endpoint).toBe('/api/training/workouts/abc/sets');
        expect(call.method).toBe('POST');
        expect(call.dedupeKey).toBe('workout-set-abc-s_0_0');
    });

    it('does nothing without a session id', () => {
        const enqueueMutation = vi.fn();
        enqueueMarkedSet({ enqueueMutation, sessionId: null, exercise, set, unitSystem: 'metric' });
        expect(enqueueMutation).not.toHaveBeenCalled();
    });
});
