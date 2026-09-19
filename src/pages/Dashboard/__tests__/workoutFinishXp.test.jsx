import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { runWorkoutSubmitFeedback } from '../workoutSubmitFeedback';
import WorkoutFinishXpPopup from '../WorkoutFinishXpPopup';

const pendingCelebration = {
    open: true,
    status: 'pending',
    delta: null,
    mascotImageUrl: undefined,
    dismiss: vi.fn(),
};

describe('runWorkoutSubmitFeedback', () => {
    it('Independent finish: overview opens and XP celebration starts together', () => {
        const setShowFeedbackModal = vi.fn();
        const setShowOverviewModal = vi.fn();
        const xpCelebrationStart = vi.fn();
        const enqueueMutation = vi.fn();

        runWorkoutSubmitFeedback({
            workoutSessionId: 'ind-session-1',
            perceivedExertion: 6,
            finishExercises: [{ exerciseId: 1, sets: [] }],
            enqueueMutation,
            setShowFeedbackModal,
            setShowOverviewModal,
            xpCelebrationStart,
        });

        expect(setShowFeedbackModal).toHaveBeenCalledWith(false);
        expect(setShowOverviewModal).toHaveBeenCalledWith(true);
        expect(xpCelebrationStart).toHaveBeenCalledWith({ sessionId: 'ind-session-1' });
        expect(enqueueMutation).toHaveBeenCalledWith(
            expect.objectContaining({
                endpoint: '/api/training/workouts/ind-session-1/finish',
                dedupeKey: 'workout-finish-ind-session-1',
            })
        );
    });

    it('Client finish: overview opens and XP celebration starts together', () => {
        const setShowFeedbackModal = vi.fn();
        const setShowOverviewModal = vi.fn();
        const xpCelebrationStart = vi.fn();

        runWorkoutSubmitFeedback({
            workoutSessionId: 42,
            perceivedExertion: 5,
            finishExercises: [],
            enqueueMutation: vi.fn(),
            setShowFeedbackModal,
            setShowOverviewModal,
            xpCelebrationStart,
        });

        expect(setShowOverviewModal).toHaveBeenCalledWith(true);
        expect(xpCelebrationStart).toHaveBeenCalledWith({ sessionId: '42' });
    });
});

describe('WorkoutFinishXpPopup mount', () => {
    it('shows pending XP popup when celebration is open after submit', () => {
        render(
            <>
                <div data-testid="workout-overview-open" />
                <WorkoutFinishXpPopup xpCelebration={pendingCelebration} />
            </>
        );
        expect(screen.getByTestId('workout-overview-open')).toBeInTheDocument();
        expect(screen.getByTestId('xp-celebration-pending')).toBeInTheDocument();
        expect(screen.queryByText(/\+\d+\s*XP/i)).not.toBeInTheDocument();
    });
});
