import { describe, expect, it } from 'vitest';
import { collectMuscleHits, resolveMuscleToken } from '../muscleRegions';

describe('resolveMuscleToken', () => {
    it('maps enum names and PT/EN aliases to leaf regions', () => {
        expect(resolveMuscleToken('UpperChest')).toEqual(['UpperChest']);
        expect(resolveMuscleToken('Peito Médio')).toEqual(['MiddleChest']);
        expect(resolveMuscleToken('Front Delt')).toEqual(['DeltoidAnterior']);
        expect(resolveMuscleToken('Latissimus Dorsi')).toEqual(['Lats']);
        expect(resolveMuscleToken('Quads')).toEqual(['Quadriceps']);
        expect(resolveMuscleToken('Isquiotibiais')).toEqual(['Hamstrings']);
    });

    it('expands composite groups into leaf muscles', () => {
        expect(resolveMuscleToken('Chest')).toEqual(['UpperChest', 'MiddleChest', 'LowerChest']);
        expect(resolveMuscleToken('Shoulders')).toEqual(['DeltoidAnterior', 'DeltoidLateral', 'DeltoidPosterior']);
    });

    it('ignores unknown labels', () => {
        expect(resolveMuscleToken('Unknown')).toEqual([]);
        expect(resolveMuscleToken('')).toEqual([]);
    });
});

describe('collectMuscleHits', () => {
    it('counts each exercise once per region and reads tags as fallback', () => {
        const hits = collectMuscleHits([
            { muscles: ['Chest', 'Triceps', 'Front Delt'] },
            { muscles: ['Peito Superior', 'Tríceps'] },
            { tags: 'Hamstrings • Glutes' },
        ]);
        expect(hits.UpperChest).toBe(2);
        expect(hits.MiddleChest).toBe(1);
        expect(hits.LowerChest).toBe(1);
        expect(hits.Triceps).toBe(2);
        expect(hits.DeltoidAnterior).toBe(1);
        expect(hits.Hamstrings).toBe(1);
        expect(hits.Glutes).toBe(1);
    });
});
