import { render, screen } from '@testing-library/react';
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
});
