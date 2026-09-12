import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../components/Button';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminLedger.css';
import useDialogFocus from '../../hooks/useDialogFocus';

const MacroDiff = ({ label, publicVal, proposedVal }) => (
    <div className="su-macro-diff">
        <strong>{label}:</strong>
        <span>
            <span className="su-macro-was">{publicVal}</span>
            → <span className="su-primary-text">{proposedVal}</span>
        </span>
    </div>
);

const FoodModerationQueue = () => {
    const { t, language } = useLanguage();
    const pt = language === 'pt-BR';
    const { getPendingModerations, decideModeration } = useNutritionApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [deciding, setDeciding] = useState(false);
    const closeInspection = useCallback(() => setSelectedItem(null), []);
    const inspectionRef = useDialogFocus(Boolean(selectedItem), closeInspection);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getPendingModerations();
            setItems(response?.items ?? []);
        } catch (err) {
            setError(err.message || t('admin.food.error.load'));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [getPendingModerations, t]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const handleDecision = async (requestId, decision) => {
        if (deciding) return;
        setDeciding(true);
        try {
            await decideModeration(requestId, decision);
            setItems((prev) => prev.filter((item) => item.requestId !== requestId));
            setSelectedItem(null);
        } catch (err) {
            setError(err.message || t('admin.food.error.decide', { action: decision === 'Approved' ? t('admin.food.approve') : t('admin.food.reject') }));
        } finally { setDeciding(false); }
    };

    return (
        <div className="su-admin-ledger">
            <span className="su-admin-kicker">{t('admin.food.kicker')}</span>
            <h1 className="su-page-title su-mb-6">{t('admin.food.title')}</h1>
            <div className="su-moderation-summary"><strong>{loading ? '—' : items.length}</strong><span>{pt ? 'solicitações aguardando revisão' : 'requests awaiting review'}</span><button className="su-btn su-btn-secondary" onClick={loadQueue} disabled={loading}>{pt ? 'Atualizar fila' : 'Refresh queue'}</button></div>

            {error && <p className="su-input-error-text su-mb-4" role="alert">{error}</p>}

            {loading ? (
                <p className="su-text-muted">{t('admin.food.loading')}</p>
            ) : items.length === 0 ? (
                <section className="su-empty-queue" data-testid="empty-queue">
                    <p className="su-text-muted" style={{ margin: 0 }}>{t('admin.food.empty')}</p>
                </section>
            ) : (
                <div className="su-moderation-table-scroll"><table className="su-moderation-table"><thead><tr><th>Alimento / catálogo</th><th>Valores publicados → propostos</th><th>Ações de moderação</th></tr></thead><tbody>{items.map((item) => (
                    <tr key={item.requestId} className="su-moderation-item" data-testid={`moderation-${item.requestId}`}>
                        <td><h3 className="su-section-title">{item.foodName}</h3>
                        <button className="su-moderation-inspect su-btn su-btn-secondary" onClick={() => setSelectedItem(item)}>{pt ? 'Inspecionar alimento' : 'Inspect food'}</button>
                        <p className="su-text-muted" style={{ fontSize: '0.85rem' }}>
                            {t('admin.food.requested', { id: item.requestedByUserId, when: new Date(item.createdAtUtc).toLocaleString() })}
                        </p>

                        </td><td><div className="su-macro-proof" data-testid={`diff-${item.requestId}`}>
                            <MacroDiff label={t('nutrition.macro.kcal')} publicVal={item.publicMacros.kcal} proposedVal={item.proposedMacros.kcal} />
                            <MacroDiff label={t('nutrition.macro.protein')} publicVal={item.publicMacros.proteinG} proposedVal={item.proposedMacros.proteinG} />
                            <MacroDiff label={t('nutrition.macro.carb')} publicVal={item.publicMacros.carbG} proposedVal={item.proposedMacros.carbG} />
                            <MacroDiff label={t('nutrition.macro.fat')} publicVal={item.publicMacros.fatG} proposedVal={item.proposedMacros.fatG} />
                        </div>

                        </td><td><div className="su-moderation-actions">
                            <Button
                                onClick={() => handleDecision(item.requestId, 'Approved')}
                                disabled={deciding}
                                data-testid={`approve-${item.requestId}`}
                            >
                                {t('admin.food.approve')}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleDecision(item.requestId, 'Rejected')}
                                disabled={deciding}
                                data-testid={`reject-${item.requestId}`}
                            >
                                {t('admin.food.reject')}
                            </Button>
                        </div>
                    </td></tr>
                ))}</tbody></table></div>
            )}
            {selectedItem && <div className="su-inspection-overlay" onClick={() => setSelectedItem(null)}><aside ref={inspectionRef} className="su-inspection-drawer" role="dialog" aria-modal="true" aria-labelledby="food-inspection-title" onClick={event => event.stopPropagation()}><header><span className="su-nutrition-kicker">{pt ? 'Inspeção nutricional' : 'Nutrition review'}</span><button className="su-btn su-btn-secondary" onClick={() => setSelectedItem(null)} aria-label={pt ? 'Fechar inspeção' : 'Close inspection'}>×</button></header><h2 id="food-inspection-title">{selectedItem.foodName}</h2><p className="su-text-muted">{pt ? 'Compare os valores publicados com a alteração proposta.' : 'Compare published values with the proposed change.'}</p><div className="su-inspection-macros">{[['kcal', 'nutrition.macro.kcal'], ['proteinG', 'nutrition.macro.protein'], ['carbG', 'nutrition.macro.carb'], ['fatG', 'nutrition.macro.fat']].map(([key, label]) => <MacroDiff key={key} label={t(label)} publicVal={selectedItem.publicMacros[key]} proposedVal={selectedItem.proposedMacros[key]} />)}</div><footer><Button variant="secondary" disabled={deciding} onClick={() => handleDecision(selectedItem.requestId, 'Rejected')}>{t('admin.food.reject')}</Button><Button disabled={deciding} onClick={() => handleDecision(selectedItem.requestId, 'Approved')}>{t('admin.food.approve')}</Button></footer>{error && <p role="alert" className="su-input-error-text">{error}</p>}</aside></div>}
        </div>
    );
};

export default FoodModerationQueue;
