const trim = (raw) => (raw == null ? '' : String(raw).trim());

/**
 * Parse duration text (mm:ss, hh:mm:ss, or whole seconds) to total seconds.
 * Invalid or non-positive values return null.
 */
export const parseDurationInput = (text) => {
    const s = trim(text);
    if (s === '') return null;

    if (!s.includes(':')) {
        const whole = parseInt(s, 10);
        if (!Number.isFinite(whole) || whole <= 0) return null;
        return whole;
    }

    const parts = s.split(':').map((p) => p.trim());
    if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return null;

    let seconds = 0;
    if (parts.length === 2) {
        const [mins, secs] = parts.map((p) => parseInt(p, 10));
        seconds = mins * 60 + secs;
    } else if (parts.length === 3) {
        const [hours, mins, secs] = parts.map((p) => parseInt(p, 10));
        seconds = hours * 3600 + mins * 60 + secs;
    } else {
        return null;
    }

    return seconds > 0 ? seconds : null;
};

/** Format seconds as mm:ss or hh:mm:ss (matches session formatTime rules). */
export const formatDurationSeconds = (totalSeconds) => {
    const n = parseInt(totalSeconds, 10);
    if (!Number.isFinite(n) || n < 0) return '';
    const hours = Math.floor(n / 3600);
    const mins = Math.floor((n % 3600) / 60);
    const secs = n % 60;
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Parse optional distance in meters. Empty input is valid with value null.
 */
export const parseDistanceMeters = (text) => {
    const s = trim(text);
    if (s === '') return { ok: true, value: null };

    const n = Number(s);
    if (!Number.isFinite(n) || n < 0) return { ok: false };
    return { ok: true, value: n };
};

/** Display distance: km when >= 1000 m, otherwise meters. */
export const formatDistanceMeters = (meters) => {
    const n = parseFloat(meters);
    if (!Number.isFinite(n) || n < 0) return '';
    if (n >= 1000) {
        const km = n / 1000;
        return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`;
    }
    return `${n} m`;
};
