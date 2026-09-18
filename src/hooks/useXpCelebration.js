import { useCallback, useEffect, useRef, useState } from 'react';
import { useGamificationApi } from './api/useGamificationApi';

export const XP_POLL_INTERVAL_MS = 2000;
export const XP_POLL_TIMEOUT_MS = 15000;

const initialState = {
    open: false,
    status: 'pending',
    delta: null,
    mascotImageUrl: undefined,
};

export const useXpCelebration = () => {
    const { getGamificationProfile } = useGamificationApi();
    const [state, setState] = useState(initialState);

    const activeSessionRef = useRef(null);
    const snapshotRef = useRef(0);
    const pollIntervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const abortedRef = useRef(false);
    const getProfileRef = useRef(getGamificationProfile);
    getProfileRef.current = getGamificationProfile;

    const clearTimers = useCallback(() => {
        if (pollIntervalRef.current !== null) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const finishNeutral = useCallback((sessionId) => {
        if (activeSessionRef.current !== sessionId) {
            return;
        }
        clearTimers();
        setState((prev) => ({
            ...prev,
            open: true,
            status: 'neutral',
            delta: null,
        }));
    }, [clearTimers]);

    const finishResolved = useCallback((sessionId, delta) => {
        if (activeSessionRef.current !== sessionId) {
            return;
        }
        clearTimers();
        setState((prev) => ({
            ...prev,
            open: true,
            status: 'resolved',
            delta,
        }));
    }, [clearTimers]);

    const pollOnce = useCallback(async (sessionId) => {
        if (abortedRef.current || activeSessionRef.current !== sessionId) {
            return;
        }
        try {
            const profile = await getProfileRef.current();
            const currentTotalXp = profile?.totalXp ?? 0;
            const snapshot = snapshotRef.current ?? 0;
            if (currentTotalXp > snapshot) {
                finishResolved(sessionId, currentTotalXp - snapshot);
            }
        } catch {
            // Keep polling until timeout; GET errors do not reset the 15s budget.
        }
    }, [finishResolved]);

    const startPolling = useCallback((sessionId) => {
        clearTimers();
        pollIntervalRef.current = setInterval(() => {
            pollOnce(sessionId);
        }, XP_POLL_INTERVAL_MS);
        timeoutRef.current = setTimeout(() => {
            finishNeutral(sessionId);
        }, XP_POLL_TIMEOUT_MS);
    }, [clearTimers, pollOnce, finishNeutral]);

    const start = useCallback(async ({ sessionId, snapshotTotalXp, mascotImageUrl } = {}) => {
        if (!sessionId) {
            return;
        }

        clearTimers();
        activeSessionRef.current = sessionId;
        abortedRef.current = false;

        let snapshot = snapshotTotalXp;
        if (snapshot === undefined || snapshot === null) {
            try {
                const profile = await getProfileRef.current();
                snapshot = profile?.totalXp ?? 0;
            } catch {
                snapshot = 0;
            }
        }

        if (activeSessionRef.current !== sessionId) {
            return;
        }

        snapshotRef.current = snapshot;
        setState({
            open: true,
            status: 'pending',
            delta: null,
            mascotImageUrl,
        });
        startPolling(sessionId);
        await pollOnce(sessionId);
    }, [clearTimers, startPolling, pollOnce]);

    const dismiss = useCallback(() => {
        abortedRef.current = true;
        activeSessionRef.current = null;
        clearTimers();
        setState((prev) => ({ ...prev, open: false }));
    }, [clearTimers]);

    useEffect(() => () => {
        abortedRef.current = true;
        clearTimers();
    }, [clearTimers]);

    return {
        ...state,
        start,
        dismiss,
    };
};
