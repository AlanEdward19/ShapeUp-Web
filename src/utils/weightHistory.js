const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

export function localDateKey(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Local calendar day as an ISO instant the API stores as DateOnly (UTC .Date). */
export function localDayUtcNoonIso(date = new Date()) {
    const day = localDateKey(date);
    return day ? `${day}T12:00:00.000Z` : new Date().toISOString();
}

export function entryDayKey(entry) {
    if (entry == null) return '';
    const instant = entry.originalDateObj || entry.updatedAtUtc || entry.dateUtc;
    if (instant) {
        const fromInstant = localDateKey(instant);
        if (fromInstant) return fromInstant;
    }
    if (typeof entry.date === 'string' && ISO_DAY.test(entry.date)) {
        return localDateKey(`${entry.date.slice(0, 10)}T12:00:00`);
    }
    if (typeof entry.day === 'string' && ISO_DAY.test(entry.day)) {
        return localDateKey(`${entry.day.slice(0, 10)}T12:00:00`);
    }
    return localDateKey(entry.date);
}

function recency(entry) {
    const instant = new Date(entry?.originalDateObj || entry?.updatedAtUtc || entry?.dateUtc || 0).getTime();
    if (Number.isFinite(instant) && instant > 0) return instant;
    const numericId = Number.parseInt(String(entry?.id ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(numericId) ? numericId : 0;
}

export function displayDateLabel(entry) {
    if (typeof entry?.date === 'string' && !ISO_DAY.test(entry.date)) return entry.date;
    const raw = entry?.originalDateObj || entry?.updatedAtUtc || entry?.dateUtc
        || (typeof entry?.date === 'string' && ISO_DAY.test(entry.date) ? `${entry.date.slice(0, 10)}T12:00:00` : '');
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function collapseSameDayWeight(history) {
    const byKey = new Map();
    for (const item of history || []) {
        const key = displayDateLabel(item) || entryDayKey(item);
        if (!key) continue;
        const current = byKey.get(key);
        if (!current || recency(item) > recency(current)) byKey.set(key, item);
    }
    return [...byKey.values()].sort((a, b) => recency(b) - recency(a));
}

export function upsertSameDayWeight(history, entry) {
    const stamped = {
        ...entry,
        day: entryDayKey(entry) || localDateKey(),
        date: displayDateLabel(entry) || entry.date,
    };
    return collapseSameDayWeight([stamped, ...(history || [])]);
}
