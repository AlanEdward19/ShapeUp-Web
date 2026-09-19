import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import BlockCard from '../BlockCard';

const exercise = {
    id: 'e1',
    exerciseId: 1,
    name: 'Squat',
    tags: '',
    notes: '',
    requireRpe: true,
    exerciseType: 'weightBased',
    sets: [{ type: 'working', technique: 'Straight', reps: '8', load: '75', intensityType: 'rpe', intensityValue: '8', rest: '90' }],
};

describe('BlockCard last-exercise dissolve', () => {
    it('asks before removing the last exercise and then removes the block', () => {
        const onChange = vi.fn();
        const onRemove = vi.fn();
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <BlockCard
                block={{ id: 'b1', type: 'straight', exercises: [exercise] }}
                onChange={onChange}
                onRemove={onRemove}
                onAddExercise={() => {}}
            />,
        ));

        fireEvent.click(screen.getByRole('button', { name: 'Remove exercise' }));
        expect(onChange).not.toHaveBeenCalled();
        expect(onRemove).not.toHaveBeenCalled();
        expect(screen.getByText('This is the last exercise in the block. Removing it will undo the block.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onRemove).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Remove exercise' }));
        fireEvent.click(screen.getByRole('button', { name: 'Undo block' }));
        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('removes a non-last exercise without dissolving the block', () => {
        const onChange = vi.fn();
        const onRemove = vi.fn();
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <BlockCard
                block={{
                    id: 'b1',
                    type: 'straight',
                    exercises: [exercise, { ...exercise, id: 'e2', name: 'Bench' }],
                }}
                onChange={onChange}
                onRemove={onRemove}
                onAddExercise={() => {}}
            />,
        ));

        fireEvent.click(screen.getAllByRole('button', { name: 'Remove exercise' })[0]);
        expect(onRemove).not.toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith('exercises', [expect.objectContaining({ id: 'e2' })]);
    });
});

describe('BlockCard exercise drag and drop', () => {
    it('drops onto another row and reports the move', () => {
        const onMoveExercise = vi.fn();
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <BlockCard
                block={{
                    id: 'b1',
                    type: 'straight',
                    exercises: [exercise, { ...exercise, id: 'e2', name: 'Bench' }],
                }}
                blockIdx={0}
                onChange={() => {}}
                onRemove={() => {}}
                onAddExercise={() => {}}
                onMoveExercise={onMoveExercise}
            />,
        ));

        const payload = JSON.stringify({ blockIdx: 1, exIdx: 0 });
        const dataTransfer = {
            setData: vi.fn(),
            getData: () => payload,
            effectAllowed: 'move',
            dropEffect: 'move',
        };
        fireEvent.drop(screen.getByDisplayValue('Squat').closest('[data-ex-drop]'), { dataTransfer });
        expect(onMoveExercise).toHaveBeenCalledWith(1, 0, 0);
    });
});
