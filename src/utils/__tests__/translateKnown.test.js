import { describe, expect, it } from 'vitest';
import { difficultyLabel, phaseLabel, translateKnown } from '../translateKnown';

const dict = {
    'pro.builder.phase.hypertrophy': 'Hypertrophy',
    'pro.builder.phase.strength': 'Strength / Power',
    'client.training.difficulty.beginner': 'Beginner',
    'client.training.difficulty.intermediate': 'Intermediate',
};

const t = (key) => dict[key] ?? key;

describe('translateKnown', () => {
    it('returns fallback when t echoes the key', () => {
        expect(translateKnown(t, 'missing.key', 'raw value')).toBe('raw value');
    });

    it('returns the translation when the key exists', () => {
        expect(translateKnown(t, 'pro.builder.phase.hypertrophy', 'Hypertrophy')).toBe('Hypertrophy');
    });
});

describe('phaseLabel', () => {
    it('uses pro.builder.phase.* for known phases', () => {
        expect(phaseLabel(t, 'Hypertrophy')).toBe('Hypertrophy');
        expect(phaseLabel(t, 'Strength')).toBe('Strength / Power');
    });

    it('returns the raw phase when the key is unknown', () => {
        expect(phaseLabel(t, 'CustomPeak')).toBe('CustomPeak');
        expect(phaseLabel(t, 'undefined')).toBe('undefined');
    });
});

describe('difficultyLabel', () => {
    it('uses client.training.difficulty.* for known difficulties', () => {
        expect(difficultyLabel(t, 'Beginner')).toBe('Beginner');
        expect(difficultyLabel(t, 'Intermediate')).toBe('Intermediate');
    });

    it('returns the raw difficulty when the key is unknown', () => {
        expect(difficultyLabel(t, 'Elite')).toBe('Elite');
    });
});
