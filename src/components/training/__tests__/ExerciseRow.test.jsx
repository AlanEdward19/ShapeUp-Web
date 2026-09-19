import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import ExerciseRow from '../ExerciseRow';

const baseExercise = {
    name: 'Squat',
    tags: '',
    notes: '',
    sets: [{ type: 'working', technique: 'Straight', reps: '8', load: '75', intensityType: 'rpe', intensityValue: '8', rest: '90' }],
};

describe('ExerciseRow time-based columns (TBE-02)', () => {
    it('shows duration/distance headers for timeBased exercises', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow
                exercise={{ ...baseExercise, exerciseType: 'timeBased', sets: [{ ...baseExercise.sets[0], duration: '05:00', distance: '' }] }}
                blockType="straight"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Distance (m)')).toBeInTheDocument();
    });

    it('locks nested set technique to Straight for timeBased (TBE-02 AC2)', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow
                exercise={{ ...baseExercise, exerciseType: 'timeBased', sets: [{ ...baseExercise.sets[0], duration: '05:00', distance: '' }] }}
                blockType="straight"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        const techniqueSelect = screen.getAllByRole('combobox')[1];
        expect(techniqueSelect).toBeDisabled();
        expect(within(techniqueSelect).getAllByRole('option')).toHaveLength(1);
        expect(screen.queryByRole('option', { name: /drop set/i })).not.toBeInTheDocument();
    });

    it('shows reps/load headers for weightBased exercises', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow exercise={baseExercise} blockType="straight" onChange={() => {}} onRemove={() => {}} />
        ));
        expect(screen.getByText('Reps')).toBeInTheDocument();
        expect(screen.getByText('Load %')).toBeInTheDocument();
    });
});

describe('ExerciseRow requireRpe toggle (WEV-05)', () => {
    it('renders off by default and calls onChange with true on click', () => {
        const onChange = vi.fn();
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow exercise={baseExercise} blockType="straight" onChange={onChange} onRemove={() => {}} />
        ));
        const toggle = screen.getByRole('button', { name: 'Required RPE' });
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        fireEvent.click(toggle);
        expect(onChange).toHaveBeenCalledWith('requireRpe', true);
    });

    it('renders on when exercise.requireRpe is true and click sends false', () => {
        const onChange = vi.fn();
        const onRemove = vi.fn();
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow
                exercise={{ ...baseExercise, requireRpe: true }}
                blockType="straight"
                onChange={onChange}
                onRemove={onRemove}
            />
        ));
        const toggle = screen.getByRole('button', { name: 'Required RPE' });
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(toggle);
        expect(onChange).toHaveBeenCalledWith('requireRpe', false);
        expect(onRemove).not.toHaveBeenCalled();
    });
});
