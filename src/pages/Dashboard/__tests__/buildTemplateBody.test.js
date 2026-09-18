import { describe, expect, it } from 'vitest';
import { buildTemplateBody } from '../TrainingPlansProfessional';

describe('buildTemplateBody requireRpe (WEV-05)', () => {
    it('sends requireRpe as a boolean per exercise on template save', () => {
        const body = buildTemplateBody({
            name: 'T',
            weeks: 4,
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            blocks: [{
                type: 'straight',
                exercises: [
                    { exerciseId: 1, requireRpe: true, sets: [] },
                    { exerciseId: 2, sets: [] },
                ],
            }],
        });
        expect(body.blocks[0].exercises[0].requireRpe).toBe(true);
        expect(body.blocks[0].exercises[1].requireRpe).toBe(false);
    });
});
