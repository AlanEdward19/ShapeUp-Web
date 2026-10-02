import { useCallback, useEffect, useRef, useState } from 'react';
import { useNutritionApi } from './api/useNutritionApi';

export const WATER_STEP_ML = 250;
export const WATER_MAX_ML = 10000;
export const HYDRATION_DEBOUNCE_MS = 2000;
export const HYDRATION_OPEN_STALE_MS = 30_000;
export const HYDRATION_FOREGROUND_POLL_MS = 3 * 60_000;
export const HYDRATION_BACKGROUND_POLL_MS = 10 * 60_000;
const TICK_MS = 60_000;

export type HydrationState = {
  water: number;
  addWater: () => void;
  removeWater: () => void;
};

type Pending = { total: number; at: string };

// Last server reading per user + day, shared by every screen that shows hydration so that
// opening another screen within 30 s does not hit the API again.
const readCache = new Map<string, { totalMl: number; readAt: number }>();

export const resetHydrationCache = () => readCache.clear();

const userId = () => localStorage.getItem('shapeup_user_id') || 'current';
const cacheKey = (date: string) => `${userId()}_${date}`;
const legacyKey = (date: string) => `shapeup_water_${userId()}_${date}`;
const clamp = (value: number) => Math.min(WATER_MAX_ML, Math.max(0, value));

export default function useHydration(date: string): HydrationState {
  const { getHydrationDay, putHydrationDay } = useNutritionApi();
  const [state, setState] = useState(() => ({ date, water: readCache.get(cacheKey(date))?.totalMl ?? 0 }));

  const api = useRef({ getHydrationDay, putHydrationDay });
  const dateRef = useRef(date);
  const waterRef = useRef(state.water);
  const pending = useRef(new Map<string, Pending>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const epoch = useRef(0);

  useEffect(() => {
    api.current = { getHydrationDay, putHydrationDay };
  });

  if (state.date !== date) {
    setState({ date, water: readCache.get(cacheKey(date))?.totalMl ?? 0 });
  }

  const flush = useCallback(async (day: string): Promise<boolean> => {
    const sent = pending.current.get(day);
    if (!sent) return true;
    try {
      await api.current.putHydrationDay(day, { totalMl: sent.total, updatedAtUtc: sent.at });
      // A newer click while this request was in flight keeps its own pending entry.
      if (pending.current.get(day) === sent) pending.current.delete(day);
      readCache.set(cacheKey(day), { totalMl: sent.total, readAt: Date.now() });
      return true;
    } catch {
      // Stays pending: the next tick (or leaving the screen) sends it again.
      return false;
    }
  }, []);

  const flushAll = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pending.current.forEach((_, day) => void flush(day));
  }, [flush]);

  const read = useCallback(async (day: string) => {
    const startedAt = epoch.current;
    try {
      const response = await api.current.getHydrationDay(day);
      // Never replace a local value the server has not seen yet.
      if (pending.current.has(day) || epoch.current !== startedAt) return;
      const total = Number(response?.totalMl) || 0;
      readCache.set(cacheKey(day), { totalMl: total, readAt: Date.now() });
      if (dateRef.current !== day) return;

      const legacy = Number(localStorage.getItem(legacyKey(day))) || 0;
      if (total === 0 && legacy > 0) {
        const migrated = clamp(legacy);
        pending.current.set(day, { total: migrated, at: new Date().toISOString() });
        waterRef.current = migrated;
        setState({ date: day, water: migrated });
        if (await flush(day)) localStorage.removeItem(legacyKey(day));
        return;
      }
      waterRef.current = total;
      setState({ date: day, water: total });
    } catch {
      // Offline or server error: keep what is on screen.
    }
  }, [flush]);

  useEffect(() => {
    dateRef.current = date;
    const unsent = pending.current.get(date);
    const cached = readCache.get(cacheKey(date));
    waterRef.current = unsent?.total ?? cached?.totalMl ?? 0;
    if (unsent) void flush(date);
    else if (!cached || Date.now() - cached.readAt > HYDRATION_OPEN_STALE_MS) void read(date);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      void flush(date);
    };
  }, [date, flush, read]);

  useEffect(() => {
    const id = setInterval(() => {
      const day = dateRef.current;
      if (pending.current.has(day)) {
        void flush(day);
        return;
      }
      const limit = document.hidden ? HYDRATION_BACKGROUND_POLL_MS : HYDRATION_FOREGROUND_POLL_MS;
      const last = readCache.get(cacheKey(day))?.readAt ?? 0;
      if (Date.now() - last >= limit) void read(day);
    }, TICK_MS);
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flushAll();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', flushAll);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', flushAll);
    };
  }, [flush, flushAll, read]);

  const change = (delta: number) => {
    const next = clamp(waterRef.current + delta);
    if (next === waterRef.current) return;
    epoch.current += 1;
    waterRef.current = next;
    pending.current.set(date, { total: next, at: new Date().toISOString() });
    setState({ date, water: next });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void flush(date);
    }, HYDRATION_DEBOUNCE_MS);
  };

  return {
    water: state.date === date ? state.water : (readCache.get(cacheKey(date))?.totalMl ?? 0),
    addWater: () => change(WATER_STEP_ML),
    removeWater: () => change(-WATER_STEP_ML),
  };
}

export const waterPercent = (waterMl: number, goalMl?: number | null): number | null =>
  goalMl && goalMl > 0 ? Math.min(100, Math.round((waterMl / goalMl) * 100)) : null;
