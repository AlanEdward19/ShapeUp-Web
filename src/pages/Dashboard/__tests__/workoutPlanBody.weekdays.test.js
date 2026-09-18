import { describe, expect, it } from 'vitest';
import { buildWorkoutPlanBody as buildClientPlanBody } from '../ClientDetail';
import { buildWorkoutPlanBody as buildIndependentPlanBody } from '../TrainingPlansIndependent';

const basePlan = {
    name: 'Test',
    weeks: 4,
    phase: 'Hypertrophy',
    difficulty: 'Intermediate',
    blocks: [],
};

describe('ClientDetail buildWorkoutPlanBody assignedWeekdays (WSD-02)', () => {
    it('maps weekday indices to API enum strings', () => {
        const body = buildClientPlanBody({ ...basePlan, assignedWeekdays: [1, 4] }, 'user-1');
        expect(body.assignedWeekdays).toEqual(['Monday', 'Thursday']);
    });

    it('sends an empty array when no weekdays are selected', () => {
        const body = buildClientPlanBody({ ...basePlan, assignedWeekdays: [] }, 'user-1');
        expect(body.assignedWeekdays).toEqual([]);
    });
});

describe('TrainingPlansIndependent buildWorkoutPlanBody assignedWeekdays (WSD-02)', () => {
    it('maps weekday indices to API enum strings', () => {
        const body = buildIndependentPlanBody({ ...basePlan, assignedWeekdays: [1, 4] }, 'user-2');
        expect(body.assignedWeekdays).toEqual(['Monday', 'Thursday']);
    });

    it('sends an empty array when no weekdays are selected', () => {
        const body = buildIndependentPlanBody({ ...basePlan, assignedWeekdays: [] }, 'user-2');
        expect(body.assignedWeekdays).toEqual([]);
    });
});
