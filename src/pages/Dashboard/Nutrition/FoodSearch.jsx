import React, { useState, useCallback } from 'react';
import { Search, ScanBarcode } from 'lucide-react';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import FoodForm from './FoodForm';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

export const supportsBarcodeDetector = () =>
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

const FoodSearch = () => {
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
            setError(err.message || 'Falha na busca');
            setResults([]);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    }, [query, searchFoods]);

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
                setError(err.message || 'Falha na busca por código de barras');
            }
        } finally {
            setLoading(false);
        }
    }, [getFoodByBarcode]);

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
                setError('Nenhum código detectado. Tente digitar manualmente.');
            }
        } catch (err) {
            setError(err.message || 'Falha ao ler código de barras');
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
            <h1 className="su-page-title su-mb-6">Buscar alimentos</h1>

            <Card className="su-mb-4">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Buscar por nome"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            data-testid="food-search-input"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading || !query.trim()} data-testid="food-search-btn">
                        <Search size={16} />
                        Buscar
                    </Button>
                </div>

                <div style={{ marginTop: '1rem' }} data-testid="barcode-section">
                    {supportsBarcodeDetector() ? (
                        <Button
                            variant="secondary"
                            onClick={handleScanBarcode}
                            disabled={loading}
                            data-testid="barcode-scan-btn"
                        >
                            <ScanBarcode size={16} />
                            Ler código de barras
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Código de barras (digitação manual)"
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
                                Buscar código
                            </Button>
                        </div>
                    )}
                </div>

                {error && <p className="su-input-error-text su-mt-4" role="alert">{error}</p>}
            </Card>

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
                <Card data-testid="search-results">
                    {loading ? (
                        <p className="su-text-muted">Buscando...</p>
                    ) : results.length === 0 ? (
                        <p className="su-text-muted" data-testid="empty-state">
                            Nenhum alimento encontrado. Tente outro termo ou cadastre um novo.
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {results.map((food) => (
                                <li key={food.id} style={{ marginBottom: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className="su-nav-link"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                                        onClick={() => setSelectedFood(food)}
                                        data-testid={`food-result-${food.id}`}
                                    >
                                        <strong>{food.name}</strong>
                                        {food.isPersonalOverride && (
                                            <span className="su-warning-text" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                                (sua versão)
                                            </span>
                                        )}
                                        <span className="su-text-muted" style={{ display: 'block', fontSize: '0.85rem' }}>
                                            {food.macrosPer100?.kcal} kcal / 100g
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
};

export default FoodSearch;
