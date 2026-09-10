import React, { useState } from 'react';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';

const ACTIVITY_LEVELS = [
    { value: 'Sedentary', label: 'Sedentário' },
    { value: 'LightlyActive', label: 'Levemente ativo' },
    { value: 'ModeratelyActive', label: 'Moderadamente ativo' },
    { value: 'VeryActive', label: 'Muito ativo' },
    { value: 'ExtraActive', label: 'Extremamente ativo' },
];

const GoalOnboarding = () => {
    const { completeOnboarding, setManualGoal } = useNutritionApi();
    const [mode, setMode] = useState('onboarding');
    const [heightCm, setHeightCm] = useState('');
    const [age, setAge] = useState('');
    const [biologicalSex, setBiologicalSex] = useState('Male');
    const [activityLevel, setActivityLevel] = useState('ModeratelyActive');
    const [manualGoal, setManualGoalState] = useState({ kcal: '', proteinG: '', carbG: '', fatG: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOnboarding = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const profile = await completeOnboarding({
                heightCm: parseInt(heightCm, 10),
                age: parseInt(age, 10),
                biologicalSex,
                activityLevel,
            });
            setResult(profile);
        } catch (err) {
            setError(err.message || 'Falha no onboarding');
        } finally {
            setLoading(false);
        }
    };

    const handleManualGoal = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const profile = await setManualGoal({
                goal: {
                    kcal: parseInt(manualGoal.kcal, 10),
                    proteinG: parseInt(manualGoal.proteinG, 10),
                    carbG: parseInt(manualGoal.carbG, 10),
                    fatG: parseInt(manualGoal.fatG, 10),
                },
            });
            setResult(profile);
        } catch (err) {
            setError(err.message || 'Falha ao salvar meta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <h1 className="su-page-title su-mb-6">Meta nutricional</h1>

            <div className="su-mb-4" style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                    variant={mode === 'onboarding' ? 'primary' : 'secondary'}
                    onClick={() => setMode('onboarding')}
                    data-testid="mode-onboarding-btn"
                >
                    Calcular por TDEE
                </Button>
                <Button
                    variant={mode === 'manual' ? 'primary' : 'secondary'}
                    onClick={() => setMode('manual')}
                    data-testid="mode-manual-btn"
                >
                    Meta manual
                </Button>
            </div>

            {mode === 'onboarding' ? (
                <Card data-testid="onboarding-form">
                    <h3 className="su-section-title su-mb-4">Onboarding TDEE</h3>
                    <form onSubmit={handleOnboarding}>
                        <Input
                            label="Altura (cm)"
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            data-testid="height-input"
                        />
                        <Input
                            label="Idade"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            data-testid="age-input"
                        />
                        <div className="su-input-group su-mb-4">
                            <label className="su-input-label">Sexo biológico</label>
                            <select
                                className="su-input"
                                value={biologicalSex}
                                onChange={(e) => setBiologicalSex(e.target.value)}
                                data-testid="sex-select"
                            >
                                <option value="Male">Masculino</option>
                                <option value="Female">Feminino</option>
                            </select>
                        </div>
                        <div className="su-input-group su-mb-4">
                            <label className="su-input-label">Nível de atividade</label>
                            <select
                                className="su-input"
                                value={activityLevel}
                                onChange={(e) => setActivityLevel(e.target.value)}
                                data-testid="activity-select"
                            >
                                {ACTIVITY_LEVELS.map((level) => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="su-input-error-text" role="alert">{error}</p>}
                        <Button type="submit" disabled={loading} data-testid="onboarding-submit-btn">
                            {loading ? 'Calculando...' : 'Calcular meta'}
                        </Button>
                    </form>
                </Card>
            ) : (
                <Card data-testid="manual-goal-form">
                    <h3 className="su-section-title su-mb-4">Meta manual</h3>
                    <form onSubmit={handleManualGoal}>
                        <Input label="Kcal" type="number" value={manualGoal.kcal} onChange={(e) => setManualGoalState((p) => ({ ...p, kcal: e.target.value }))} data-testid="manual-kcal-input" />
                        <Input label="Proteína (g)" type="number" value={manualGoal.proteinG} onChange={(e) => setManualGoalState((p) => ({ ...p, proteinG: e.target.value }))} data-testid="manual-protein-input" />
                        <Input label="Carboidrato (g)" type="number" value={manualGoal.carbG} onChange={(e) => setManualGoalState((p) => ({ ...p, carbG: e.target.value }))} data-testid="manual-carb-input" />
                        <Input label="Gordura (g)" type="number" value={manualGoal.fatG} onChange={(e) => setManualGoalState((p) => ({ ...p, fatG: e.target.value }))} data-testid="manual-fat-input" />
                        {error && <p className="su-input-error-text" role="alert">{error}</p>}
                        <Button type="submit" disabled={loading} data-testid="manual-submit-btn">
                            {loading ? 'Salvando...' : 'Salvar meta'}
                        </Button>
                    </form>
                </Card>
            )}

            {result?.activeGoal && (
                <Card className="su-mt-4" data-testid="goal-result">
                    <h3 className="su-section-title su-mb-4">Meta ativa</h3>
                    <p>
                        {result.activeGoal.kcal} kcal · P {result.activeGoal.proteinG}g ·
                        C {result.activeGoal.carbG}g · G {result.activeGoal.fatG}g
                    </p>
                </Card>
            )}
        </div>
    );
};

export default GoalOnboarding;
