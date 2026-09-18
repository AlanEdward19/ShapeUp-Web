import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import ExerciseRow from '../ExerciseRow';

const baseExercise = {
    name: 'Squat',
    tags: '',
    notes: '',
    sets: [{ type: 'working', technique: 'Straight', reps: '8', load: '75', intensityType: 'rpe', intensityValue: '8', rest: '90' }],
};

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
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <ExerciseRow
                exercise={{ ...baseExercise, requireRpe: true }}
                blockType="straight"
                onChange={onChange}
                onRemove={() => {}}
            />
        ));
        const toggle = screen.getByRole('button', { name: 'Required RPE' });
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(toggle);
        expect(onChange).toHaveBeenCalledWith('requireRpe', false);
    });
});
