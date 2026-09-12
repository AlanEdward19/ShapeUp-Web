import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { withLang } from '../../../../test/withLang';
import GoalOnboarding from '../GoalOnboarding';

const mockCompleteOnboarding = vi.fn();
const mockSetManualGoal = vi.fn();

vi.mock('../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        completeOnboarding: mockCompleteOnboarding,
        setManualGoal: mockSetManualGoal,
    }),
}));

const renderOnboarding = () =>
        render(
            withLang(
            <MemoryRouter>
                <GoalOnboarding />
            </MemoryRouter>
            )
        );

describe('GoalOnboarding', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCompleteOnboarding.mockResolvedValue({
            activeGoal: { kcal: 2200, proteinG: 165, carbG: 220, fatG: 70 },
            onboardingSkipped: false,
        });
        mockSetManualGoal.mockResolvedValue({
            activeGoal: { kcal: 1800, proteinG: 140, carbG: 180, fatG: 60 },
            onboardingSkipped: true,
        });
    });

    it('completes TDEE onboarding flow', async () => {
        const { getByTestId } = renderOnboarding();

        fireEvent.change(getByTestId('height-input'), { target: { value: '175' } });
        fireEvent.change(getByTestId('age-input'), { target: { value: '30' } });
        fireEvent.click(getByTestId('onboarding-submit-btn'));

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith({
                heightCm: 175,
                age: 30,
                biologicalSex: 'Male',
                activityLevel: 'ModeratelyActive',
            });
            expect(getByTestId('goal-result')).toHaveTextContent('2200 kcal');
        });
    });

    it('allows skipping to manual goal', async () => {
        const { getByTestId } = renderOnboarding();

        fireEvent.click(getByTestId('mode-manual-btn'));
        fireEvent.change(getByTestId('manual-kcal-input'), { target: { value: '1800' } });
        fireEvent.change(getByTestId('manual-protein-input'), { target: { value: '140' } });
        fireEvent.change(getByTestId('manual-carb-input'), { target: { value: '180' } });
        fireEvent.change(getByTestId('manual-fat-input'), { target: { value: '60' } });
        fireEvent.click(getByTestId('manual-submit-btn'));

        await waitFor(() => {
            expect(mockSetManualGoal).toHaveBeenCalledWith({
                goal: { kcal: 1800, proteinG: 140, carbG: 180, fatG: 60 },
            });
            expect(getByTestId('goal-result')).toHaveTextContent('1800 kcal');
        });
    });
});
