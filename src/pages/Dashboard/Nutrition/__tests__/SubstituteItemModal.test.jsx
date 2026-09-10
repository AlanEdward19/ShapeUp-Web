import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SubstituteItemModal from '../SubstituteItemModal';

const mockSuggestSubstitutes = vi.fn();
const mockSubstituteDiaryItem = vi.fn();
const mockSearchFoods = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        suggestSubstitutes: mockSuggestSubstitutes,
        substituteDiaryItem: mockSubstituteDiaryItem,
        searchFoods: mockSearchFoods,
    }),
}));

const entry = {
    id: 'entry-1',
    foodId: 'food-rice',
    quantityGramsOrMl: 100,
};

describe('SubstituteItemModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSuggestSubstitutes.mockResolvedValue({
            suggestions: [{
                foodId: 'food-quinoa',
                name: 'Quinoa',
                distance: 0.2,
                macrosPer100: { kcal: 120, proteinG: 4, carbG: 21, fatG: 2 },
            }],
        });
        mockSubstituteDiaryItem.mockResolvedValue({});
        mockSearchFoods.mockResolvedValue({
            items: [{ id: 'food-chicken', name: 'Frango grelhado' }],
        });
    });

    it('substitutes via suggestion without changing saved plan', async () => {
        const onSubstituted = vi.fn();
        const { getByTestId } = render(
            <SubstituteItemModal
                entry={entry}
                date="2026-09-10"
                onClose={vi.fn()}
                onSubstituted={onSubstituted}
            />
        );

        await waitFor(() => {
            expect(getByTestId('suggestion-food-quinoa')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('suggestion-food-quinoa'));

        await waitFor(() => {
            expect(mockSubstituteDiaryItem).toHaveBeenCalledWith('entry-1', {
                date: '2026-09-10',
                replacementFoodId: 'food-quinoa',
                quantityGramsOrMl: 100,
            });
            expect(onSubstituted).toHaveBeenCalled();
        });
    });

    it('substitutes via free search', async () => {
        const onSubstituted = vi.fn();
        const { getByTestId } = render(
            <SubstituteItemModal
                entry={entry}
                date="2026-09-10"
                onClose={vi.fn()}
                onSubstituted={onSubstituted}
            />
        );

        await waitFor(() => expect(getByTestId('free-search-input')).toBeInTheDocument());

        fireEvent.change(getByTestId('free-search-input'), { target: { value: 'frango' } });
        fireEvent.click(getByTestId('free-search-btn'));

        await waitFor(() => {
            expect(getByTestId('free-result-food-chicken')).toBeInTheDocument();
        });

        fireEvent.click(getByTestId('free-result-food-chicken'));

        await waitFor(() => {
            expect(mockSubstituteDiaryItem).toHaveBeenCalledWith('entry-1', {
                date: '2026-09-10',
                replacementFoodId: 'food-chicken',
                quantityGramsOrMl: 100,
            });
            expect(onSubstituted).toHaveBeenCalled();
        });
    });
});
