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

describe('GamificationProgressCard XP bar', () => {
    const activeProfile = {
        totalXp: 750,
        level: 2,
        currentStreak: 3,
        nutritionCurrentStreak: 1,
        shapeCoins: 50,
        shapeScore: 120,
    };

    it('shows proportional fill and aria-valuenow for in-level remainder 250', () => {
        const { getByRole } = render(<GamificationProgressCard profile={activeProfile} />);
        const bar = getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuenow', '250');
        const fill = bar.querySelector('.su-gamification-progress-fill');
        expect(fill?.style.width).toBe('50%');
    });

    it.each([
        [1, '1', '0.2%'],
        [2, '2', '0.4%'],
        [499, '499', '99.8%'],
    ])(
        'totalXp %i keeps exact fill width (Math.round would zero 1–2 XP)',
        (totalXp, ariaValuenow, expectedWidth) => {
            const { getByRole } = render(
                <GamificationProgressCard
                    profile={{
                        ...activeProfile,
                        totalXp,
                        level: 1,
                    }}
                />
            );
            const bar = getByRole('progressbar');
            expect(bar).toHaveAttribute('aria-valuenow', ariaValuenow);
            expect(bar.querySelector('.su-gamification-progress-fill')?.style.width).toBe(
                expectedWidth
            );
        }
    );

    it('shows 0% fill at level boundary without empty-state copy', () => {
        const { getByRole, queryByText } = render(
            <GamificationProgressCard
                profile={{
                    totalXp: 1000,
                    level: 2,
                    currentStreak: 2,
                    nutritionCurrentStreak: 1,
                    shapeCoins: 10,
                    shapeScore: 80,
                }}
            />
        );
        expect(queryByText('Complete seu primeiro treino pra começar')).not.toBeInTheDocument();
        const fill = getByRole('progressbar').querySelector('.su-gamification-progress-fill');
        expect(fill?.style.width).toBe('0%');
    });

    it('shows empty copy and no progressbar for all-zero profile', () => {
        const { getByText, queryByRole } = render(
            <GamificationProgressCard
                profile={{
                    totalXp: 0,
                    level: 1,
                    currentStreak: 0,
                    nutritionCurrentStreak: 0,
                    shapeCoins: 0,
                    shapeScore: 0,
                }}
            />
        );
        expect(getByText('Complete seu primeiro treino pra começar')).toBeInTheDocument();
        expect(queryByRole('progressbar')).not.toBeInTheDocument();
    });
});
