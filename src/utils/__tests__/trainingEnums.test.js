import { describe, expect, it } from 'vitest';
import { mapExerciseType, unmapExerciseType } from '../trainingEnums';

describe('unmapExerciseType (TBE-02)', () => {
    it('maps API int 2 to timeBased', () => {
        expect(unmapExerciseType(2)).toBe('timeBased');
    });

    it('maps API name TimeBased to timeBased', () => {
        expect(unmapExerciseType('TimeBased')).toBe('timeBased');
    });

    it('defaults missing or unknown values to weightBased', () => {
        expect(unmapExerciseType(undefined)).toBe('weightBased');
        expect(unmapExerciseType(null)).toBe('weightBased');
        expect(unmapExerciseType(99)).toBe('weightBased');
        expect(unmapExerciseType('Unknown')).toBe('weightBased');
    });
});

describe('mapExerciseType (TBE-02)', () => {
    it('maps timeBased string to 2', () => {
        expect(mapExerciseType('timeBased')).toBe(2);
    });

    it('defaults unknown to WeightBased (1)', () => {
        expect(mapExerciseType('bogus')).toBe(1);
    });
});
