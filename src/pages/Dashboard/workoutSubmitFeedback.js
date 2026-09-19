export function runWorkoutSubmitFeedback({
    workoutSessionId,
    perceivedExertion,
    finishExercises,
    enqueueMutation,
    setShowFeedbackModal,
    setShowOverviewModal,
    xpCelebrationStart,
}) {
    if (workoutSessionId) {
        enqueueMutation({
            endpoint: `/api/training/workouts/${workoutSessionId}/finish`,
            method: 'POST',
            body: {
                sessionId: String(workoutSessionId),
                endedAtUtc: new Date().toISOString(),
                perceivedExertion,
                exercises: finishExercises || [],
            },
            dedupeKey: `workout-finish-${workoutSessionId}`,
        });
    }
    setShowFeedbackModal(false);
    setShowOverviewModal(true);
    if (workoutSessionId) {
        void xpCelebrationStart({ sessionId: String(workoutSessionId) });
    }
}
