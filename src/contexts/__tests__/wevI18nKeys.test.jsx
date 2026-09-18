import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

const WEV_KEYS = [
    'client.session.timer.rest_label',
    'client.training.difficulty.beginner',
    'client.training.difficulty.intermediate',
    'client.training.difficulty.advanced',
    'client.training.difficulty.easy',
    'client.training.difficulty.hard',
    'pro.builder.require_rpe',
    'pro.builder.require_rpe.all',
    'client.session.validation.weight_required',
    'client.session.validation.reps_required',
    'client.session.validation.rpe_required',
];

const Probe = () => {
    const { t } = useLanguage();
    return (
        <ul>
            {WEV_KEYS.map((key) => (
                <li key={key} data-key={key}>{t(key)}</li>
            ))}
        </ul>
    );
};

const valuesFor = (lang) => {
    localStorage.setItem('shapeup_language', lang);
    const { container } = render(
        <LanguageProvider>
            <Probe />
        </LanguageProvider>
    );
    const map = {};
    container.querySelectorAll('[data-key]').forEach((el) => {
        map[el.getAttribute('data-key')] = el.textContent;
    });
    return map;
};

describe('WEV i18n keys', () => {
    it('exists in en, pt-BR, and es with equal key sets and Rest labels', () => {
        const en = valuesFor('en');
        const pt = valuesFor('pt-BR');
        const es = valuesFor('es');

        WEV_KEYS.forEach((key) => {
            expect(en[key], key).not.toBe(key);
            expect(pt[key], key).not.toBe(key);
            expect(es[key], key).not.toBe(key);
        });

        expect(Object.keys(en).sort()).toEqual([...WEV_KEYS].sort());
        expect(Object.keys(pt).sort()).toEqual([...WEV_KEYS].sort());
        expect(Object.keys(es).sort()).toEqual([...WEV_KEYS].sort());

        expect(en['client.session.timer.rest_label']).toBe('Rest');
        expect(pt['client.session.timer.rest_label']).toBe('Descanso');
        expect(es['client.session.timer.rest_label']).toBe('Descanso');
    });
});
