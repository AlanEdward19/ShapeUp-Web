import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import FoodSearch, { supportsBarcodeDetector } from '../FoodSearch';

const mockSearchFoods = vi.fn();
const mockGetFoodByBarcode = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        searchFoods: mockSearchFoods,
        getFoodByBarcode: mockGetFoodByBarcode,
        createFood: vi.fn(),
        createFoodOverride: vi.fn(),
        setActiveFoodVersion: vi.fn(),
    }),
}));

const renderFoodSearch = () =>
    render(
        <MemoryRouter>
            <FoodSearch />
        </MemoryRouter>
    );

describe('FoodSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete window.BarcodeDetector;
    });

    it('renders search form and nutrition nav', () => {
        const { getByTestId } = renderFoodSearch();
        expect(getByTestId('food-search-input')).toBeInTheDocument();
        expect(getByTestId('nutrition-nav')).toBeInTheDocument();
    });

    it('runs text search and shows results', async () => {
        mockSearchFoods.mockResolvedValue({
            items: [{
                id: 'food-1',
                name: 'Arroz branco',
                macrosPer100: { kcal: 130, proteinG: 2, carbG: 28, fatG: 0 },
                isPersonalOverride: false,
            }],
        });

        const { getByTestId } = renderFoodSearch();
        fireEvent.change(getByTestId('food-search-input'), { target: { value: 'arroz' } });
        fireEvent.click(getByTestId('food-search-btn'));

        await waitFor(() => {
            expect(getByTestId('food-result-food-1')).toHaveTextContent('Arroz branco');
        });
        expect(mockSearchFoods).toHaveBeenCalledWith('arroz');
    });

    it('shows empty state when search returns no results', async () => {
        mockSearchFoods.mockResolvedValue({ items: [] });

        const { getByTestId } = renderFoodSearch();
        fireEvent.change(getByTestId('food-search-input'), { target: { value: 'xyz' } });
        fireEvent.click(getByTestId('food-search-btn'));

        await waitFor(() => {
            expect(getByTestId('empty-state')).toHaveTextContent('Nenhum alimento encontrado');
        });
    });

    it('shows manual barcode input when BarcodeDetector is unavailable', () => {
        expect(supportsBarcodeDetector()).toBe(false);
        const { getByTestId, queryByTestId } = renderFoodSearch();
        expect(getByTestId('barcode-manual-input')).toBeInTheDocument();
        expect(queryByTestId('barcode-scan-btn')).not.toBeInTheDocument();
    });

    it('offers create form when barcode is not found', async () => {
        const notFoundError = new Error('Not found');
        notFoundError.status = 404;
        mockGetFoodByBarcode.mockRejectedValue(notFoundError);

        const { getByTestId } = renderFoodSearch();
        fireEvent.change(getByTestId('barcode-manual-input'), { target: { value: '7891234567890' } });
        fireEvent.click(getByTestId('barcode-manual-btn'));

        await waitFor(() => {
            expect(getByTestId('food-form')).toBeInTheDocument();
            expect(getByTestId('food-barcode-input')).toHaveValue('7891234567890');
        });
    });
});
