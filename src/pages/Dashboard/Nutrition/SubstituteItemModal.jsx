import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

const SubstituteItemModal = ({ entry, date, onClose, onSubstituted }) => {
    const { suggestSubstitutes, substituteDiaryItem, searchFoods } = useNutritionApi();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [freeSearch, setFreeSearch] = useState('');
    const [freeResults, setFreeResults] = useState([]);
    const [quantity, setQuantity] = useState(entry?.quantityGramsOrMl?.toString() ?? '100');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const response = await suggestSubstitutes(date, entry.id);
                setSuggestions(response?.suggestions ?? []);
            } catch (err) {
                setError(err.message || 'Falha ao carregar sugestões');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [date, entry.id, suggestSubstitutes]);

    const handleFreeSearch = useCallback(async () => {
        if (!freeSearch.trim()) return;
        try {
            const response = await searchFoods(freeSearch.trim());
            setFreeResults(response?.items ?? []);
        } catch (err) {
            setError(err.message || 'Falha na busca');
        }
    }, [freeSearch, searchFoods]);

    const handleSubstitute = async (foodId) => {
        setSubmitting(true);
        setError('');
        try {
            await substituteDiaryItem(entry.id, {
                date,
                replacementFoodId: foodId,
                quantityGramsOrMl: parseFloat(quantity),
            });
            onSubstituted?.();
        } catch (err) {
            setError(err.message || 'Falha ao substituir item');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="su-modal-overlay"
            data-testid="substitute-modal"
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', padding: '1rem' }}>
                <Card>
                    <h3 className="su-section-title su-mb-4">Substituir item</h3>
                    <p className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>
                        Substituição vale só para este dia — o cardápio salvo não será alterado.
                    </p>

                    {loading ? (
                        <p className="su-text-muted">Carregando sugestões...</p>
                    ) : (
                        <>
                            <h4 className="su-mb-2" style={{ fontSize: '0.9rem' }}>Sugestões</h4>
                            {suggestions.length === 0 ? (
                                <p className="su-text-muted su-mb-4">Nenhuma sugestão disponível.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }} data-testid="suggestions-list">
                                    {suggestions.map((s) => (
                                        <li key={s.foodId} style={{ marginBottom: '0.5rem' }}>
                                            <button
                                                type="button"
                                                className="su-btn su-btn-secondary"
                                                style={{ width: '100%', textAlign: 'left' }}
                                                onClick={() => handleSubstitute(s.foodId)}
                                                disabled={submitting}
                                                data-testid={`suggestion-${s.foodId}`}
                                            >
                                                {s.name} — {s.macrosPer100?.kcal} kcal/100g
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <h4 className="su-mb-2" style={{ fontSize: '0.9rem' }}>Busca livre</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Input
                                    value={freeSearch}
                                    onChange={(e) => setFreeSearch(e.target.value)}
                                    placeholder="Buscar alimento..."
                                    data-testid="free-search-input"
                                />
                                <Button variant="secondary" onClick={handleFreeSearch} data-testid="free-search-btn">
                                    Buscar
                                </Button>
                            </div>
                            {freeResults.length > 0 && (
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }} data-testid="free-results-list">
                                    {freeResults.map((f) => (
                                        <li key={f.id} style={{ marginBottom: '0.5rem' }}>
                                            <button
                                                type="button"
                                                className="su-btn su-btn-secondary"
                                                style={{ width: '100%', textAlign: 'left' }}
                                                onClick={() => handleSubstitute(f.id)}
                                                disabled={submitting}
                                                data-testid={`free-result-${f.id}`}
                                            >
                                                {f.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Input
                                label="Quantidade (g/ml)"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                data-testid="substitute-quantity-input"
                            />
                        </>
                    )}

                    {error && <p className="su-input-error-text" role="alert">{error}</p>}

                    <div style={{ marginTop: '1rem' }}>
                        <Button variant="secondary" onClick={onClose} data-testid="substitute-cancel-btn">
                            Cancelar
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SubstituteItemModal;
