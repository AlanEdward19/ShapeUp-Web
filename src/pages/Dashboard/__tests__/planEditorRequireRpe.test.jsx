import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import { applyRequireRpeToAll } from '../../../utils/trainingNormalization';

vi.mock('@reactour/tour', () => ({
    useTour: () => ({ setIsOpen: vi.fn(), setSteps: vi.fn(), setCurrentStep: vi.fn() }),
}));

vi.mock('../../../hooks/useExercises', () => ({
    useExercises: () => ({ exercises: [] }),
}));

import { buildWorkoutPlanBody, PlanEditor } from '../ClientDetail';

const set = { type: 'working', technique: 'Straight', reps: '8', load: '75', intensityType: 'rpe', intensityValue: '8', rest: '90' };

const twoBlockPlan = {
    name: 'A',
    phase: 'Hypertrophy',
    difficulty: 'Intermediate',
    weeks: 4,
    notes: '',
    blocks: [
        { id: 'b1', type: 'straight', timeCapSeconds: '', intervalSeconds: '', totalRounds: '', restAfterSeconds: '', exercises: [
            { id: 'e1', exerciseId: 1, name: 'Squat', tags: '', notes: '', requireRpe: false, sets: [{ ...set }] },
            { id: 'e2', exerciseId: 2, name: 'Bench', tags: '', notes: '', requireRpe: true, sets: [{ ...set }] },
        ] },
        { id: 'b2', type: 'straight', timeCapSeconds: '', intervalSeconds: '', totalRounds: '', restAfterSeconds: '', exercises: [
            { id: 'e3', exerciseId: 3, name: 'Row', tags: '', notes: '', requireRpe: false, sets: [{ ...set }] },
        ] },
    ],
};

describe('buildWorkoutPlanBody requireRpe (WEV-05)', () => {
    it('includes requireRpe per exercise in the save body', () => {
        const body = buildWorkoutPlanBody(twoBlockPlan, 'user-1');
        expect(body.blocks[0].exercises[0].requireRpe).toBe(false);
        expect(body.blocks[0].exercises[1].requireRpe).toBe(true);
        expect(body.blocks[1].exercises[0].requireRpe).toBe(false);
    });
});

describe('PlanEditor bulk require RPE (WEV-06)', () => {
    beforeEach(() => {
        localStorage.setItem('shapeup_language', 'en');
        localStorage.setItem('shapeup_plan_editor_tour_seen', 'true');
    });

    it('disables bulk when the plan has zero exercises', () => {
        render(withLang(
            <PlanEditor
                plan={{ ...twoBlockPlan, blocks: [] }}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        ));
        expect(screen.getByRole('button', { name: 'Require RPE on all' })).toBeDisabled();
    });

    it('bulk-applies locally without saving, then an individual toggle wins', () => {
        const onSave = vi.fn();
        render(withLang(
            <PlanEditor plan={twoBlockPlan} onSave={onSave} onCancel={vi.fn()} />
        ));
        fireEvent.click(screen.getByRole('button', { name: 'Require RPE on all' }));
        expect(onSave).not.toHaveBeenCalled();

        const toggles = screen.getAllByRole('button', { name: 'Required RPE' });
        expect(toggles).toHaveLength(3);
        toggles.forEach((btn) => expect(btn).toHaveAttribute('aria-pressed', 'true'));

        fireEvent.click(toggles[1]);
        expect(toggles[1]).toHaveAttribute('aria-pressed', 'false');
        expect(toggles[0]).toHaveAttribute('aria-pressed', 'true');
        expect(toggles[2]).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(screen.getAllByRole('button', { name: 'Save Plan' })[0]);
        expect(onSave).toHaveBeenCalledTimes(1);
        const saved = onSave.mock.calls[0][0];
        expect(saved.blocks[0].exercises[0].requireRpe).toBe(true);
        expect(saved.blocks[0].exercises[1].requireRpe).toBe(false);
        expect(saved.blocks[1].exercises[0].requireRpe).toBe(true);
        expect(applyRequireRpeToAll(twoBlockPlan.blocks)[0].exercises[0].requireRpe).toBe(true);
    });
});
