import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    useXpCelebration,
    XP_POLL_INTERVAL_MS,
    XP_POLL_TIMEOUT_MS,
} from '../useXpCelebration';

const mockGetGamificationProfile = vi.fn();

vi.mock('../api/useGamificationApi', () => ({
    useGamificationApi: () => ({
        getGamificationProfile: mockGetGamificationProfile,
    }),
}));

describe('useXpCelebration', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockGetGamificationProfile.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('exports poll interval and timeout constants', () => {
        expect(XP_POLL_INTERVAL_MS).toBe(2000);
        expect(XP_POLL_TIMEOUT_MS).toBe(15000);
    });

    it('polls GET again on each 2000 ms tick while still pending', async () => {
        mockGetGamificationProfile.mockResolvedValue({ totalXp: 100 });
        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-poll', snapshotTotalXp: 100 });
        });
        expect(mockGetGamificationProfile).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_INTERVAL_MS);
        });
        expect(mockGetGamificationProfile).toHaveBeenCalledTimes(2);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_INTERVAL_MS);
        });
        expect(mockGetGamificationProfile).toHaveBeenCalledTimes(3);
        expect(result.current.status).toBe('pending');
    });

    it('resolves with delta when totalXp increases', async () => {
        mockGetGamificationProfile.mockResolvedValue({ totalXp: 220 });
        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-a', snapshotTotalXp: 100 });
        });

        expect(result.current.status).toBe('resolved');
        expect(result.current.delta).toBe(120);
        expect(result.current.open).toBe(true);
    });

    it('becomes neutral when totalXp does not increase within 15s', async () => {
        mockGetGamificationProfile.mockResolvedValue({ totalXp: 100 });
        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-b', snapshotTotalXp: 100 });
        });
        expect(result.current.status).toBe('pending');

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_TIMEOUT_MS);
        });

        expect(result.current.status).toBe('neutral');
        expect(result.current.delta).toBe(null);
    });

    it('lands on neutral at timeout when GET rejects during poll', async () => {
        mockGetGamificationProfile.mockRejectedValue(new Error('network'));
        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-c', snapshotTotalXp: 50 });
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_TIMEOUT_MS);
        });

        expect(result.current.status).toBe('neutral');
        expect(result.current.delta).toBe(null);
    });

    it('stops polling after dismiss', async () => {
        mockGetGamificationProfile.mockResolvedValue({ totalXp: 100 });
        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-d', snapshotTotalXp: 100 });
        });
        const callsAfterStart = mockGetGamificationProfile.mock.calls.length;

        act(() => {
            result.current.dismiss();
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_INTERVAL_MS * 3);
        });

        expect(mockGetGamificationProfile.mock.calls.length).toBe(callsAfterStart);
        expect(result.current.open).toBe(false);
    });

    it('does not apply the first session delta after a second start', async () => {
        let resolveFirstPoll;
        const firstPoll = new Promise((resolve) => {
            resolveFirstPoll = resolve;
        });

        mockGetGamificationProfile
            .mockImplementationOnce(() => firstPoll)
            .mockResolvedValue({ totalXp: 200 });

        const { result } = renderHook(() => useXpCelebration());

        await act(async () => {
            void result.current.start({ sessionId: 'session-one', snapshotTotalXp: 100 });
        });

        await act(async () => {
            await result.current.start({ sessionId: 'session-two', snapshotTotalXp: 200 });
        });

        await act(async () => {
            resolveFirstPoll({ totalXp: 500 });
            await firstPoll;
            await Promise.resolve();
        });

        expect(result.current.status).not.toBe('resolved');
        expect(result.current.delta).not.toBe(400);
    });

    it('stops GET calls on unmount', async () => {
        mockGetGamificationProfile.mockResolvedValue({ totalXp: 100 });
        const { result, unmount } = renderHook(() => useXpCelebration());

        await act(async () => {
            await result.current.start({ sessionId: 'session-e', snapshotTotalXp: 100 });
        });
        const callsAfterStart = mockGetGamificationProfile.mock.calls.length;

        unmount();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(XP_POLL_INTERVAL_MS * 2);
        });

        expect(mockGetGamificationProfile.mock.calls.length).toBe(callsAfterStart);
    });
});
