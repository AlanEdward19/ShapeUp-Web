import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const SubstituteItemModal = ({ entry, date, onClose, onSubstituted }) => {
    const { t } = useLanguage();
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
                setError(err.message || t('nutrition.sub.error.load'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [date, entry.id, suggestSubstitutes, t]);

    const handleFreeSearch = useCallback(async () => {
        if (!freeSearch.trim()) return;
        try {
            const response = await searchFoods(freeSearch.trim());
            setFreeResults(response?.items ?? []);
        } catch (err) {
            setError(err.message || t('nutrition.sub.error.search'));
        }
    }, [freeSearch, searchFoods, t]);

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
            setError(err.message || t('nutrition.sub.error.save'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="su-substitute-overlay"
            data-testid="substitute-modal"
            onClick={onClose}
        >
            <div className="su-substitute-sheet" onClick={(e) => e.stopPropagation()}>
                <h3 className="su-ledger-heading">{t('nutrition.sub.title')}</h3>
                <p className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>
                    {t('nutrition.sub.hint')}
                </p>

                {loading ? (
                    <p className="su-text-muted">{t('nutrition.sub.loading')}</p>
                ) : (
                    <>
                        <h4>{t('nutrition.sub.suggestions')}</h4>
                        {suggestions.length === 0 ? (
                            <p className="su-text-muted su-mb-4">{t('nutrition.sub.empty')}</p>
                        ) : (
                            <ul className="su-sub-list" data-testid="suggestions-list">
                                {suggestions.map((s) => (
                                    <li key={s.foodId}>
                                        <button
                                            type="button"
                                            className="su-btn su-btn-secondary"
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

                        <h4>{t('nutrition.sub.free')}</h4>
                        <div className="su-search-row" style={{ marginBottom: '0.75rem' }}>
                            <Input
                                value={freeSearch}
                                onChange={(e) => setFreeSearch(e.target.value)}
                                placeholder={t('nutrition.sub.search_ph')}
                                data-testid="free-search-input"
                            />
                            <Button variant="secondary" onClick={handleFreeSearch} data-testid="free-search-btn">
                                {t('nutrition.foods.search')}
                            </Button>
                        </div>
                        {freeResults.length > 0 && (
                            <ul className="su-sub-list" data-testid="free-results-list">
                                {freeResults.map((f) => (
                                    <li key={f.id}>
                                        <button
                                            type="button"
                                            className="su-btn su-btn-secondary"
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
                            label={t('nutrition.sub.qty')}
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
                        {t('common.cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubstituteItemModal;
