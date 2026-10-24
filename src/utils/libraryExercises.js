/**
 * Exercises picked in the library ("cart") become editor entries with one default working set.
 * Shared by the create-workout and add-to-workout flows of both training pages.
 */
export const defaultWorkingSet = () => ({
    type: 'working', technique: 'Straight', reps: '8-10', load: '', intensityType: 'rpe', intensityValue: '8', rest: '90',
});

export function buildPlanExercises(exercises = [], stamp = Date.now()) {
    return exercises.map((exercise, index) => ({
        ...exercise,
        exerciseId: exercise.id,
        id: `e${stamp}-${index}`,
        notes: '',
        sets: [defaultWorkingSet()],
    }));
}

export function buildExerciseBlocks(exercises = [], stamp = Date.now()) {
    return exercises.length
        ? [{ id: `b${stamp}`, type: 'straight', exercises: buildPlanExercises(exercises, stamp) }]
        : [];
}

/** Same plan with the picked exercises appended as one extra straight block. */
export function appendExercisesToPlan(plan, exercises = [], stamp = Date.now()) {
    return { ...plan, blocks: [...(plan.blocks || []), ...buildExerciseBlocks(exercises, stamp)] };
}

/** Navigation state may carry one exercise (old links) or the whole selection. */
export function exercisesFromState(state) {
    if (Array.isArray(state?.exercises) && state.exercises.length) return state.exercises;
    return state?.exercise ? [state.exercise] : [];
}
