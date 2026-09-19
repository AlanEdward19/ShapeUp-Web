import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

const EXLIB_KEYS = [
    'exlib.title',
    'exlib.view.list',
    'exlib.view.cards',
    'exlib.new',
    'exlib.search.placeholder',
    'exlib.filter.group',
    'exlib.filter.equipment',
    'exlib.filter.all',
    'exlib.sort',
    'exlib.sort.name',
    'exlib.sort.muscles',
    'exlib.count',
    'exlib.hint.select',
    'exlib.col.code',
    'exlib.col.exercise',
    'exlib.col.equipment',
    'exlib.col.pattern',
    'exlib.col.actions',
    'exlib.row.insert',
    'exlib.row.inspect',
    'exlib.empty',
    'exlib.loading',
    'exlib.error',
    'exlib.equipment.unknown',
    'exlib.drawer.close',
    'exlib.drawer.select',
    'exlib.drawer.exercise',
    'exlib.drawer.prescribe',
    'exlib.drawer.sets',
    'exlib.drawer.reps',
    'exlib.drawer.rest',
    'exlib.drawer.activation',
    'exlib.drawer.library_badge',
    'exlib.drawer.steps',
    'exlib.drawer.no_steps',
    'exlib.drawer.critical',
    'exlib.drawer.add',
    'exlib.drawer.copy',
    'exlib.drawer.copy_title',
    'exlib.video.empty',
    'exlib.video.play',
    'exlib.video.pause',
    'exlib.video.replay',
    'exlib.video.fullscreen',
    'exlib.video.progress',
    'exlib.subs.title',
    'exlib.subs.empty',
    'exlib.subs.options',
    'exlib.toast.missing_equivalent',
];

const PT_LITERALS_EN_MUST_AVOID = [
    'Biblioteca de Exercícios',
    'Adicionar à Ficha do Aluno',
    'Vídeo de execução não cadastrado',
    'Diretrizes Técnicas de Execução',
];

const Probe = () => {
    const { t } = useLanguage();
    return (
        <ul>
            {EXLIB_KEYS.map((key) => (
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

describe('exlib i18n keys', () => {
    it('exists in en, pt-BR, and es with equal key sets and English avoids PT literals', () => {
        const en = valuesFor('en');
        const pt = valuesFor('pt-BR');
        const es = valuesFor('es');

        EXLIB_KEYS.forEach((key) => {
            expect(en[key], key).not.toBe(key);
            expect(pt[key], key).not.toBe(key);
            expect(es[key], key).not.toBe(key);
        });

        expect(Object.keys(en).sort()).toEqual([...EXLIB_KEYS].sort());
        expect(Object.keys(pt).sort()).toEqual([...EXLIB_KEYS].sort());
        expect(Object.keys(es).sort()).toEqual([...EXLIB_KEYS].sort());

        PT_LITERALS_EN_MUST_AVOID.forEach((literal) => {
            expect(Object.values(en)).not.toContain(literal);
        });

        expect(pt['exlib.drawer.add']).toBe('Adicionar à Ficha do Aluno');
        expect(pt['exlib.video.empty']).toBe('Vídeo de execução não cadastrado');
    });
});
