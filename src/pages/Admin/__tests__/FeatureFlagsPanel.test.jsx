import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import FeatureFlagsPanel from '../FeatureFlagsPanel';

const mockGetFeatureFlags = vi.fn();
const mockPutFeatureFlag = vi.fn();

vi.mock('../../../hooks/api/usePlatformFeatureFlags', () => ({
    usePlatformFeatureFlags: () => ({
        getFeatureFlags: mockGetFeatureFlags,
        putFeatureFlag: mockPutFeatureFlag,
    }),
}));

describe('FeatureFlagsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetFeatureFlags.mockResolvedValue([
            { key: 'notifications.email-enabled', enabled: true, updatedAtUtc: '2026-09-10T00:00:00Z' },
        ]);
        mockPutFeatureFlag.mockResolvedValue({ key: 'notifications.email-enabled', enabled: false });
    });

    it('toggles a feature flag and persists', async () => {
        const { getByTestId } = render(<FeatureFlagsPanel />);

        await waitFor(() => {
            expect(getByTestId('flag-row-notifications.email-enabled')).toHaveTextContent('Ativa');
        });

        fireEvent.click(getByTestId('flag-toggle-notifications.email-enabled'));

        await waitFor(() => {
            expect(mockPutFeatureFlag).toHaveBeenCalledWith('notifications.email-enabled', false);
            expect(getByTestId('flag-row-notifications.email-enabled')).toHaveTextContent('Desativada');
        });
    });
});
