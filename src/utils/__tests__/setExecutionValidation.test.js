import { describe, expect, it } from 'vitest';
import {
    canCompleteLoggedSet,
    clampRpeLog,
    isValidLoggedReps,
    isValidLoggedRpe,
    isValidLoggedWeight,
    parseLoggedNumber,
} from '../setExecutionValidation';

describe('parseLoggedNumber', () => {
    it('returns null for empty, whitespace, and non-numeric values', () => {
        expect(parseLoggedNumber('')).toBeNull();
        expect(parseLoggedNumber('   ')).toBeNull();
        expect(parseLoggedNumber(null)).toBeNull();
        expect(parseLoggedNumber('abc')).toBeNull();
        expect(parseLoggedNumber(NaN)).toBeNull();
    });

    it('parses finite numeric strings including zero', () => {
        expect(parseLoggedNumber('0')).toBe(0);
        expect(parseLoggedNumber(' 12.5 ')).toBe(12.5);
    });
});

describe('canCompleteLoggedSet weight and reps (WEV-01)', () => {
    it('refuses empty, negative, and NaN weight', () => {
        expect(canCompleteLoggedSet({ weight: '', reps: '8' }).ok).toBe(false);
        expect(canCompleteLoggedSet({ weight: '', reps: '8' }).missing).toContain('weight');
        expect(canCompleteLoggedSet({ weight: '-1', reps: '8' }).ok).toBe(false);
        expect(canCompleteLoggedSet({ weight: 'foo', reps: '8' }).missing).toContain('weight');
        expect(isValidLoggedWeight('-0.1')).toBe(false);
    });

    it('refuses empty, zero, and non-integer reps', () => {
        expect(canCompleteLoggedSet({ weight: '0', reps: '' }).ok).toBe(false);
        expect(canCompleteLoggedSet({ weight: '0', reps: '' }).missing).toContain('reps');
        expect(canCompleteLoggedSet({ weight: '0', reps: '0' }).ok).toBe(false);
        expect(canCompleteLoggedSet({ weight: '0', reps: '1.5' }).ok).toBe(false);
        expect(isValidLoggedReps('1.5')).toBe(false);
        expect(isValidLoggedReps('0')).toBe(false);
    });

    it('accepts weight 0 with integer reps >= 1', () => {
        expect(canCompleteLoggedSet({ weight: '0', reps: '1' })).toEqual({ ok: true, missing: [] });
        expect(canCompleteLoggedSet({ weight: '0', reps: '12' }).ok).toBe(true);
        expect(isValidLoggedWeight('0')).toBe(true);
    });

    it('accepts valid weight and reps when requireRpe is false', () => {
        expect(canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '', requireRpe: false }).ok).toBe(true);
    });
});

describe('canCompleteLoggedSet RPE (WEV-07)', () => {
    it('refuses empty RPE when requireRpe is true', () => {
        const result = canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '', requireRpe: true });
        expect(result.ok).toBe(false);
        expect(result.missing).toEqual(['rpe']);
        expect(isValidLoggedRpe('')).toBe(false);
    });

    it('accepts empty RPE when requireRpe is false', () => {
        expect(canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '', requireRpe: false }).ok).toBe(true);
        expect(canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '' }).ok).toBe(true);
    });

    it('treats failure with rpe 10 as filled required RPE', () => {
        expect(canCompleteLoggedSet({
            weight: '60',
            reps: '8',
            rpe: '10',
            requireRpe: true,
            failure: true,
        }).ok).toBe(true);
    });

    it('still requires a valid 1-10 RPE when requireRpe is true and failure is false', () => {
        expect(canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '8', requireRpe: true }).ok).toBe(true);
        expect(canCompleteLoggedSet({ weight: '60', reps: '8', rpe: '11', requireRpe: true }).ok).toBe(false);
    });
});

describe('clampRpeLog (WEV-08)', () => {
    it('keeps empty string empty', () => {
        expect(clampRpeLog('')).toBe('');
        expect(clampRpeLog('   ')).toBe('');
    });

    it('clamps values above 10 down to 10', () => {
        expect(clampRpeLog('15')).toBe('10');
    });

    it('rounds non-integers then clamps to 1-10', () => {
        expect(clampRpeLog('8.5')).toBe('9');
        expect(clampRpeLog('0.4')).toBe('1');
        expect(clampRpeLog('-2')).toBe('1');
    });
});
