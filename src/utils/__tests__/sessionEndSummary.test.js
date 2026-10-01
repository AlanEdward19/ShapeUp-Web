import { describe, expect, it } from 'vitest';
import { buildSessionEndSummary } from '../sessionEndSummary';

const set = (weight, completed = true) => ({ completed, log: { weight, reps: '5' } });
const past = (name, load) => ({ exercises: [{ name, sets: [{ load, reps: 5 }] }] });

describe('buildSessionEndSummary', () => {
    it('counts completed and total sets', () => {
        const summary = buildSessionEndSummary([{ name: 'Supino', sets: [set('80'), set('80'), set('80', false)] }], []);
        expect(summary).toMatchObject({ completedSets: 2, totalSets: 3, loadIncreases: 0 });
    });

    it('counts an exercise whose top load beat the last time it was done', () => {
        const summary = buildSessionEndSummary(
            [{ name: 'Supino', sets: [set('85')] }, { name: 'Agachamento', sets: [set('100')] }],
            [past('Supino', 80), past('Agachamento', 100)],
        );
        expect(summary.loadIncreases).toBe(1);
    });

    it('compares against the most recent session that had the exercise only', () => {
        const summary = buildSessionEndSummary(
            [{ name: 'Supino', sets: [set('85')] }],
            [past('Remada', 50), past('Supino', 90), past('Supino', 40)],
        );
        expect(summary.loadIncreases).toBe(0);
    });

    it('does not count first time, unfinished sets or missing history', () => {
        expect(buildSessionEndSummary([{ name: 'Supino', sets: [set('85')] }], []).loadIncreases).toBe(0);
        expect(buildSessionEndSummary([{ name: 'Supino', sets: [set('85', false)] }], [past('Supino', 80)]).loadIncreases).toBe(0);
        expect(buildSessionEndSummary(undefined, undefined)).toEqual({ totalSets: 0, completedSets: 0, loadIncreases: 0 });
    });

    it('finds the last time by date even when the history is not newest first', () => {
        const summary = buildSessionEndSummary(
            [{ name: 'Supino', sets: [set('85')] }],
            [
                { startedAtUtc: '2026-08-01T10:00:00Z', exercises: [{ name: 'Supino', sets: [{ load: 60 }] }] },
                { startedAtUtc: '2026-09-20T10:00:00Z', exercises: [{ name: 'Supino', sets: [{ load: 90 }] }] },
            ],
        );
        expect(summary.loadIncreases).toBe(0);
    });
});
