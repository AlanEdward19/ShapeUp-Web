/** Equivalent count for the active session exercise (GET cache). */
export function getSessionEquivalentCount(equivalentsCache, exercise) {
    const exKey = String(exercise.exerciseId ?? exercise.id);
    return equivalentsCache[exKey]?.items?.length ?? 0;
}

export function isSessionSwapDisabled(equivalentsCache, exercise) {
    return getSessionEquivalentCount(equivalentsCache, exercise) === 0;
}
