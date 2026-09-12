import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import FoodModerationQueue from '../FoodModerationQueue';
import { withLang } from '../../../test/withLang';

const mockGetPendingModerations = vi.fn();
const mockDecideModeration = vi.fn();

vi.mock('../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        getPendingModerations: mockGetPendingModerations,
        decideModeration: mockDecideModeration,
    }),
}));

const pendingItem = {
    requestId: 'req-1',
    foodId: 'food-1',
    foodName: 'Arroz',
    requestedByUserId: 42,
    createdAtUtc: '2026-09-10T12:00:00Z',
    publicMacros: { kcal: 130, proteinG: 2, carbG: 28, fatG: 0 },
    proposedMacros: { kcal: 140, proteinG: 3, carbG: 30, fatG: 1 },
};

describe('FoodModerationQueue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetPendingModerations.mockResolvedValue({ items: [pendingItem] });
        mockDecideModeration.mockResolvedValue({ requestId: 'req-1', status: 'Approved' });
    });

    it('approves a pending moderation', async () => {
        const { getByTestId, queryByTestId } = render(withLang(<FoodModerationQueue />));

        await waitFor(() => {
            expect(getByTestId('moderation-req-1')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('approve-req-1'));

        await waitFor(() => {
            expect(mockDecideModeration).toHaveBeenCalledWith('req-1', 'Approved');
            expect(queryByTestId('moderation-req-1')).not.toBeInTheDocument();
        });
    });

    it('rejects a pending moderation', async () => {
        mockDecideModeration.mockResolvedValue({ requestId: 'req-1', status: 'Rejected' });
        const { getByTestId, queryByTestId } = render(withLang(<FoodModerationQueue />));

        await waitFor(() => {
            expect(getByTestId('moderation-req-1')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('reject-req-1'));

        await waitFor(() => {
            expect(mockDecideModeration).toHaveBeenCalledWith('req-1', 'Rejected');
            expect(queryByTestId('moderation-req-1')).not.toBeInTheDocument();
        });
    });
});
