import { describe, expect, it } from 'vitest';
import { canCompleteSet, shouldUncompleteSet } from '../setCompletionGate';

const weightEx = { exerciseType: 'weightBased', requireRpe: false };
const timeEx = { exerciseType: 'timeBased', requireRpe: false };
const timeRequireRpe = { exerciseType: 'timeBased', requireRpe: true };

describe('canCompleteSet WeightBased regression (TBE-03 AC1)', () => {
    it('applies WEV-01 weight and reps rules unchanged', () => {
        expect(canCompleteSet(weightEx, { log: { weight: '', reps: '8' }, failure: false }).ok).toBe(false);
        expect(canCompleteSet(weightEx, { log: { weight: '0', reps: '1' }, failure: false }).ok).toBe(true);
    });
});

describe('canCompleteSet TimeBased duration (TBE-03 AC2–AC3)', () => {
    it('refuses blank or invalid duration', () => {
        const blank = canCompleteSet(timeEx, { log: { duration: '', distance: '' }, failure: false });
        expect(blank.ok).toBe(false);
        expect(blank.missing).toContain('duration');

        const invalid = canCompleteSet(timeEx, { log: { duration: 'abc', distance: '' }, failure: false });
        expect(invalid.ok).toBe(false);
        expect(invalid.missing).toContain('duration');
    });

    it('allows completion with duration and empty distance', () => {
        expect(canCompleteSet(timeEx, { log: { duration: '10:00', distance: '' }, failure: false }).ok).toBe(true);
    });
});

describe('canCompleteSet TimeBased distance (TBE-03 AC4)', () => {
    it('refuses negative or non-numeric distance when filled', () => {
        const bad = canCompleteSet(timeEx, { log: { duration: '05:00', distance: '-1' }, failure: false });
        expect(bad.ok).toBe(false);
        expect(bad.missing).toContain('distance');
    });
});

describe('shouldUncompleteSet (TBE-03 AC5)', () => {
    it('uncompletes TimeBased set when duration is cleared', () => {
        const set = { completed: true, log: { duration: '', distance: '' }, failure: false };
        expect(shouldUncompleteSet(timeEx, set)).toBe(true);
    });

    it('uncompletes WeightBased set when reps cleared (WEV AC6)', () => {
        const set = { completed: true, log: { weight: '0', reps: '' }, failure: false };
        expect(shouldUncompleteSet(weightEx, set)).toBe(true);
    });
});

describe('canCompleteSet extra TimeBased set (TBE-03 AC6)', () => {
    it('applies duration gate on extra sets', () => {
        expect(canCompleteSet(timeEx, { isExtra: true, log: { duration: '', distance: '' }, failure: false }).ok).toBe(false);
    });
});

describe('canCompleteSet RequireRpe on TimeBased (TBE-03 AC7)', () => {
    it('still requires RPE when requireRpe is true', () => {
        const result = canCompleteSet(timeRequireRpe, { log: { duration: '05:00', distance: '', rpe: '' }, failure: false });
        expect(result.ok).toBe(false);
        expect(result.missing).toContain('rpe');
    });
});
