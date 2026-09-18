import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import { PlanEditor } from '../ClientDetail';

vi.mock('@reactour/tour', () => ({
    useTour: () => ({ setIsOpen: vi.fn(), setSteps: vi.fn(), setCurrentStep: vi.fn() }),
}));

vi.mock('../../../hooks/useExercises', () => ({
    useExercises: () => ({ exercises: [] }),
}));

const basePlan = {
    name: 'Plan A',
    phase: 'Hypertrophy',
    difficulty: 'Intermediate',
    weeks: 4,
    notes: '',
    assignedWeekdays: [],
    blocks: [],
};

describe('PlanEditor weekday selector (WSD-02)', () => {
    beforeEach(() => {
        localStorage.setItem('shapeup_language', 'en');
        localStorage.setItem('shapeup_plan_editor_tour_seen', 'true');
    });

    it('shows weekday toggles for a workout plan and saves Mon+Thu', () => {
        const onSave = vi.fn();
        render(withLang(<PlanEditor plan={basePlan} onSave={onSave} onCancel={vi.fn()} />));

        expect(screen.getByTestId('weekday-selector')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('weekday-1'));
        fireEvent.click(screen.getByTestId('weekday-4'));
        fireEvent.click(screen.getAllByRole('button', { name: 'Save Plan' })[0]);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave.mock.calls[0][0].assignedWeekdays).toEqual([1, 4]);
    });

    it('persists an empty weekday list when all toggles are cleared', () => {
        const onSave = vi.fn();
        render(withLang(
            <PlanEditor plan={{ ...basePlan, assignedWeekdays: [1, 4] }} onSave={onSave} onCancel={vi.fn()} />,
        ));

        fireEvent.click(screen.getByTestId('weekday-1'));
        fireEvent.click(screen.getByTestId('weekday-4'));
        fireEvent.click(screen.getAllByRole('button', { name: 'Save Plan' })[0]);

        expect(onSave.mock.calls[0][0].assignedWeekdays).toEqual([]);
    });

    it('hides the selector when editing a template', () => {
        render(withLang(
            <PlanEditor plan={{ ...basePlan, _templateId: 99 }} onSave={vi.fn()} onCancel={vi.fn()} />,
        ));
        expect(screen.queryByTestId('weekday-selector')).not.toBeInTheDocument();
    });
});
