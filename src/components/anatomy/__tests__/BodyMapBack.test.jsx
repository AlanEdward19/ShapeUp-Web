import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BodyMapBack from '../BodyMapBack';

const BACK_REGIONS = [
    'Lats',
    'Traps',
    'UpperBack',
    'MiddleBack',
    'LowerBack',
    'DeltoidPosterior DeltoidLateral',
    'Triceps',
    'Forearms',
    'Glutes',
    'Hamstrings',
    'Calves',
];

describe('BodyMapBack', () => {
    it('renders an SVG map with highlightable back regions', () => {
        const { container } = render(
            <BodyMapBack
                hits={{ Lats: 2, Glutes: 1 }}
                maxHits={2}
                labels={{ back: 'Costas', Lats: 'Dorsais', Glutes: 'Glúteos' }}
            />,
        );

        const svg = container.querySelector('svg.su-body-map-svg');
        expect(svg).toBeTruthy();
        expect(svg.classList.contains('is-photo')).toBe(false);
        expect(svg.getAttribute('viewBox')).toBe('205 40 380 960');
        expect(svg.querySelector('image')).toBeNull();

        for (const region of BACK_REGIONS) {
            expect(container.querySelector(`[data-region="${region}"]`)).toBeTruthy();
        }

        const latsPath = container.querySelector('[data-region="Lats"] path');
        expect(latsPath.getAttribute('fill')).toMatch(/map-hit|#e06c43/);
        expect(container.querySelector('[data-region="Lats"]').classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="Glutes"]').classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="Traps"] path').getAttribute('fill')).toMatch(/map-idle|#9a8b82/);
    });
});
