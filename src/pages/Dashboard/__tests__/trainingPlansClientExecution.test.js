import { describe, expect, it } from 'vitest';
import {
    applyToggleLoggedSetComplete,
    applyUpdateSetLog,
    execInputClassName,
    INVALID_LOG_FLASH_MS,
} from '../TrainingPlansClient';

const setOf = (overrides = {}) => ({
    id: 's1',
    completed: false,
    failure: false,
    isExtra: false,
    prescribedRest: 90,
    log: { weight: '', reps: '', rpe: '' },
    ...overrides,
    log: { weight: '', reps: '', rpe: '', ...(overrides.log || {}) },
});

const session = (sets, requireRpe = false) => [{
    exerciseId: 1,
    requireRpe,
    sets,
}];

describe('client execution weight/reps gate (WEV-01)', () => {
    it('refuses complete and rest when weight or reps are invalid', () => {
        const empty = applyToggleLoggedSetComplete(session([setOf()]), 0, 0);
        expect(empty.exercises[0].sets[0].completed).toBe(false);
        expect(empty.startRest).toBe(false);
        expect(empty.missing).toEqual(expect.arrayContaining(['weight', 'reps']));
        expect(execInputClassName(empty.missing, 'weight')).toBe('su-exec-input su-exec-input--invalid');
        expect(INVALID_LOG_FLASH_MS).toBe(800);
    });

    it('completes with weight 0 and integer reps >= 1 and starts rest', () => {
        const result = applyToggleLoggedSetComplete(
            session([setOf({ log: { weight: '0', reps: '12' } })]),
            0,
            0,
        );
        expect(result.exercises[0].sets[0].completed).toBe(true);
        expect(result.startRest).toBe(true);
        expect(result.missing).toEqual([]);
    });

    it('uncompletes a finished set when the log becomes invalid', () => {
        const completed = session([setOf({ completed: true, log: { weight: '60', reps: '8' } })]);
        const next = applyUpdateSetLog(completed, 0, 0, 'reps', '');
        expect(next[0].sets[0].completed).toBe(false);
        expect(next[0].sets[0].log.reps).toBe('');
    });

    it('applies the same gate to extra sets', () => {
        const extraEmpty = applyToggleLoggedSetComplete(
            session([setOf({ isExtra: true, id: 'extra_1' })]),
            0,
            0,
        );
        expect(extraEmpty.exercises[0].sets[0].completed).toBe(false);
        expect(extraEmpty.startRest).toBe(false);

        const extraOk = applyToggleLoggedSetComplete(
            session([setOf({ isExtra: true, id: 'extra_1', log: { weight: '20', reps: '6' }, prescribedRest: 60 })]),
            0,
            0,
        );
        expect(extraOk.exercises[0].sets[0].completed).toBe(true);
        expect(extraOk.startRest).toBe(true);
    });
});
