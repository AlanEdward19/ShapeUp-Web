import React, { useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const FoodForm = ({
    food = null,
    initialBarcode = '',
    onSaved,
    onCancel,
}) => {
    const { t } = useLanguage();
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
            setError(t('nutrition.form.error.name'));
            return;
        }

        const macroPayload = buildMacroPayload();
        if (Object.values(macroPayload).some((v) => Number.isNaN(v) || v < 0)) {
            setError(t('nutrition.form.error.macros'));
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
            setError(err.message || t('nutrition.form.error.save'));
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
            setError(err.message || t('nutrition.form.error.version'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="su-journal-sheet" data-testid="food-form">
            <h3 className="su-ledger-heading">
                {isEdit ? t('nutrition.form.edit') : t('nutrition.form.create')}
            </h3>

            {isEdit && (
                <div className="su-mb-4 su-version-flag" data-testid="version-flag">
                    <span
                        className={usePersonalVersion ? 'su-warning-text' : 'su-primary-text'}
                        style={{ fontWeight: 600, marginRight: '0.75rem' }}
                    >
                        {usePersonalVersion ? t('nutrition.form.personal') : t('nutrition.form.public')}
                    </span>
                    {hasOverride && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleVersionToggle}
                            disabled={saving}
                            data-testid="version-toggle"
                        >
                            {usePersonalVersion ? t('nutrition.form.use_public') : t('nutrition.form.use_personal')}
                        </Button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    label={t('nutrition.form.name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="food-name-input"
                />
                <Input
                    label={t('nutrition.form.barcode')}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isEdit}
                    data-testid="food-barcode-input"
                />
                <div className="su-macro-fields">
                    <Input
                        label={t('nutrition.form.kcal')}
                        type="number"
                        value={macros.kcal}
                        onChange={(e) => handleMacroChange('kcal', e.target.value)}
                        data-testid="food-kcal-input"
                    />
                    <Input
                        label={t('nutrition.form.protein')}
                        type="number"
                        value={macros.proteinG}
                        onChange={(e) => handleMacroChange('proteinG', e.target.value)}
                        data-testid="food-protein-input"
                    />
                    <Input
                        label={t('nutrition.form.carb')}
                        type="number"
                        value={macros.carbG}
                        onChange={(e) => handleMacroChange('carbG', e.target.value)}
                        data-testid="food-carb-input"
                    />
                    <Input
                        label={t('nutrition.form.fat')}
                        type="number"
                        value={macros.fatG}
                        onChange={(e) => handleMacroChange('fatG', e.target.value)}
                        data-testid="food-fat-input"
                    />
                </div>

                {error && (
                    <p className="su-input-error-text su-mb-4" role="alert">{error}</p>
                )}

                <div className="su-form-actions" style={{ marginTop: '1rem' }}>
                    <Button type="submit" disabled={saving} data-testid="food-save-btn">
                        {saving ? t('nutrition.form.saving') : t('nutrition.form.save')}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            {t('nutrition.form.cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </section>
    );
};

export default FoodForm;
