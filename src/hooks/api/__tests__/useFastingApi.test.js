import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/apiClient', () => ({
    apiClient: vi.fn(),
}));

import { apiClient } from '../../../services/apiClient';
import {
    buildPutAgendaBody,
    eatingStartMinutesFromLabel,
    useFastingApi,
} from '../useFastingApi';

describe('useFastingApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiClient.mockResolvedValue({ ok: true });
    });

    it('getClock calls fasting snapshot endpoint', async () => {
        const { result } = renderHook(() => useFastingApi());
        await act(async () => {
            await result.current.getClock();
        });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting');
    });

    it('putAgenda sends 16:8 with eatingStartMinutes 720 and timeZone', async () => {
        const { result } = renderHook(() => useFastingApi());
        const body = buildPutAgendaBody({
            protocol: '16:8',
            eatingStartLabel: '12:00',
            timeZone: 'America/Sao_Paulo',
        });
        expect(body).toEqual({
            protocol: '16:8',
            eatingStartMinutes: 720,
            timeZone: 'America/Sao_Paulo',
        });
        await act(async () => {
            await result.current.putAgenda(body);
        });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/agenda', {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    });

    it('maps eating start label to minutes on 30-minute grid', () => {
        expect(eatingStartMinutesFromLabel('12:00')).toBe(720);
        expect(eatingStartMinutesFromLabel('12:30')).toBe(750);
        expect(eatingStartMinutesFromLabel('12:15')).toBeNull();
    });

    it('posts override actions with empty body', async () => {
        const { result } = renderHook(() => useFastingApi());
        await act(async () => {
            await result.current.startOverride();
            await result.current.endOverrideEarly();
            await result.current.cancelOverride();
        });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/override/start', { method: 'POST' });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/override/end-early', { method: 'POST' });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/override/cancel', { method: 'POST' });
    });

    it('getHistory calls history endpoint', async () => {
        const { result } = renderHook(() => useFastingApi());
        await act(async () => {
            await result.current.getHistory();
        });
        expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/history');
    });

    it('propagates disabled fasting error code from apiClient', async () => {
        const err = new Error('Intermittent fasting is disabled');
        err.status = 404;
        err.code = 'nutrition.fasting.disabled';
        apiClient.mockRejectedValueOnce(err);
        const { result } = renderHook(() => useFastingApi());
        await expect(act(async () => result.current.getClock())).rejects.toMatchObject({
            code: 'nutrition.fasting.disabled',
        });
    });
});
