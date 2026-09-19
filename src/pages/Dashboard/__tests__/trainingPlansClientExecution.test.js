import { describe, expect, it } from 'vitest';
import {
    applyToggleLoggedSetComplete,
    applyUpdateSetLog,
    execInputClassName,
    INVALID_LOG_FLASH_MS,
    mergeSessionRequireRpe,
    toRuntimeSets,
} from '../TrainingPlansClient';

const setOf = (overrides = {}) => {
    const { log: logOverrides, ...rest } = overrides;
    return {
        id: 's1',
        completed: false,
        failure: false,
        isExtra: false,
        prescribedRest: 90,
        log: { weight: '', reps: '', rpe: '', ...logOverrides },
        ...rest,
    };
};

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

describe('client execution duration gate (TBE-03, TBE-04)', () => {
    const timeSession = (sets, requireRpe = false) => [{
        exerciseType: 'timeBased',
        requireRpe,
        sets,
    }];

    const timeSet = (overrides = {}) => {
        const { log: logOverrides, ...rest } = overrides;
        return {
            id: 's1',
            completed: false,
            failure: false,
            isExtra: false,
            prescribedRest: 90,
            log: { duration: '', distance: '', rpe: '', weight: '', reps: '', ...logOverrides },
            ...rest,
        };
    };

    it('refuses complete, skips rest, and highlights duration when blank', () => {
        const result = applyToggleLoggedSetComplete(timeSession([timeSet()]), 0, 0);
        expect(result.exercises[0].sets[0].completed).toBe(false);
        expect(result.startRest).toBe(false);
        expect(result.missing).toEqual(expect.arrayContaining(['duration']));
        expect(execInputClassName(result.missing, 'duration')).toBe('su-exec-input su-exec-input--invalid');
    });

    it('completes with valid duration and starts rest', () => {
        const result = applyToggleLoggedSetComplete(
            timeSession([timeSet({ log: { duration: '05:00' } })]),
            0,
            0,
        );
        expect(result.exercises[0].sets[0].completed).toBe(true);
        expect(result.startRest).toBe(true);
        expect(result.missing).toEqual([]);
    });
});

describe('client required RPE and clamp (WEV-07, WEV-08)', () => {
    it('refuses complete when requireRpe is true and RPE is empty', () => {
        const result = applyToggleLoggedSetComplete(
            session([setOf({ log: { weight: '60', reps: '8', rpe: '' } })], true),
            0,
            0,
        );
        expect(result.exercises[0].sets[0].completed).toBe(false);
        expect(result.startRest).toBe(false);
        expect(result.missing).toEqual(['rpe']);
        expect(execInputClassName(result.missing, 'rpe')).toBe('su-exec-input su-exec-input--invalid');
    });

    it('allows empty RPE when requireRpe is false', () => {
        const result = applyToggleLoggedSetComplete(
            session([setOf({ log: { weight: '60', reps: '8', rpe: '' } })], false),
            0,
            0,
        );
        expect(result.missing).toEqual([]);
        expect(result.exercises[0].sets[0].completed).toBe(true);
    });

    it('allows failure with RPE 10 when RPE is required', () => {
        const result = applyToggleLoggedSetComplete(
            session([setOf({ failure: true, log: { weight: '60', reps: '8', rpe: '10' } })], true),
            0,
            0,
        );
        expect(result.exercises[0].sets[0].completed).toBe(true);
    });

    it('clamps RPE on log update to 1-10 integers and keeps optional empty', () => {
        const base = session([setOf({ log: { weight: '60', reps: '8', rpe: '' } })], false);
        expect(applyUpdateSetLog(base, 0, 0, 'rpe', '15')[0].sets[0].log.rpe).toBe('10');
        expect(applyUpdateSetLog(base, 0, 0, 'rpe', '8.5')[0].sets[0].log.rpe).toBe('9');
        expect(applyUpdateSetLog(base, 0, 0, 'rpe', '')[0].sets[0].log.rpe).toBe('');
    });

    it('copies requireRpe into runtime sets and prefers the session snapshot on resume', () => {
        expect(toRuntimeSets({ exerciseId: 1, requireRpe: true, sets: [] }, 0).requireRpe).toBe(true);
        expect(toRuntimeSets({ exerciseId: 1, sets: [] }, 0).requireRpe).toBe(false);

        const planExercises = [{ exerciseId: 1, requireRpe: false }];
        const sessionExercises = [{ exerciseId: 1, requireRpe: true }];
        expect(mergeSessionRequireRpe(planExercises, sessionExercises)[0].requireRpe).toBe(true);
        expect(mergeSessionRequireRpe(planExercises, undefined)[0].requireRpe).toBe(false);
    });
});
