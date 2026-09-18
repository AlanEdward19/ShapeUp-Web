import { describe, expect, it } from 'vitest';
import { clientPlanListingLabels } from '../TrainingPlansClient';

const dict = {
    'client.session.timer.rest_label': 'Descanso',
    'pro.builder.phase.hypertrophy': 'Hipertrofia',
    'client.training.difficulty.beginner': 'Iniciante',
};

const t = (key) => dict[key] ?? key;

describe('client listing i18n (WEV-03, WEV-04)', () => {
    it('does not use a literal Rest kicker and translates known phase and difficulty', () => {
        const labels = clientPlanListingLabels(t, { phase: 'Hypertrophy', difficulty: 'Beginner' });
        expect(labels.restKicker).toBe('Descanso');
        expect(labels.restKicker).not.toBe('Rest');
        expect(labels.phase).toBe('Hipertrofia');
        expect(labels.difficulty).toBe('Iniciante');
    });

    it('shows raw phase and difficulty instead of a literal i18n key', () => {
        const labels = clientPlanListingLabels(t, { phase: 'CustomPeak', difficulty: 'Elite' });
        expect(labels.phase).toBe('CustomPeak');
        expect(labels.phase).not.toContain('pro.builder.phase.');
        expect(labels.difficulty).toBe('Elite');
        expect(labels.difficulty).not.toContain('client.training.difficulty.');
    });
});
