const bestLoad = (sets) => (sets || []).reduce((max, s) => {
    const load = parseFloat(s.load ?? s.log?.weight) || 0;
    return load > max ? load : max;
}, 0);

// Local entries carry an `h<timestamp>` id, API entries a startedAtUtc/ISO date; unknown order sorts last, keeping input order.
const entryTime = (entry) => {
    const localId = /^h(\d{10,})$/.exec(String(entry.id ?? ''));
    if (localId) return Number(localId[1]);
    const parsed = Date.parse(entry.startedAtUtc ?? entry.date);
    return Number.isNaN(parsed) ? -Infinity : parsed;
};

const newestFirst = (history) => [...history].sort((a, b) => entryTime(b) - entryTime(a));

/**
 * Counts completed sets and the exercises whose top load beat the last time the exercise was done.
 * `history` is the list of past sessions in any order; an exercise with no past session never counts as "subiu".
 */
export function buildSessionEndSummary(exercises, rawHistory = []) {
    const history = newestFirst(rawHistory || []);
    let totalSets = 0;
    let completedSets = 0;
    let loadIncreases = 0;

    (exercises || []).forEach((exercise) => {
        const sets = exercise.sets || [];
        totalSets += sets.length;
        const done = sets.filter((s) => s.completed);
        completedSets += done.length;

        const current = bestLoad(done);
        if (current <= 0) return;
        const lastTime = history.find((entry) => (entry.exercises || []).some((e) => e.name === exercise.name && (e.sets || []).length > 0));
        if (!lastTime) return;
        const previous = bestLoad(lastTime.exercises.find((e) => e.name === exercise.name).sets);
        if (previous > 0 && current > previous) loadIncreases += 1;
    });

    return { totalSets, completedSets, loadIncreases };
}
