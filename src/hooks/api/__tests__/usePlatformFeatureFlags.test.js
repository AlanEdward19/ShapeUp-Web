import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/apiClient', () => ({
    apiClient: vi.fn(),
}));

import { apiClient } from '../../../services/apiClient';
import { usePlatformFeatureFlags } from '../usePlatformFeatureFlags';

describe('usePlatformFeatureFlags', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiClient.mockResolvedValue([]);
    });

    it('getFeatureFlags calls GET endpoint', async () => {
        const flags = [{ key: 'notifications.email-enabled', enabled: true }];
        apiClient.mockResolvedValueOnce(flags);

        const { result } = renderHook(() => usePlatformFeatureFlags());
        let response;
        await act(async () => {
            response = await result.current.getFeatureFlags();
        });

        expect(apiClient).toHaveBeenCalledWith('/api/platform/feature-flags');
        expect(response).toEqual(flags);
    });

    it('putFeatureFlag calls PUT endpoint', async () => {
        apiClient.mockResolvedValueOnce({ key: 'notifications.email-enabled', enabled: false });

        const { result } = renderHook(() => usePlatformFeatureFlags());
        await act(async () => {
            await result.current.putFeatureFlag('notifications.email-enabled', false);
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/api/platform/feature-flags/notifications.email-enabled',
            { method: 'PUT', body: JSON.stringify({ enabled: false }) }
        );
    });

    it('propagates API errors', async () => {
        apiClient.mockRejectedValueOnce(new Error('API failed'));
        const { result } = renderHook(() => usePlatformFeatureFlags());
        await expect(act(async () => result.current.getFeatureFlags())).rejects.toThrow('API failed');
    });
});
