import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getSessionEquivalentCount, isSessionSwapDisabled } from '../sessionSwapUi';

vi.mock('../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) =>
            ({
                'client.session.swap.button': 'Swap exercise',
                'client.session.swap.no_alternatives': 'No alternatives',
            })[key] || key,
    }),
}));

import SwapExerciseButton from '../../../components/training/SwapExerciseButton';

const clientPath = join(dirname(fileURLToPath(import.meta.url)), '../TrainingPlansClient.jsx');

describe('sessionSwapUi', () => {
    it('disables swap when GET equivalents cache is empty for the exercise', () => {
        const exercise = { id: 5, exerciseId: 5, name: 'Row' };
        expect(getSessionEquivalentCount({}, exercise)).toBe(0);
        expect(isSessionSwapDisabled({}, exercise)).toBe(true);
        expect(
            isSessionSwapDisabled({ 5: { items: [{ exerciseId: 8, name: 'Alt' }] } }, exercise),
        ).toBe(false);
    });
});

describe('TrainingPlansClient swap wiring', () => {
    it('places SwapExerciseButton inside su-ex-execution-header in the active session branch', () => {
        const src = readFileSync(clientPath, 'utf8');
        const inactiveBranch = src.split('if (!sessionActive)')[1]?.split('// 2. Active Session Engine')[0] ?? '';
        expect(inactiveBranch).not.toContain('SwapExerciseButton');
        expect(src).toMatch(/su-ex-execution-header[\s\S]{0,800}SwapExerciseButton/);
        expect(src).toContain('isSessionSwapDisabled(equivalentsCache, exercise)');
    });

    it('renders swap control in execution header when equivalents exist', () => {
        const { container, getByRole } = render(
            <div className="su-ex-execution-header">
                <SwapExerciseButton disabled={false} onClick={vi.fn()} />
            </div>,
        );
        expect(container.querySelector('.su-ex-execution-header')).toBeTruthy();
        expect(getByRole('button', { name: 'Swap exercise' })).toBeEnabled();
    });

    it('disables swap in header when parent wiring sees empty equivalents cache', () => {
        const exercise = { id: 1, exerciseId: 1 };
        const { getByRole } = render(
            <div className="su-ex-execution-header">
                <SwapExerciseButton
                    disabled={isSessionSwapDisabled({}, exercise)}
                    onClick={vi.fn()}
                />
            </div>,
        );
        expect(getByRole('button')).toBeDisabled();
    });
});
