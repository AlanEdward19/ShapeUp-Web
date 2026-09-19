import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLang } from '../../../test/withLang';
import WorkoutBodyMap from '../WorkoutBodyMap';

describe('WorkoutBodyMap', () => {
    it('shows front and back maps together and lights chest from Peitoral', () => {
        localStorage.setItem('shapeup_language', 'en');
        const { container, getByText } = render(withLang(
            <WorkoutBodyMap exercises={[{ name: 'Bench', muscles: ['Peitoral maior'] }]} compact />,
        ));

        expect(getByText('Front')).toBeInTheDocument();
        expect(getByText('Back')).toBeInTheDocument();
        expect(container.querySelector('.su-body-map-toggle')).toBeNull();
        expect(container.querySelectorAll('svg.su-body-map-svg')).toHaveLength(2);
        expect(container.querySelector('svg image')).toBeNull();
        expect(container.querySelector('[data-region="MiddleChest"]').classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="MiddleChest"] path').getAttribute('fill')).toMatch(/map-hit|#e06c43/);
    });

    it('fills muscles from the catalog when the plan exercise has none', () => {
        localStorage.setItem('shapeup_language', 'en');
        const { container } = render(withLang(
            <WorkoutBodyMap
                exercises={[{ exerciseId: 1, name: 'Custom label', muscles: [] }]}
                catalog={[{ id: 1, name: 'Incline DB Press', muscles: ['Chest'] }]}
            />,
        ));
        expect(container.querySelector('[data-region="MiddleChest"]').classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="MiddleChest"] path').getAttribute('fill')).toMatch(/map-hit|#e06c43/);
    });

    it('does not highlight from the exercise name alone', () => {
        localStorage.setItem('shapeup_language', 'en');
        const { container } = render(withLang(
            <WorkoutBodyMap exercises={[{ name: 'Lat Pulldown', muscles: [] }]} compact />,
        ));
        expect(container.querySelector('.su-body-map-hint').textContent).toMatch(/No targeted muscles/i);
        expect(container.querySelector('[data-region="Lats"]')?.classList.contains('is-hit')).toBe(false);
    });

    it('lights lats from catalog muscleGroup flags', () => {
        localStorage.setItem('shapeup_language', 'en');
        const { container } = render(withLang(
            <WorkoutBodyMap
                exercises={[{ exerciseId: 9, name: 'Lat Pulldown', muscles: [] }]}
                catalog={[{ id: 9, muscles: [{ muscleGroup: 1 << 13, activationPercent: 80 }] }]}
                compact
            />,
        ));
        expect(container.querySelector('.su-body-map-hint').textContent).not.toMatch(/No targeted muscles/i);
        expect(container.querySelector('[data-region="Lats"]').classList.contains('is-hit')).toBe(true);
        expect(container.querySelector('[data-region="Lats"] path').getAttribute('fill')).toMatch(/map-hit|#e06c43/);
        expect(container.querySelector('.silhouette')).toBeNull();
    });
});
