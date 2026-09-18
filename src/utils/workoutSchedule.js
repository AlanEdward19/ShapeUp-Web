/** .NET DayOfWeek names aligned with Date#getDay() (0 = Sunday … 6 = Saturday). */
export const WEEKDAY_API_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const nameToIndex = Object.fromEntries(
    WEEKDAY_API_NAMES.map((name, index) => [name.toLowerCase(), index]),
);

/**
 * API / legacy → internal distinct weekday indices 0–6 (stable first-seen order).
 */
export function unmapAssignedWeekdays(raw) {
    if (raw == null || !Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    const seen = new Set();
    const out = [];
    for (const item of raw) {
        let index;
        if (typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 6) {
            index = item;
        } else if (typeof item === 'string') {
            const exact = WEEKDAY_API_NAMES.indexOf(item);
            index = exact >= 0 ? exact : nameToIndex[item.trim().toLowerCase()];
        } else {
            continue;
        }
        if (index == null || index < 0 || index > 6 || seen.has(index)) {
            continue;
        }
        seen.add(index);
        out.push(index);
    }
    return out;
}

/** Internal weekday indices → API string enum names (distinct, stable order). */
export function mapAssignedWeekdaysToApi(days) {
    if (!Array.isArray(days) || days.length === 0) {
        return [];
    }
    const seen = new Set();
    const out = [];
    for (const day of days) {
        const index = typeof day === 'number' ? day : parseInt(day, 10);
        if (!Number.isInteger(index) || index < 0 || index > 6 || seen.has(index)) {
            continue;
        }
        seen.add(index);
        out.push(WEEKDAY_API_NAMES[index]);
    }
    return out;
}

export function getLocalWeekday(date = new Date()) {
    return date.getDay();
}

export function plansForToday(plans, weekday = getLocalWeekday()) {
    if (!Array.isArray(plans)) {
        return [];
    }
    return plans.filter(plan => (plan.assignedWeekdays ?? []).includes(weekday));
}

export function exercisesForToday(plans, weekday = getLocalWeekday()) {
    return plansForToday(plans, weekday).flatMap(plan =>
        (plan.blocks ?? []).flatMap(block => block.exercises ?? []),
    );
}

/**
 * Weekly session target for getDashboardMe(N), or null when there are zero plans (do not call API with 0).
 */
export function computeSessionsTargetPerWeek(plans) {
    if (!Array.isArray(plans) || plans.length === 0) {
        return null;
    }
    const anyScheduled = plans.some(plan => (plan.assignedWeekdays ?? []).length > 0);
    if (anyScheduled) {
        const union = new Set();
        for (const plan of plans) {
            for (const day of plan.assignedWeekdays ?? []) {
                union.add(day);
            }
        }
        return union.size;
    }
    return plans.length;
}
