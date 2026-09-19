const toMs = (boundaryAt) => {
    if (boundaryAt == null) return null;
    if (boundaryAt instanceof Date) return boundaryAt.getTime();
    const ms = new Date(boundaryAt).getTime();
    return Number.isFinite(ms) ? ms : null;
};

/** Remaining whole seconds until boundaryAt from nowMs; clamped at 0. */
export const fastingRemainingSeconds = (boundaryAt, nowMs = Date.now()) => {
    const endMs = toMs(boundaryAt);
    if (endMs == null) return 0;
    return Math.max(0, Math.floor((endMs - nowMs) / 1000));
};

/** Always hh:mm:ss (hours zero-padded, including 00 under one hour). */
export const formatFastingCountdown = (boundaryAt, nowMs = Date.now()) => {
    const total = fastingRemainingSeconds(boundaryAt, nowMs);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
