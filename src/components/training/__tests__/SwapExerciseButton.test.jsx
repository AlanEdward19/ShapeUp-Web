import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) =>
            ({
                'client.session.swap.button': 'Swap exercise',
                'client.session.swap.no_alternatives': 'No alternatives',
            })[key] || key,
    }),
}));

import SwapExerciseButton from '../SwapExerciseButton';

describe('SwapExerciseButton', () => {
    it('is disabled when equivalents list is empty', () => {
        const { getByRole } = render(<SwapExerciseButton disabled onClick={vi.fn()} />);
        expect(getByRole('button')).toBeDisabled();
    });

    it('invokes onClick without applying swap locally', () => {
        const onClick = vi.fn();
        const { getByRole } = render(<SwapExerciseButton disabled={false} onClick={onClick} />);
        fireEvent.click(getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
