import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { withLang } from '../../../../test/withLang';
import NutritionNav from '../NutritionNav';

const mockGetClock = vi.fn();

vi.mock('../../../../hooks/api/useFastingApi', () => ({
    useFastingApi: () => ({ getClock: mockGetClock }),
}));

describe('NutritionNav fasting tab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows Jejum link when GET fasting succeeds', async () => {
        mockGetClock.mockResolvedValue({ clock: { status: 'Idle' } });
        const { getByRole, queryByRole } = render(
            withLang(
                <MemoryRouter>
                    <NutritionNav />
                </MemoryRouter>,
            ),
        );
        await waitFor(() => {
            expect(getByRole('link', { name: /fasting|jejum/i })).toHaveAttribute(
                'href',
                '/dashboard/nutrition/fasting',
            );
        });
        expect(queryByRole('link', { name: /fasting|jejum/i })).toBeInTheDocument();
    });

    it('omits Jejum link when fasting is disabled', async () => {
        const err = new Error('disabled');
        err.status = 404;
        err.code = 'nutrition.fasting.disabled';
        mockGetClock.mockRejectedValue(err);
        const { queryByRole } = render(
            withLang(
                <MemoryRouter>
                    <NutritionNav />
                </MemoryRouter>,
            ),
        );
        await waitFor(() => {
            expect(mockGetClock).toHaveBeenCalled();
        });
        expect(queryByRole('link', { name: /fasting|jejum/i })).not.toBeInTheDocument();
    });
});
