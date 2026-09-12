import React, { useState, useCallback } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import FoodForm from './FoodForm';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import { supportsBarcodeDetector } from './nutritionUtils';
import './Nutrition.css';

const FoodSearch = () => {
    const { t } = useLanguage();
    const { searchFoods, getFoodByBarcode } = useNutritionApi();
    const [query, setQuery] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createBarcode, setCreateBarcode] = useState('');
    const [error, setError] = useState('');

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        setSelectedFood(null);
        setShowCreateForm(false);
        try {
            const response = await searchFoods(query.trim());
            const items = response?.items ?? response ?? [];
            setResults(Array.isArray(items) ? items : []);
            setSearched(true);
        } catch (err) {
            setError(err.message || t('nutrition.foods.error.search'));
            setResults([]);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    }, [query, searchFoods, t]);

    const handleBarcodeLookup = useCallback(async (code) => {
        const trimmed = code?.trim();
        if (!trimmed) return;
        setLoading(true);
        setError('');
        setSelectedFood(null);
        setShowCreateForm(false);
        try {
            const food = await getFoodByBarcode(trimmed);
            setResults([food]);
            setSearched(true);
        } catch (err) {
            if (err.status === 404 || err.message?.includes('404') || err.message?.toLowerCase()?.includes('not found')) {
                setResults([]);
                setSearched(true);
                setCreateBarcode(trimmed);
                setShowCreateForm(true);
            } else {
                setError(err.message || t('nutrition.foods.error.barcode'));
            }
        } finally {
            setLoading(false);
        }
    }, [getFoodByBarcode, t]);

    const handleScanBarcode = async () => {
        if (!supportsBarcodeDetector()) return;
        setError('');
        try {
            const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            const codes = await detector.detect(video);
            stream.getTracks().forEach((t) => t.stop());

            if (codes.length > 0) {
                await handleBarcodeLookup(codes[0].rawValue);
            } else {
                setError(t('nutrition.foods.error.none'));
            }
        } catch (err) {
            setError(err.message || t('nutrition.foods.error.scan'));
        }
    };

    const handleFoodSaved = (food) => {
        setSelectedFood(food);
        setShowCreateForm(false);
        setResults([food]);
        setSearched(true);
    };

    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.foods.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.foods.title')}</h1>
                </div>
            </header>

            <section className="su-journal-sheet">
                <div className="su-search-row">
                    <div>
                        <Input
                            label={t('nutrition.foods.search_label')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            data-testid="food-search-input"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading || !query.trim()} data-testid="food-search-btn">
                        {t('nutrition.foods.search')}
                    </Button>
                </div>

                <div className="su-barcode-row" style={{ marginTop: '1rem' }} data-testid="barcode-section">
                    {supportsBarcodeDetector() ? (
                        <Button
                            variant="secondary"
                            onClick={handleScanBarcode}
                            disabled={loading}
                            data-testid="barcode-scan-btn"
                        >
                            {t('nutrition.foods.scan')}
                        </Button>
                    ) : (
                        <>
                            <div>
                                <Input
                                    label={t('nutrition.foods.barcode_label')}
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    data-testid="barcode-manual-input"
                                />
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => handleBarcodeLookup(barcodeInput)}
                                disabled={loading || !barcodeInput.trim()}
                                data-testid="barcode-manual-btn"
                            >
                                {t('nutrition.foods.barcode_btn')}
                            </Button>
                        </>
                    )}
                </div>

                {error && <p className="su-input-error-text su-mt-4" role="alert">{error}</p>}
            </section>

            {showCreateForm && (
                <FoodForm
                    initialBarcode={createBarcode}
                    onSaved={handleFoodSaved}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {selectedFood && !showCreateForm && (
                <FoodForm
                    food={selectedFood}
                    onSaved={handleFoodSaved}
                    onCancel={() => setSelectedFood(null)}
                />
            )}

            {!selectedFood && !showCreateForm && searched && (
                <section className="su-journal-sheet" data-testid="search-results">
                    {loading ? (
                        <p className="su-text-muted">{t('nutrition.foods.searching')}</p>
                    ) : results.length === 0 ? (
                        <p className="su-text-muted su-empty-ledger" data-testid="empty-state">
                            {t('nutrition.foods.empty')}
                        </p>
                    ) : (
                        <ul className="su-food-index">
                            {results.map((food) => (
                                <li key={food.id} className="su-food-index-item">
                                    <button
                                        type="button"
                                        className="su-food-index-btn"
                                        onClick={() => setSelectedFood(food)}
                                        data-testid={`food-result-${food.id}`}
                                    >
                                        <strong>{food.name}</strong>
                                        {food.isPersonalOverride && (
                                            <span className="su-warning-text" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                                ({t('nutrition.diary.override')})
                                            </span>
                                        )}
                                        <span className="su-text-muted su-food-kcal">
                                            {t('nutrition.foods.kcal100', { n: food.macrosPer100?.kcal })}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
};

export default FoodSearch;
