import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DiaryDay from '../DiaryDay';
import { isMacroGoalMet } from '../nutritionUtils';
import { withLang } from '../../../../test/withLang';

const mockGetDiaryDay = vi.fn();
const mockGetNutritionProfile = vi.fn();
const mockRemoveDiaryEntry = vi.fn();
const mockSuggestSubstitutes = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        getDiaryDay: mockGetDiaryDay,
        getNutritionProfile: mockGetNutritionProfile,
        removeDiaryEntry: mockRemoveDiaryEntry,
        suggestSubstitutes: mockSuggestSubstitutes,
        substituteDiaryItem: vi.fn(),
        searchFoods: vi.fn(),
    }),
}));

const sampleDiary = {
    date: '2026-09-10',
    meals: [
        {
            mealSlot: 'Breakfast',
            items: [{
                id: 'entry-1',
                mealSlot: 'Breakfast',
                foodId: 'food-rice',
                usesOverride: false,
                quantityGramsOrMl: 100,
                computedMacros: { kcal: 130, proteinG: 3, carbG: 28, fatG: 1 },
            }],
        },
    ],
    totals: { kcal: 130, proteinG: 3, carbG: 28, fatG: 1 },
};

const renderDiaryDay = () =>
        render(
            withLang(
            <MemoryRouter>
                <DiaryDay />
            </MemoryRouter>
            )
        );

describe('DiaryDay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetNutritionProfile.mockResolvedValue({
            activeGoal: { kcal: 2000, proteinG: 150, carbG: 200, fatG: 65 },
        });
        mockRemoveDiaryEntry.mockResolvedValue(null);
        mockSuggestSubstitutes.mockResolvedValue({ suggestions: [] });
    });

    it('renders meals and macro progress with data', async () => {
        mockGetDiaryDay.mockResolvedValue(sampleDiary);

        const { getByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('meal-Breakfast')).toBeInTheDocument();
            expect(getByTestId('diary-entry-entry-1')).toBeInTheDocument();
            expect(getByTestId('macro-summary')).toBeInTheDocument();
        });
    });

    it('shows clear empty state for day without entries', async () => {
        mockGetDiaryDay.mockResolvedValue({
            date: '2026-09-10',
            meals: [],
            totals: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
        });

        const { getByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('empty-day')).toHaveTextContent('No meals logged');
        });
    });

    it('opens substitute modal when substitute button is clicked', async () => {
        mockGetDiaryDay.mockResolvedValue(sampleDiary);

        const { getByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('substitute-btn-entry-1')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('substitute-btn-entry-1'));

        await waitFor(() => {
            expect(getByTestId('substitute-modal')).toBeInTheDocument();
        });
    });

    it('shows skeleton while diary fetch is in flight', async () => {
        let resolveDay;
        mockGetDiaryDay.mockImplementation(
            () => new Promise((resolve) => { resolveDay = resolve; }),
        );
        mockGetNutritionProfile.mockResolvedValue({ activeGoal: null });

        const { getByTestId } = renderDiaryDay();
        expect(getByTestId('skeleton')).toBeInTheDocument();
        resolveDay(sampleDiary);
        await waitFor(() => {
            expect(getByTestId('meal-Breakfast')).toBeInTheDocument();
        });
    });

    it('shows load error instead of empty day when API fails', async () => {
        mockGetDiaryDay.mockRejectedValue(new Error('Network down'));

        const { getByTestId, queryByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('diary-load-error')).toBeInTheDocument();
        });
        expect(queryByTestId('empty-day')).not.toBeInTheDocument();
    });

    it('retries diary fetch when retry is clicked', async () => {
        mockGetDiaryDay.mockRejectedValueOnce(new Error('Network down'));
        mockGetDiaryDay.mockResolvedValueOnce(sampleDiary);

        const { getByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('diary-retry-btn')).toBeInTheDocument();
        });
        fireEvent.click(getByTestId('diary-retry-btn'));

        await waitFor(() => {
            expect(getByTestId('meal-Breakfast')).toBeInTheDocument();
        });
        expect(mockGetDiaryDay).toHaveBeenCalledTimes(2);
    });

    it('shows celebration when macro goal is met', async () => {
        mockGetDiaryDay.mockResolvedValue({
            ...sampleDiary,
            totals: { kcal: 2000, proteinG: 150, carbG: 200, fatG: 65 },
        });

        const { getByTestId } = renderDiaryDay();

        await waitFor(() => {
            expect(getByTestId('goal-celebration')).toHaveTextContent('Goal hit!');
        });
    });
});

describe('isMacroGoalMet', () => {
    it('returns true when all three macros are within 10% tolerance', () => {
        expect(isMacroGoalMet(
            { proteinG: 148, carbG: 198, fatG: 64 },
            { proteinG: 150, carbG: 200, fatG: 65 }
        )).toBe(true);
    });

    it('returns false when a macro is outside tolerance', () => {
        expect(isMacroGoalMet(
            { proteinG: 100, carbG: 200, fatG: 65 },
            { proteinG: 150, carbG: 200, fatG: 65 }
        )).toBe(false);
    });
});
