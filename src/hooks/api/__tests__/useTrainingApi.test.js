import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/apiClient', () => ({
    apiClient: vi.fn(),
}));

import { apiClient } from '../../../services/apiClient';
import { useTrainingApi } from '../useTrainingApi';

const apiError = new Error('API failed');

describe('useTrainingApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiClient.mockResolvedValue({ ok: true });
    });

    const runApiClientHappy = async (invoke) => {
        const { result } = renderHook(() => useTrainingApi());
        let response;
        await act(async () => {
            response = await invoke(result.current);
        });
        expect(response).toEqual({ ok: true });
    };

    const runApiClientError = async (invoke) => {
        apiClient.mockRejectedValueOnce(apiError);
        const { result } = renderHook(() => useTrainingApi());
        await expect(act(async () => invoke(result.current))).rejects.toThrow('API failed');
    };

    describe('getExerciseEquivalents', () => {
        it('happy path', async () => {
            await runApiClientHappy((api) => api.getExerciseEquivalents(42));
            expect(apiClient).toHaveBeenCalledWith('/api/training/exercises/42/equivalents');
        });
        it('error path', async () => {
            await runApiClientError((api) => api.getExerciseEquivalents(42));
        });
    });
});
