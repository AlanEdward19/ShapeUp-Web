import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';

vi.mock('../../../hooks/useExercises', () => ({
    useExercises: () => ({ exercises: [] }),
}));
import {
    ExecutionLogHeaderCells,
    ExecutionLogInputCells,
    SessionDetailModal,
} from '../TrainingPlansClient';

describe('execution live row columns (TBE-04, TBE-05)', () => {
    it('shows duration/distance headers and inputs for TimeBased exercises', () => {
        localStorage.setItem('shapeup_language', 'en');
        const t = (key) => ({
            'client.session.table.duration': 'Duration',
            'client.session.table.distance': 'Distance',
            'client.session.table.weight': 'Weight',
            'client.session.table.reps': 'Reps',
        }[key] ?? key);

        render(withLang(
            <div className="su-exec-row su-exec-header">
                <ExecutionLogHeaderCells isTimeBased t={t} />
            </div>,
        ));
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Distance')).toBeInTheDocument();
        expect(screen.queryByText('Weight')).not.toBeInTheDocument();

        render(withLang(
            <ExecutionLogInputCells
                isTimeBased
                set={{ log: { duration: '05:00', distance: '' }, prescribedDuration: '05:00' }}
                invalidFields={['duration']}
                onFieldChange={() => {}}
                disabled={false}
            />,
        ));
        expect(screen.getByDisplayValue('05:00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('05:00')).toHaveClass('su-exec-input--invalid');
        expect(screen.getByPlaceholderText('--')).toBeInTheDocument();
    });

    it('shows weight/reps headers and inputs for WeightBased exercises', () => {
        localStorage.setItem('shapeup_language', 'en');
        const t = (key) => ({
            'client.session.table.duration': 'Duration',
            'client.session.table.distance': 'Distance',
            'client.session.table.weight': 'Weight',
            'client.session.table.reps': 'Reps',
        }[key] ?? key);

        render(withLang(
            <div className="su-exec-row su-exec-header">
                <ExecutionLogHeaderCells isTimeBased={false} t={t} />
            </div>,
        ));
        expect(screen.getByText('Weight')).toBeInTheDocument();
        expect(screen.getByText('Reps')).toBeInTheDocument();
        expect(screen.queryByText('Duration')).not.toBeInTheDocument();

        render(withLang(
            <ExecutionLogInputCells
                isTimeBased={false}
                set={{ log: { weight: '50', reps: '10' } }}
                invalidFields={[]}
                onFieldChange={() => {}}
                disabled={false}
            />,
        ));
        expect(screen.getByDisplayValue('50')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });
});

describe('SessionDetailModal summary columns (TBE-05)', () => {
    it('shows duration and distance instead of reps and weight for TimeBased history', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SessionDetailModal
                planName="Plan A"
                onClose={vi.fn()}
                planExercises={[{ name: 'Run', exerciseType: 'timeBased' }]}
                session={{
                    date: '2026-01-01',
                    duration: '45:00',
                    totalVol: '0 kg',
                    rpe: 7,
                    exercises: [{
                        name: 'Run',
                        sets: [{ set: 1, type: 'working', duration: 600, distance: 1000, rpe: 7 }],
                    }],
                }}
            />,
        ));
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Distance')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('1 km')).toBeInTheDocument();
        expect(screen.queryByText(/reps/i)).not.toBeInTheDocument();
    });

    it('shows reps and weight for WeightBased history', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SessionDetailModal
                planName="Plan B"
                onClose={vi.fn()}
                session={{
                    date: '2026-01-01',
                    duration: '30:00',
                    totalVol: '1000 kg',
                    rpe: 8,
                    exercises: [{
                        name: 'Squat',
                        exerciseType: 'weightBased',
                        sets: [{ set: 1, type: 'working', reps: 8, weight: 100, rpe: 8 }],
                    }],
                }}
            />,
        ));
        expect(screen.getByText('Reps')).toBeInTheDocument();
        expect(screen.getByText('Weight')).toBeInTheDocument();
        expect(screen.getByText('8 reps')).toBeInTheDocument();
    });

    it('lights the map from executed exercises only and shows Working for API set type 3', () => {
        localStorage.setItem('shapeup_language', 'en');
        const { container } = render(withLang(
            <SessionDetailModal
                planName="Plan C"
                onClose={vi.fn()}
                planExercises={[
                    { exerciseId: 1, name: 'Bench', muscles: [] },
                    { exerciseId: 9, name: 'Lat Pulldown', muscles: [] },
                ]}
                catalog={[
                    { id: 1, name: 'Bench Press', muscles: ['Chest'] },
                    { id: 9, name: 'Lat Pulldown', muscles: ['Lats'] },
                ]}
                session={{
                    date: '2026-01-01',
                    duration: '30:00',
                    totalVol: '1000 kg',
                    rpe: 8,
                    exercises: [
                        {
                            name: 'Lat Pulldown',
                            skipped: true,
                            sets: [],
                        },
                        {
                            name: 'Bench',
                            exerciseId: 1,
                            exerciseType: 'weightBased',
                            sets: [{ set: 1, type: 3, reps: 8, weight: 100, rpe: 8 }],
                        },
                    ],
                }}
            />,
        ));
        expect(screen.getByText('Working')).toBeInTheDocument();
        expect(container.querySelector('[data-region="MiddleChest"]')?.classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="Lats"]')?.classList.contains('is-hit')).toBe(false);
    });
});
