import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { withLang } from '../../../../test/withLang';
import NutritionNav from '../NutritionNav';

const renderAt = (path) =>
    render(
        withLang(
            <MemoryRouter initialEntries={[path]}>
                <NutritionNav />
            </MemoryRouter>,
        ),
    );

describe('NutritionNav', () => {
    it('renders nothing on the diary, which is the only tab', () => {
        const { queryByTestId } = renderAt('/dashboard/nutrition/diary');
        expect(queryByTestId('nutrition-nav')).not.toBeInTheDocument();
    });

    it.each(['foods', 'meal-plans', 'fasting', 'practice'])('offers a way back to the diary from %s', (page) => {
        const { getByRole } = renderAt(`/dashboard/nutrition/${page}`);
        expect(getByRole('link', { name: /diário|diary|diario/i })).toHaveAttribute('href', '/dashboard/nutrition/diary');
    });
});
