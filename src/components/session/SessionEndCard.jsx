import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const copy = {
    'pt-BR': {
        sets: (done, total) => `Você cumpriu ${done} de ${total} séries`,
        up: (n) => (n === 1 ? ' e subiu a carga em 1 exercício.' : ` e subiu a carga em ${n} exercícios.`),
        same: ' e a carga não subiu desta vez.',
        previewLabel: 'Prévia do card',
        setsLabel: 'Séries',
        volume: 'Volume',
        duration: 'Duração',
        note: 'Para postar este card, abra o ShapeUp no celular. Aqui na web ele é só uma prévia.',
    },
    en: {
        sets: (done, total) => `You completed ${done} of ${total} sets`,
        up: (n) => (n === 1 ? ' and raised the load on 1 exercise.' : ` and raised the load on ${n} exercises.`),
        same: ' and the load did not go up this time.',
        previewLabel: 'Card preview',
        setsLabel: 'Sets',
        volume: 'Volume',
        duration: 'Duration',
        note: 'To post this card, open ShapeUp on your phone. On the web it is only a preview.',
    },
    es: {
        sets: (done, total) => `Cumpliste ${done} de ${total} series`,
        up: (n) => (n === 1 ? ' y subiste la carga en 1 ejercicio.' : ` y subiste la carga en ${n} ejercicios.`),
        same: ' y la carga no subió esta vez.',
        previewLabel: 'Vista previa del card',
        setsLabel: 'Series',
        volume: 'Volumen',
        duration: 'Duración',
        note: 'Para publicar este card, abre ShapeUp en el celular. En la web es solo una vista previa.',
    },
};

export default function SessionEndCard({ title, summary, volumeText, durationText }) {
    const { language } = useLanguage();
    const c = copy[language] || copy.en;
    const sentence = c.sets(summary.completedSets, summary.totalSets) + (summary.loadIncreases > 0 ? c.up(summary.loadIncreases) : c.same);

    return (
        <section data-testid="session-end-card" aria-label={c.previewLabel} style={{ margin: '1rem 0', textAlign: 'center' }}>
            <p data-testid="session-end-sentence" style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{sentence}</p>
            <div
                role="img"
                aria-label={`${c.previewLabel}: ${sentence}`}
                style={{
                    aspectRatio: '9 / 16',
                    width: '100%',
                    maxWidth: 200,
                    margin: '0 auto',
                    padding: '1rem',
                    borderRadius: 16,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card, #1c1612)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                }}
            >
                <strong style={{ fontSize: 14 }}>{title}</strong>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.completedSets}/{summary.totalSets}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{c.setsLabel}</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>{c.volume}: {volumeText}</div>
                    <div style={{ fontSize: 13 }}>{c.duration}: {durationText}</div>
                </div>
                <span style={{ fontSize: 10, opacity: 0.6 }}>ShapeUp</span>
            </div>
            <p className="su-text-muted" style={{ fontSize: 12, marginTop: '0.75rem' }}>{c.note}</p>
        </section>
    );
}
