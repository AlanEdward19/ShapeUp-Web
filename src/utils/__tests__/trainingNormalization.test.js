import { describe, expect, it } from 'vitest';
import { applyRequireRpeToAll, normalizeBlock, normalizePlan, normalizeSet, normalizeTemplate } from '../trainingNormalization';

describe('normalizeSet duration and distance (TBE-02, TBE-05)', () => {
    it('maps API durationSeconds and distanceMeters to editor strings', () => {
        const set = normalizeSet({ durationSeconds: 300, distanceMeters: 1000 }, 0);
        expect(set.duration).toBe('05:00');
        expect(set.distance).toBe('1000');
    });

    it('defaults empty duration and distance when API omits them', () => {
        const set = normalizeSet({ repetitions: 8, load: 50 }, 0);
        expect(set.duration).toBe('');
        expect(set.distance).toBe('');
    });
});

describe('normalizeBlockExercise exerciseType (TBE-02)', () => {
    it('defaults missing exerciseType to weightBased', () => {
        const block = normalizeBlock({
            type: 1,
            exercises: [{ exerciseId: 1, name: 'Squat', sets: [] }],
        }, 0);
        expect(block.exercises[0].exerciseType).toBe('weightBased');
    });

    it('maps API TimeBased enum to timeBased', () => {
        const block = normalizeBlock({
            type: 1,
            exercises: [{ exerciseId: 2, exerciseType: 2, name: 'Run', sets: [] }],
        }, 0);
        expect(block.exercises[0].exerciseType).toBe('timeBased');
    });
});

describe('normalizeBlockExercise requireRpe (WEV-05)', () => {
    it('defaults requireRpe to false when the API omits the field', () => {
        const block = normalizeBlock({
            type: 1,
            exercises: [{ exerciseId: 1, name: 'Squat', sets: [] }],
        }, 0);
        expect(block.exercises[0].requireRpe).toBe(false);
    });

    it('keeps requireRpe true when the API sends true', () => {
        const block = normalizeBlock({
            type: 1,
            exercises: [{ exerciseId: 2, name: 'Bench', requireRpe: true, sets: [] }],
        }, 0);
        expect(block.exercises[0].requireRpe).toBe(true);
    });
});

describe('normalizePlan assignedWeekdays (WSD-02, WSD-03)', () => {
    it('defaults omitted API field to an empty array', () => {
        const normalized = normalizePlan({ planId: 1, name: 'Legado', blocks: [] });
        expect(normalized.assignedWeekdays).toEqual([]);
    });

    it('maps weekday strings to 0–6 indices', () => {
        const normalized = normalizePlan({
            planId: 2,
            assignedWeekdays: ['Monday', 'Thursday'],
            blocks: [],
        });
        expect(normalized.assignedWeekdays).toEqual([1, 4]);
    });

    it('dedupes numeric weekday values', () => {
        const normalized = normalizePlan({
            planId: 3,
            assignedWeekdays: [1, 1, 4],
            blocks: [],
        });
        expect(normalized.assignedWeekdays).toEqual([1, 4]);
    });
});

describe('normalizeTemplate assignedWeekdays (WSD-02)', () => {
    it('does not add assignedWeekdays on templates', () => {
        const normalized = normalizeTemplate({ templateId: 9, name: 'Tpl', blocks: [] });
        expect(normalized.assignedWeekdays).toBeUndefined();
    });
});

describe('applyRequireRpeToAll (WEV-06)', () => {
    it('sets every exercise in every block to true and overwrites a mix', () => {
        const blocks = [
            {
                id: 'b1',
                exercises: [
                    { exerciseId: 1, requireRpe: false },
                    { exerciseId: 2, requireRpe: true },
                ],
            },
            {
                id: 'b2',
                exercises: [{ exerciseId: 3, requireRpe: false }],
            },
        ];
        const next = applyRequireRpeToAll(blocks);
        expect(next.every((b) => b.exercises.every((ex) => ex.requireRpe === true))).toBe(true);
        expect(blocks[0].exercises[0].requireRpe).toBe(false);
        expect(next[0].exercises[0].exerciseId).toBe(1);
        expect(next[1].exercises[0].exerciseId).toBe(3);
    });
});
