const trimRaw = (raw) => (raw == null ? '' : String(raw).trim());

export const parseLoggedNumber = (raw) => {
    const text = trimRaw(raw);
    if (text === '') return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
};

export const isValidLoggedWeight = (raw) => {
    const n = parseLoggedNumber(raw);
    return n !== null && n >= 0;
};

export const isValidLoggedReps = (raw) => {
    const n = parseLoggedNumber(raw);
    return n !== null && Number.isInteger(n) && n >= 1;
};

export const isValidLoggedRpe = (raw) => {
    const n = parseLoggedNumber(raw);
    return n !== null && Number.isInteger(n) && n >= 1 && n <= 10;
};

const rpeSatisfied = ({ rpe, requireRpe, failure }) => {
    if (!requireRpe) return true;
    if (failure === true && trimRaw(rpe) === '10') return true;
    return isValidLoggedRpe(rpe);
};

export const canCompleteLoggedSet = ({
    weight,
    reps,
    rpe,
    requireRpe = false,
    failure = false,
} = {}) => {
    const missing = [];
    if (!isValidLoggedWeight(weight)) missing.push('weight');
    if (!isValidLoggedReps(reps)) missing.push('reps');
    if (!rpeSatisfied({ rpe, requireRpe, failure })) missing.push('rpe');
    return { ok: missing.length === 0, missing };
};

export const clampRpeLog = (raw) => {
    const text = trimRaw(raw);
    if (text === '') return '';
    const n = parseLoggedNumber(text);
    if (n === null) return '';
    const rounded = Math.round(n);
    const clamped = Math.min(10, Math.max(1, rounded));
    return String(clamped);
};
