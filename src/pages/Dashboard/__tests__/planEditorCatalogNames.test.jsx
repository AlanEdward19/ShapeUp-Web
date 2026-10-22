import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';

vi.mock('../../../components/tour/useShadowAwareTour', () => ({
    useTour: () => ({ setIsOpen: vi.fn(), setSteps: vi.fn(), setCurrentStep: vi.fn() }),
}));

vi.mock('../../../hooks/useExercises', () => ({
    useExercises: () => ({
        exercises: [{ id: 7, name: 'Supino reto', namePt: 'Supino reto', muscles: ['Peito médio', 'Tríceps'], muscleDetails: [], exerciseType: 'WeightBased' }],
    }),
}));

import { PlanEditor } from '../ClientDetail';

const plan = {
    name: 'Treino A',
    phase: 'Bloco de volume',
    difficulty: 'Intermediate',
    weeks: 4,
    notes: '',
    blocks: [{ id: 'b1', type: 'straight', exercises: [{ id: 'e1', exerciseId: 7, name: '', tags: '', notes: '', requireRpe: false, sets: [] }] }],
};

describe('PlanEditor with API plans that only carry exercise ids', () => {
    it('fills the exercise name and muscles from the catalog', () => {
        localStorage.setItem('shapeup_language', 'pt-BR');
        render(withLang(<PlanEditor plan={plan} onSave={vi.fn()} onCancel={vi.fn()} />));
        expect(screen.getByRole('heading', { name: 'Supino reto' })).toBeInTheDocument();
        expect(screen.getByText('Peito médio • Tríceps')).toBeInTheDocument();
    });

    it('never prints a raw translation key for an unknown phase', () => {
        localStorage.setItem('shapeup_language', 'pt-BR');
        render(withLang(<PlanEditor plan={plan} onSave={vi.fn()} onCancel={vi.fn()} />));
        expect(document.body.textContent).not.toContain('pro.builder.phase.');
        expect(screen.getAllByText(/Bloco de volume/).length).toBeGreaterThan(0);
    });
});
