import React, { useEffect, useRef, useState } from 'react';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';

const copy = {
    'pt-BR': { label: 'Alimento', placeholder: 'Buscar alimento', none: 'Nenhum alimento encontrado', change: 'Trocar', kcal: 'kcal/100 g' },
    en: { label: 'Food', placeholder: 'Search for a food', none: 'No foods found', change: 'Change', kcal: 'kcal/100 g' },
    es: { label: 'Alimento', placeholder: 'Buscar alimento', none: 'No se encontraron alimentos', change: 'Cambiar', kcal: 'kcal/100 g' },
};

/** Search-as-you-type food selector: people pick a food by name, never by typing its id. */
const FoodPicker = ({ value, onSelect, testId }) => {
    const { language } = useLanguage();
    const text = copy[language] || copy['pt-BR'];
    const { searchFoods } = useNutritionApi();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const requestId = useRef(0);

    useEffect(() => {
        const term = query.trim();
        if (term.length < 2) {
            setResults([]);
            return undefined;
        }
        const current = ++requestId.current;
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await searchFoods(term, undefined, 8);
                if (requestId.current !== current) return;
                const items = response?.items ?? response ?? [];
                setResults(Array.isArray(items) ? items : []);
            } catch {
                if (requestId.current === current) setResults([]);
            } finally {
                if (requestId.current === current) setSearching(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query, searchFoods]);

    if (value?.foodId) {
        return (
            <div className="su-food-picker is-selected">
                <span className="su-input-label">{text.label}</span>
                <div className="su-food-picked">
                    <strong>{value.foodName || value.foodId}</strong>
                    <button type="button" onClick={() => { onSelect(null); setQuery(''); }}>{text.change}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="su-food-picker">
            <label className="su-input-label" htmlFor={testId}>{text.label}</label>
            <input
                id={testId}
                className="su-input"
                type="search"
                autoComplete="off"
                placeholder={text.placeholder}
                value={query}
                data-testid={testId}
                onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
            />
            {open && query.trim().length >= 2 && (
                <ul className="su-food-picker-list" role="listbox">
                    {results.map((food) => (
                        <li key={food.id}>
                            <button
                                type="button"
                                role="option"
                                aria-selected="false"
                                onClick={() => { onSelect({ foodId: String(food.id), foodName: food.name }); setOpen(false); }}
                            >
                                <strong>{food.name}</strong>
                                {food.macrosPer100?.kcal != null && <small>{food.macrosPer100.kcal} {text.kcal}</small>}
                            </button>
                        </li>
                    ))}
                    {!results.length && !searching && <li className="su-food-picker-empty">{text.none}</li>}
                </ul>
            )}
        </div>
    );
};

export default FoodPicker;
