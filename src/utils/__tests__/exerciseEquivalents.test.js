import { describe, expect, it } from 'vitest';
import { mapExerciseEquivalents, unwrapEquivalentsPayload } from '../exerciseEquivalents';

const sampleResponse = {
    id: 2,
    name: 'Incline DB Press',
    namePt: 'Supino inclinado halteres',
    muscles: [{ muscleNamePt: 'Peitoral', muscleName: 'Chest', muscleGroup: 1 }],
    equipments: [{ equipmentNamePt: 'Halteres', equipmentName: 'Dumbbell' }],
};

describe('unwrapEquivalentsPayload', () => {
    it('accepts a bare array', () => {
        expect(unwrapEquivalentsPayload([sampleResponse])).toHaveLength(1);
    });

    it('accepts { items }', () => {
        expect(unwrapEquivalentsPayload({ items: [sampleResponse] })).toHaveLength(1);
    });

    it('returns empty for malformed payloads', () => {
        expect(unwrapEquivalentsPayload(null)).toEqual([]);
        expect(unwrapEquivalentsPayload({})).toEqual([]);
        expect(mapExerciseEquivalents(undefined)).toEqual({ equivalents: [], records: [] });
    });
});

describe('mapExerciseEquivalents', () => {
    it('maps id to exerciseId without matchLabel and localizes names', () => {
        const { equivalents, records } = mapExerciseEquivalents([sampleResponse], 'en');
        expect(equivalents).toEqual([{ exerciseId: 2 }]);
        expect(equivalents[0]).not.toHaveProperty('matchLabel');
        expect(records[0]).toMatchObject({
            id: 2,
            name: 'Incline DB Press',
            muscles: ['Chest'],
            equipments: [{ equipmentNamePt: 'Halteres', equipmentName: 'Dumbbell' }],
        });
        expect(mapExerciseEquivalents([sampleResponse], 'pt-BR').records[0].name).toBe('Supino inclinado halteres');
    });

    it('unwraps { items } shape', () => {
        const { equivalents } = mapExerciseEquivalents({ items: [sampleResponse] });
        expect(equivalents).toHaveLength(1);
        expect(equivalents[0].exerciseId).toBe(2);
    });
});
