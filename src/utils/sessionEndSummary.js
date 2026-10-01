const bestLoad = (sets) => (sets || []).reduce((max, s) => {
    const load = parseFloat(s.load ?? s.log?.weight) || 0;
    return load > max ? load : max;
}, 0);

/**
 * Counts completed sets and the exercises whose top load beat the last time the exercise was done.
 * `history` is the list of past sessions, newest first; an exercise with no past session never counts as "subiu".
 */
export function buildSessionEndSummary(exercises, history = []) {
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
