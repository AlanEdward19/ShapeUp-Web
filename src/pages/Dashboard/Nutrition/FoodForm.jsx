import React, { useState } from 'react';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

const FoodForm = ({
    food = null,
    initialBarcode = '',
    onSaved,
    onCancel,
}) => {
    const { createFood, createFoodOverride, setActiveFoodVersion } = useNutritionApi();
    const isEdit = Boolean(food?.id);
    const hasOverride = Boolean(food?.isPersonalOverride);

    const [name, setName] = useState(food?.name ?? '');
    const [barcode, setBarcode] = useState(food?.barcode ?? initialBarcode);
    const [macros, setMacros] = useState({
        kcal: food?.macrosPer100?.kcal?.toString() ?? '',
        proteinG: food?.macrosPer100?.proteinG?.toString() ?? '',
        carbG: food?.macrosPer100?.carbG?.toString() ?? '',
        fatG: food?.macrosPer100?.fatG?.toString() ?? '',
    });
    const [usePersonalVersion, setUsePersonalVersion] = useState(hasOverride);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleMacroChange = (field, value) => {
        setMacros((prev) => ({ ...prev, [field]: value }));
    };

    const buildMacroPayload = () => ({
        kcal: parseInt(macros.kcal, 10),
        proteinG: parseInt(macros.proteinG, 10),
        carbG: parseInt(macros.carbG, 10),
        fatG: parseInt(macros.fatG, 10),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        const macroPayload = buildMacroPayload();
        if (Object.values(macroPayload).some((v) => Number.isNaN(v) || v < 0)) {
            setError('Preencha todos os macros com valores válidos');
            return;
        }

        setSaving(true);
        try {
            let saved;
            if (isEdit) {
                saved = await createFoodOverride(food.id, {
                    macrosPer100: macroPayload,
                    microsPer100: food.microsPer100 ?? null,
                });
            } else {
                saved = await createFood({
                    name: name.trim(),
                    barcode: barcode.trim() || null,
                    macrosPer100: macroPayload,
                });
            }
            onSaved?.(saved);
        } catch (err) {
            setError(err.message || 'Falha ao salvar alimento');
        } finally {
            setSaving(false);
        }
    };

    const handleVersionToggle = async () => {
        if (!isEdit) return;
        const nextUsePersonal = !usePersonalVersion;
        setSaving(true);
        try {
            const updated = await setActiveFoodVersion(food.id, {
                usePersonalOverride: nextUsePersonal,
            });
            setUsePersonalVersion(updated.isPersonalOverride);
            onSaved?.(updated);
        } catch (err) {
            setError(err.message || 'Falha ao alternar versão');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card data-testid="food-form">
            <h3 className="su-section-title su-mb-4">
                {isEdit ? 'Editar alimento' : 'Cadastrar alimento'}
            </h3>

            {isEdit && (
                <div className="su-mb-4" data-testid="version-flag">
                    <span
                        className={usePersonalVersion ? 'su-warning-text' : 'su-primary-text'}
                        style={{ fontWeight: 600, marginRight: '0.75rem' }}
                    >
                        {usePersonalVersion ? 'Sua versão' : 'Versão pública'}
                    </span>
                    {hasOverride && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleVersionToggle}
                            disabled={saving}
                            data-testid="version-toggle"
                        >
                            {usePersonalVersion ? 'Usar versão pública' : 'Usar sua versão'}
                        </Button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="food-name-input"
                />
                <Input
                    label="Código de barras (opcional)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isEdit}
                    data-testid="food-barcode-input"
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <Input
                        label="Kcal / 100g"
                        type="number"
                        value={macros.kcal}
                        onChange={(e) => handleMacroChange('kcal', e.target.value)}
                        data-testid="food-kcal-input"
                    />
                    <Input
                        label="Proteína (g)"
                        type="number"
                        value={macros.proteinG}
                        onChange={(e) => handleMacroChange('proteinG', e.target.value)}
                        data-testid="food-protein-input"
                    />
                    <Input
                        label="Carboidrato (g)"
                        type="number"
                        value={macros.carbG}
                        onChange={(e) => handleMacroChange('carbG', e.target.value)}
                        data-testid="food-carb-input"
                    />
                    <Input
                        label="Gordura (g)"
                        type="number"
                        value={macros.fatG}
                        onChange={(e) => handleMacroChange('fatG', e.target.value)}
                        data-testid="food-fat-input"
                    />
                </div>

                {error && (
                    <p className="su-input-error-text su-mb-4" role="alert">{error}</p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <Button type="submit" disabled={saving} data-testid="food-save-btn">
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
};

export default FoodForm;
