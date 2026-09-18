import React, { useEffect, useState } from 'react';
import Button from '../Button';
import { useLanguage } from '../../contexts/LanguageContext';

const EquivalentPickerModal = ({
    open,
    onClose,
    onConfirm,
    equivalents = [],
    loading = false,
}) => {
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (open) setSelectedId(null);
    }, [open]);

    if (!open) return null;

    const emptyCopy = t('client.session.swap.picker.empty');

    return (
        <div className="su-modal-overlay su-elm-overlay" onClick={onClose} role="presentation">
            <div
                className="su-modal-box su-elm-box"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="swap-picker-title"
            >
                <div className="su-elm-header">
                    <div>
                        <h2 className="su-elm-title" id="swap-picker-title">
                            {t('client.session.swap.picker.title')}
                        </h2>
                    </div>
                    <button type="button" className="su-modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                {loading ? (
                    <p className="su-elm-subtitle">{t('client.session.swap.picker.loading')}</p>
                ) : equivalents.length === 0 ? (
                    <p className="su-elm-subtitle">{emptyCopy}</p>
                ) : (
                    <ul className="su-elm-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {equivalents.map((item) => {
                            const id = String(item.exerciseId ?? item.id);
                            const selected = selectedId === id;
                            return (
                                <li key={id}>
                                    <button
                                        type="button"
                                        className={`su-elm-exercise-row ${selected ? 'selected' : ''}`}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 12px',
                                            border: selected ? '1px solid var(--brand-terracotta, #e06c43)' : '1px solid transparent',
                                            borderRadius: 6,
                                            marginBottom: 4,
                                            background: selected ? 'rgba(224, 108, 67, 0.08)' : 'transparent',
                                        }}
                                        onClick={() => setSelectedId(id)}
                                    >
                                        <span className="su-elm-exercise-name">{item.name || `EX-${id}`}</span>
                                        {item.subtitle ? (
                                            <span className="su-elm-exercise-meta" style={{ display: 'block', fontSize: 12, opacity: 0.75 }}>
                                                {item.subtitle}
                                            </span>
                                        ) : null}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="su-elm-footer" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button variant="outline" fullWidth onClick={onClose}>
                        {t('client.session.swap.picker.cancel')}
                    </Button>
                    <Button
                        fullWidth
                        disabled={!selectedId || equivalents.length === 0}
                        onClick={() => {
                            const chosen = equivalents.find(
                                (item) => String(item.exerciseId ?? item.id) === selectedId,
                            );
                            if (chosen) onConfirm(chosen);
                        }}
                    >
                        {t('client.session.swap.picker.confirm')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EquivalentPickerModal;
