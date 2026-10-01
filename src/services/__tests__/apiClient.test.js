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

describe('apiClient noReadCache', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn());
    });

    it('does not store or serve the offline read cache when noReadCache is set', async () => {
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ daysWithWork: 3 }) });
        await apiClient('/api/private', { noReadCache: true });
        expect(localStorage.getItem('shapeup_read_cache:/api/private')).toBeNull();

        localStorage.setItem('shapeup_read_cache:/api/private', JSON.stringify({ data: { daysWithWork: 9 }, cachedAt: 1 }));
        fetch.mockRejectedValueOnce(new TypeError('offline'));
        await expect(apiClient('/api/private', { noReadCache: true })).rejects.toThrow('offline');
    });
});
