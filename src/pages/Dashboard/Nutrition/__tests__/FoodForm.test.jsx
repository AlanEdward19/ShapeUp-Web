import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import FoodForm from '../FoodForm';

const mockCreateFood = vi.fn();
const mockCreateFoodOverride = vi.fn();
const mockSetActiveFoodVersion = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        createFood: mockCreateFood,
        createFoodOverride: mockCreateFoodOverride,
        setActiveFoodVersion: mockSetActiveFoodVersion,
    }),
}));

describe('FoodForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateFood.mockResolvedValue({ id: 'new-food', name: 'Banana' });
        mockSetActiveFoodVersion.mockResolvedValue({ id: 'food-1', isPersonalOverride: false });
    });

    it('renders create form with macro fields', () => {
        const { getByTestId } = render(<FoodForm />);
        expect(getByTestId('food-form')).toBeInTheDocument();
        expect(getByTestId('food-name-input')).toBeInTheDocument();
        expect(getByTestId('food-kcal-input')).toBeInTheDocument();
    });

    it('shows version flag and toggle for food with personal override', async () => {
        const food = {
            id: 'food-1',
            name: 'Arroz',
            isPersonalOverride: true,
            macrosPer100: { kcal: 130, proteinG: 2, carbG: 28, fatG: 0 },
        };

        const { getByTestId } = render(<FoodForm food={food} />);
        expect(getByTestId('version-flag')).toHaveTextContent('Sua versão');
        expect(getByTestId('version-toggle')).toBeInTheDocument();

        fireEvent.click(getByTestId('version-toggle'));

        await waitFor(() => {
            expect(mockSetActiveFoodVersion).toHaveBeenCalledWith('food-1', { usePersonalOverride: false });
        });
    });

    it('submits new food via createFood', async () => {
        const { getByTestId } = render(<FoodForm initialBarcode="123" />);

        fireEvent.change(getByTestId('food-name-input'), { target: { value: 'Banana' } });
        fireEvent.change(getByTestId('food-kcal-input'), { target: { value: '89' } });
        fireEvent.change(getByTestId('food-protein-input'), { target: { value: '1' } });
        fireEvent.change(getByTestId('food-carb-input'), { target: { value: '23' } });
        fireEvent.change(getByTestId('food-fat-input'), { target: { value: '0' } });
        fireEvent.click(getByTestId('food-save-btn'));

        await waitFor(() => {
            expect(mockCreateFood).toHaveBeenCalledWith({
                name: 'Banana',
                barcode: '123',
                macrosPer100: { kcal: 89, proteinG: 1, carbG: 23, fatG: 0 },
            });
        });
    });
});
