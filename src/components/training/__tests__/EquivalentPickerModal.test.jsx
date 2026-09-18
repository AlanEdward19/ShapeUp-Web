import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) =>
            ({
                'client.session.swap.picker.title': 'Choose equivalent',
                'client.session.swap.picker.confirm': 'Confirm swap',
                'client.session.swap.picker.cancel': 'Cancel',
                'client.session.swap.picker.empty': 'No registered alternatives',
            })[key] || key,
    }),
}));

import EquivalentPickerModal from '../EquivalentPickerModal';

const items = [
    { exerciseId: 2, name: 'DB Press', subtitle: 'Chest' },
    { exerciseId: 3, name: 'Machine Press', subtitle: 'Chest' },
];

describe('EquivalentPickerModal', () => {
    it('does not call onConfirm when a row is selected without confirm', () => {
        const onConfirm = vi.fn();
        const { getByText } = render(
            <EquivalentPickerModal open equivalents={items} onClose={vi.fn()} onConfirm={onConfirm} />,
        );
        fireEvent.click(getByText('DB Press'));
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm once with the chosen equivalent after confirm', () => {
        const onConfirm = vi.fn();
        const { getByText } = render(
            <EquivalentPickerModal open equivalents={items} onClose={vi.fn()} onConfirm={onConfirm} />,
        );
        fireEvent.click(getByText('Machine Press'));
        fireEvent.click(getByText('Confirm swap'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(items[1]);
    });

    it('shows explicit empty copy when the equivalents list is empty', () => {
        const { getByText } = render(
            <EquivalentPickerModal open equivalents={[]} onClose={vi.fn()} onConfirm={vi.fn()} />,
        );
        expect(getByText('No registered alternatives')).toBeTruthy();
    });
});
