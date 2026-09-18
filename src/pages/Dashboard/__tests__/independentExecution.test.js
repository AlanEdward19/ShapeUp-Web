import { describe, expect, it } from 'vitest';
import {
    applyToggleLoggedSetComplete,
    applyUpdateSetLog,
    independentRestKicker,
    toRuntimeSets,
} from '../TrainingPlansIndependent';

describe('independent execution validation (WEV-01, WEV-03, WEV-07, WEV-08)', () => {
    it('refuses empty sets and missing required RPE on the check-circle path', () => {
        const empty = applyToggleLoggedSetComplete([{
            requireRpe: false,
            sets: [{ completed: false, failure: false, prescribedRest: 90, log: { weight: '', reps: '', rpe: '' } }],
        }], 0, 0);
        expect(empty.exercises[0].sets[0].completed).toBe(false);
        expect(empty.startRest).toBe(false);

        const missingRpe = applyToggleLoggedSetComplete([{
            requireRpe: true,
            sets: [{ completed: false, failure: false, prescribedRest: 90, log: { weight: '50', reps: '8', rpe: '' } }],
        }], 0, 0);
        expect(missingRpe.missing).toEqual(['rpe']);
        expect(missingRpe.exercises[0].sets[0].completed).toBe(false);
    });

    it('clamps RPE the same as the client execution log', () => {
        const exercises = [{
            requireRpe: false,
            sets: [{ completed: false, failure: false, log: { weight: '50', reps: '8', rpe: '' } }],
        }];
        expect(applyUpdateSetLog(exercises, 0, 0, 'rpe', '15')[0].sets[0].log.rpe).toBe('10');
        expect(applyUpdateSetLog(exercises, 0, 0, 'rpe', '8.5')[0].sets[0].log.rpe).toBe('9');
        expect(applyUpdateSetLog(exercises, 0, 0, 'rpe', '')[0].sets[0].log.rpe).toBe('');
    });

    it('copies requireRpe into runtime sets and does not use a literal Rest kicker', () => {
        expect(toRuntimeSets({ exerciseId: 4, requireRpe: true, sets: [] }, 0).requireRpe).toBe(true);
        expect(independentRestKicker((key) => (key === 'client.session.timer.rest_label' ? 'Descanso' : key))).toBe('Descanso');
        expect(independentRestKicker((key) => (key === 'client.session.timer.rest_label' ? 'Descanso' : key))).not.toBe('Rest');
    });
});
