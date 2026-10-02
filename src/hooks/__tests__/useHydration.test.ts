import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useHydration, {
  HYDRATION_BACKGROUND_POLL_MS,
  HYDRATION_DEBOUNCE_MS,
  HYDRATION_FOREGROUND_POLL_MS,
  HYDRATION_OPEN_STALE_MS,
  resetHydrationCache,
  waterPercent,
} from '../useHydration';

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('../api/useNutritionApi', () => ({
  useNutritionApi: () => ({ getHydrationDay: mockGet, putHydrationDay: mockPut }),
}));

const DATE = '2026-10-02';
const flushPromises = () => act(async () => { await Promise.resolve(); });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('useHydration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-02T12:00:00Z'));
    localStorage.clear();
    resetHydrationCache();
    mockGet.mockReset().mockResolvedValue({ date: DATE, totalMl: 500, updatedAtUtc: null });
    mockPut.mockReset().mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the day total from the API on open', async () => {
    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();
    expect(mockGet).toHaveBeenCalledWith(DATE);
    expect(result.current.water).toBe(500);
  });

  it('updates the screen immediately and sends only the final total after the debounce', async () => {
    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();

    act(() => result.current.addWater());
    act(() => result.current.addWater());
    act(() => result.current.removeWater());
    expect(result.current.water).toBe(750);
    expect(mockPut).not.toHaveBeenCalled();

    await advance(HYDRATION_DEBOUNCE_MS - 1);
    expect(mockPut).not.toHaveBeenCalled();
    await advance(1);

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledWith(DATE, { totalMl: 750, updatedAtUtc: '2026-10-02T12:00:00.000Z' });
  });

  it('restarts the debounce on every click', async () => {
    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();

    act(() => result.current.addWater());
    await advance(1500);
    act(() => result.current.addWater());
    await advance(1500);
    expect(mockPut).not.toHaveBeenCalled();
    await advance(500);
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockPut.mock.calls[0][1].totalMl).toBe(1000);
  });

  it('does not go below zero nor above the server limit', async () => {
    mockGet.mockResolvedValue({ totalMl: 0 });
    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();
    act(() => result.current.removeWater());
    expect(result.current.water).toBe(0);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('never overwrites an unsent local value with a server reading', async () => {
    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();
    act(() => result.current.addWater());

    mockPut.mockRejectedValue(new Error('offline'));
    mockGet.mockResolvedValue({ totalMl: 0 });
    await advance(HYDRATION_DEBOUNCE_MS); // send fails, stays pending
    await advance(HYDRATION_FOREGROUND_POLL_MS); // ticks retry the send instead of reading

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(result.current.water).toBe(750);

    mockPut.mockResolvedValue({});
    await advance(60_000);
    expect(mockPut).toHaveBeenLastCalledWith(DATE, expect.objectContaining({ totalMl: 750 }));
  });

  it('ignores a read that was in flight when the user clicked', async () => {
    let resolveRead: (value: unknown) => void = () => {};
    mockGet.mockImplementation(() => new Promise((resolve) => { resolveRead = resolve; }));
    const { result } = renderHook(() => useHydration(DATE));

    act(() => result.current.addWater());
    await act(async () => { resolveRead({ totalMl: 2000 }); });

    expect(result.current.water).toBe(250);
  });

  it('re-reads the server while the screen stays open: 3 min in the foreground', async () => {
    renderHook(() => useHydration(DATE));
    await flushPromises();
    expect(mockGet).toHaveBeenCalledTimes(1);

    await advance(HYDRATION_FOREGROUND_POLL_MS - 60_000);
    expect(mockGet).toHaveBeenCalledTimes(1);
    await advance(60_000);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('re-reads every 10 min when the tab is in the background', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    renderHook(() => useHydration(DATE));
    await flushPromises();

    await advance(HYDRATION_FOREGROUND_POLL_MS + 60_000);
    expect(mockGet).toHaveBeenCalledTimes(1);
    await advance(HYDRATION_BACKGROUND_POLL_MS - HYDRATION_FOREGROUND_POLL_MS - 60_000);
    expect(mockGet).toHaveBeenCalledTimes(2);
    hidden.mockRestore();
  });

  it('skips the read on reopen when the last one is under 30 s old, and reads again after', async () => {
    const first = renderHook(() => useHydration(DATE));
    await flushPromises();
    first.unmount();

    await advance(HYDRATION_OPEN_STALE_MS - 1000);
    const second = renderHook(() => useHydration(DATE));
    await flushPromises();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(second.result.current.water).toBe(500);
    second.unmount();

    await advance(2000);
    renderHook(() => useHydration(DATE));
    await flushPromises();
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('sends a pending value right away when leaving the screen', async () => {
    const { result, unmount } = renderHook(() => useHydration(DATE));
    await flushPromises();
    act(() => result.current.addWater());
    unmount();
    expect(mockPut).toHaveBeenCalledWith(DATE, expect.objectContaining({ totalMl: 750 }));
  });

  it('migrates the old localStorage value once when the server is empty', async () => {
    localStorage.setItem('shapeup_water_current_' + DATE, '1250');
    mockGet.mockResolvedValue({ totalMl: 0, updatedAtUtc: null });

    const { result } = renderHook(() => useHydration(DATE));
    await flushPromises();
    await flushPromises();

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledWith(DATE, expect.objectContaining({ totalMl: 1250 }));
    expect(result.current.water).toBe(1250);
    expect(localStorage.getItem('shapeup_water_current_' + DATE)).toBeNull();
  });

  it('does not migrate when the server already has a value', async () => {
    localStorage.setItem('shapeup_water_current_' + DATE, '1250');
    renderHook(() => useHydration(DATE));
    await flushPromises();
    expect(mockPut).not.toHaveBeenCalled();
  });
});

describe('waterPercent', () => {
  it('returns null without goal and caps at 100', () => {
    expect(waterPercent(500, 0)).toBeNull();
    expect(waterPercent(500, null)).toBeNull();
    expect(waterPercent(1000, 2000)).toBe(50);
    expect(waterPercent(3000, 2000)).toBe(100);
  });
});
