import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLang } from '../../../test/withLang';
import SetRow from '../SetRow';

const baseSet = {
    type: 'working',
    technique: 'Straight',
    reps: '8',
    load: '75',
    duration: '05:00',
    distance: '',
    intensityType: 'rpe',
    intensityValue: '8',
    rest: '90',
};

describe('SetRow exercise type (TBE-02)', () => {
    it('renders duration and distance inputs for timeBased', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SetRow
                set={baseSet}
                index={0}
                blockType="straight"
                exerciseType="timeBased"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        expect(screen.getByPlaceholderText('05:00')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('8-10')).not.toBeInTheDocument();
    });

    it('locks technique to Straight only for timeBased (TBE-02 AC2)', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SetRow
                set={baseSet}
                index={0}
                blockType="straight"
                exerciseType="timeBased"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        const selects = screen.getAllByRole('combobox');
        const techniqueSelect = selects[1];
        expect(techniqueSelect).toBeDisabled();
        expect(techniqueSelect).toHaveValue('Straight');
        expect(within(techniqueSelect).getAllByRole('option')).toHaveLength(1);
        expect(screen.queryByRole('option', { name: /drop set/i })).not.toBeInTheDocument();
    });

    it('renders load and reps for weightBased', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SetRow
                set={baseSet}
                index={0}
                blockType="straight"
                exerciseType="weightBased"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        expect(screen.getByPlaceholderText('8-10')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('05:00')).not.toBeInTheDocument();
    });

    it('offers full technique list for weightBased', () => {
        localStorage.setItem('shapeup_language', 'en');
        render(withLang(
            <SetRow
                set={baseSet}
                index={0}
                blockType="straight"
                exerciseType="weightBased"
                onChange={() => {}}
                onRemove={() => {}}
            />
        ));
        const techniqueSelect = screen.getAllByRole('combobox')[1];
        expect(techniqueSelect).not.toBeDisabled();
        expect(within(techniqueSelect).getAllByRole('option').length).toBeGreaterThan(1);
        expect(screen.getByRole('option', { name: /drop set/i })).toBeInTheDocument();
    });
});
