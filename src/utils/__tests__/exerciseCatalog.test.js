import { describe, expect, it } from 'vitest';
import {
    exerciseMatchesMuscleFilter,
    localizeExercise,
    pickLocalized,
} from '../exerciseCatalog';

const bench = {
    id: 1,
    name: 'Incline DB Press',
    namePt: 'Supino inclinado halteres',
    muscles: [{ muscleName: 'Chest', muscleNamePt: 'Peitoral', muscleGroup: 1 }],
    equipments: [{ equipmentName: 'Dumbbell', equipmentNamePt: 'Halteres' }],
};

describe('pickLocalized', () => {
    it('prefers Portuguese only for pt-BR', () => {
        expect(pickLocalized('pt-BR', 'Chest', 'Peitoral')).toBe('Peitoral');
        expect(pickLocalized('en', 'Chest', 'Peitoral')).toBe('Chest');
        expect(pickLocalized('es', 'Chest', 'Peitoral')).toBe('Chest');
        expect(pickLocalized('en', '', 'Peitoral')).toBe('Peitoral');
    });
});

describe('localizeExercise', () => {
    it('uses English catalog names outside pt-BR', () => {
        const en = localizeExercise(bench, 'en');
        expect(en.name).toBe('Incline DB Press');
        expect(en.muscles).toEqual(['Chest']);
        expect(en.equipment).toBe('Dumbbell');
    });

    it('uses Portuguese catalog names for pt-BR', () => {
        const pt = localizeExercise(bench, 'pt-BR');
        expect(pt.name).toBe('Supino inclinado halteres');
        expect(pt.muscles).toEqual(['Peitoral']);
        expect(pt.equipment).toBe('Halteres');
    });

    it('labels API muscleGroup flags when the DTO has no names', () => {
        const localized = localizeExercise({
            id: 9,
            name: 'Lat Pulldown',
            muscles: [{ muscleGroup: 1 << 13, activationPercent: 80 }],
        }, 'en');
        expect(localized.muscles).toEqual(['Lats']);
        expect(localized.muscleDetails).toEqual([{ muscleGroup: 1 << 13, activationPercent: 80 }]);
    });

    it('unwraps Newtonsoft $values muscle lists', () => {
        const localized = localizeExercise({
            id: 2,
            name: 'Row',
            muscles: { $values: [{ muscleGroup: 1 << 13, activationPercent: 70 }] },
        }, 'en');
        expect(localized.muscles).toEqual(['Lats']);
    });

    it('builds filter chips only from muscles present on API exercises', () => {
        const labels = [
            localizeExercise({ id: 1, name: 'A', muscles: [{ muscleName: 'Chest', muscleNamePt: 'Peitoral', muscleGroup: 7 }] }, 'en'),
            localizeExercise({ id: 2, name: 'B', muscles: [{ muscleName: 'Lats', muscleNamePt: 'Latíssimo', muscleGroup: 8192 }] }, 'en'),
            localizeExercise({ id: 3, name: 'C', muscles: [] }, 'en'),
        ].flatMap((ex) => ex.muscles);
        expect([...new Set(labels)].sort()).toEqual(['Chest', 'Lats']);
    });
});

describe('exerciseMatchesMuscleFilter', () => {
    it('matches Peitoral against Chest via leaf aliases', () => {
        const localized = localizeExercise(bench, 'pt-BR');
        expect(exerciseMatchesMuscleFilter(localized, 'Chest')).toBe(true);
        expect(exerciseMatchesMuscleFilter(localized, 'Peitoral')).toBe(true);
        expect(exerciseMatchesMuscleFilter(localized, 'Quadriceps')).toBe(false);
    });
});
