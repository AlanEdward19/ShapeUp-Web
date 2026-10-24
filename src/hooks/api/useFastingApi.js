import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const eatingStartMinutesFromLabel = (label) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(label).trim());
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || mins < 0 || mins > 59 || mins % 30 !== 0) return null;
    return hours * 60 + mins;
};

export const buildPutAgendaBody = ({
    protocol,
    eatingStartLabel,
    timeZone,
    fastHours,
}) => {
    const eatingStartMinutes = eatingStartMinutesFromLabel(eatingStartLabel);
    const body = {
        protocol,
        eatingStartMinutes,
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    if (protocol === 'custom' && fastHours != null) {
        body.fastHours = fastHours;
    }
    return body;
};

export const useFastingApi = () => {
    const getClock = useCallback(async () => apiClient('/api/nutrition/fasting'), []);

    const putAgenda = useCallback(
        async (body) =>
            apiClient('/api/nutrition/fasting/agenda', {
                method: 'PUT',
                body: JSON.stringify(body),
            }),
        [],
    );

    const startOverride = useCallback(
        async () =>
            apiClient('/api/nutrition/fasting/override/start', {
                method: 'POST',
            }),
        [],
    );

    const endOverrideEarly = useCallback(
        async () =>
            apiClient('/api/nutrition/fasting/override/end-early', {
                method: 'POST',
            }),
        [],
    );

    const cancelOverride = useCallback(
        async () =>
            apiClient('/api/nutrition/fasting/override/cancel', {
                method: 'POST',
            }),
        [],
    );

    // Turns fasting off: clears the saved agenda (API contract: DELETE /agenda).
    const disableAgenda = useCallback(
        async () => apiClient('/api/nutrition/fasting/agenda', { method: 'DELETE' }),
        [],
    );

    // Ends the current fasting window early, agenda driven or manual. `reason` is optional (max 280).
    const endEarly = useCallback(
        async ({ reason } = {}) =>
            apiClient('/api/nutrition/fasting/end-early', {
                method: 'POST',
                body: JSON.stringify(reason ? { reason } : {}),
            }),
        [],
    );

    // Client turns down the nutritionist's suggestion, with an optional reason.
    const declineRecommendation = useCallback(
        async ({ reason } = {}) =>
            apiClient('/api/nutrition/fasting/recommendation/decline', {
                method: 'POST',
                body: JSON.stringify(reason ? { reason } : {}),
            }),
        [],
    );

    const getHistory = useCallback(async () => apiClient('/api/nutrition/fasting/history'), []);

    return {
        getClock,
        putAgenda,
        startOverride,
        endOverrideEarly,
        cancelOverride,
        disableAgenda,
        endEarly,
        declineRecommendation,
        getHistory,
    };
};
