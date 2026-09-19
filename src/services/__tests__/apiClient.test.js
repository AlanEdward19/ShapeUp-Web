import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../firebase', () => ({
    auth: { currentUser: null },
}));

import { apiClient } from '../apiClient';

describe('apiClient error JSON', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('sets error.code from failed JSON body', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({
                code: 'nutrition.fasting.disabled',
                message: 'Intermittent fasting is disabled',
            }),
        });

        await expect(apiClient('/api/nutrition/fasting')).rejects.toMatchObject({
            status: 404,
            code: 'nutrition.fasting.disabled',
            message: 'Intermittent fasting is disabled',
        });
    });
});
