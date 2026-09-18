import { describe, expect, it } from 'vitest';
import { buildWorkoutPlanBody } from '../TrainingPlansIndependent';

describe('Independent buildWorkoutPlanBody requireRpe (WEV-05)', () => {
    it('includes requireRpe on each exercise in the independent plan body', () => {
        const body = buildWorkoutPlanBody({
            name: 'Solo',
            weeks: 4,
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            blocks: [{
                type: 'straight',
                exercises: [
                    { exerciseId: 9, requireRpe: true, sets: [] },
                    { exerciseId: 10, requireRpe: false, sets: [] },
                ],
            }],
        }, 'user-9');
        expect(body.blocks[0].exercises[0].requireRpe).toBe(true);
        expect(body.blocks[0].exercises[1].requireRpe).toBe(false);
    });
});
