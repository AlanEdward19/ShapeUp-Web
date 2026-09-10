import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GamificationProgressCard from '../GamificationProgressCard';

describe('GamificationProgressCard nutrition streak', () => {
    const baseProfile = {
        totalXp: 600,
        level: 2,
        currentStreak: 3,
        shapeCoins: 50,
        shapeScore: 120,
    };

    it('renders nutrition streak when greater than zero', () => {
        const { getByTestId } = render(
            <GamificationProgressCard profile={{ ...baseProfile, nutritionCurrentStreak: 5 }} />
        );
        expect(getByTestId('nutrition-streak-stat')).toBeInTheDocument();
        expect(getByTestId('nutrition-streak-value')).toHaveTextContent('5');
        expect(getByTestId('workout-streak-stat')).toHaveTextContent('3');
    });

    it('renders nutrition streak as zero', () => {
        const { getByTestId } = render(
            <GamificationProgressCard profile={{ ...baseProfile, nutritionCurrentStreak: 0 }} />
        );
        expect(getByTestId('nutrition-streak-value')).toHaveTextContent('0');
    });
});
