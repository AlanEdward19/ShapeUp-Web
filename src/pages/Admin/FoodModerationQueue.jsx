import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';

const MacroDiff = ({ label, publicVal, proposedVal }) => (
    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        <strong>{label}:</strong> {publicVal} → <span className="su-primary-text">{proposedVal}</span>
    </div>
);

const FoodModerationQueue = () => {
    const { getPendingModerations, decideModeration } = useNutritionApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadQueue = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getPendingModerations();
            setItems(response?.items ?? []);
        } catch (err) {
            setError(err.message || 'Falha ao carregar fila');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [getPendingModerations]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const handleDecision = async (requestId, decision) => {
        try {
            await decideModeration(requestId, decision);
            setItems((prev) => prev.filter((item) => item.requestId !== requestId));
        } catch (err) {
            setError(err.message || `Falha ao ${decision === 'Approved' ? 'aprovar' : 'recusar'}`);
        }
    };

    return (
        <div>
            <h1 className="su-page-title su-mb-6">Triagem de alimentos</h1>

            {error && <p className="su-input-error-text su-mb-4" role="alert">{error}</p>}

            {loading ? (
                <p className="su-text-muted">Carregando fila...</p>
            ) : items.length === 0 ? (
                <Card data-testid="empty-queue">
                    <p className="su-text-muted" style={{ margin: 0 }}>Nenhuma edição pendente.</p>
                </Card>
            ) : (
                items.map((item) => (
                    <Card key={item.requestId} className="su-mb-4" data-testid={`moderation-${item.requestId}`}>
                        <h3 className="su-section-title">{item.foodName}</h3>
                        <p className="su-text-muted" style={{ fontSize: '0.85rem' }}>
                            Solicitado por usuário #{item.requestedByUserId} · {new Date(item.createdAtUtc).toLocaleString()}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }} data-testid={`diff-${item.requestId}`}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem' }}>Público</h4>
                                <MacroDiff label="Kcal" publicVal={item.publicMacros.kcal} proposedVal={item.proposedMacros.kcal} />
                                <MacroDiff label="Proteína" publicVal={item.publicMacros.proteinG} proposedVal={item.proposedMacros.proteinG} />
                                <MacroDiff label="Carb" publicVal={item.publicMacros.carbG} proposedVal={item.proposedMacros.carbG} />
                                <MacroDiff label="Gordura" publicVal={item.publicMacros.fatG} proposedVal={item.proposedMacros.fatG} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button
                                onClick={() => handleDecision(item.requestId, 'Approved')}
                                data-testid={`approve-${item.requestId}`}
                            >
                                Aprovar
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleDecision(item.requestId, 'Rejected')}
                                data-testid={`reject-${item.requestId}`}
                            >
                                Recusar
                            </Button>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

export default FoodModerationQueue;
