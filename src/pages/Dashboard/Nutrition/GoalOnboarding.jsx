import React, { useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import NutritionNav from './NutritionNav';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const ACTIVITY_LEVELS = [
    'Sedentary',
    'LightlyActive',
    'ModeratelyActive',
    'VeryActive',
    'ExtraActive',
];

const GoalOnboarding = () => {
    const { t } = useLanguage();
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
            setError(err.message || t('nutrition.goal.error.onboard'));
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
            setError(err.message || t('nutrition.goal.error.save'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-nutrition-page">
            <NutritionNav />
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.goal.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.goal.title')}</h1>
                </div>
            </header>

            <div className="su-mode-switch">
                <Button
                    variant={mode === 'onboarding' ? 'primary' : 'secondary'}
                    onClick={() => setMode('onboarding')}
                    data-testid="mode-onboarding-btn"
                >
                    {t('nutrition.goal.tdee')}
                </Button>
                <Button
                    variant={mode === 'manual' ? 'primary' : 'secondary'}
                    onClick={() => setMode('manual')}
                    data-testid="mode-manual-btn"
                >
                    {t('nutrition.goal.manual')}
                </Button>
            </div>

            {mode === 'onboarding' ? (
                <section className="su-journal-sheet" data-testid="onboarding-form">
                    <h3 className="su-ledger-heading">{t('nutrition.goal.tdee_heading')}</h3>
                    <form onSubmit={handleOnboarding}>
                        <Input
                            label={t('nutrition.goal.height')}
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            data-testid="height-input"
                        />
                        <Input
                            label={t('nutrition.goal.age')}
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            data-testid="age-input"
                        />
                        <div className="su-input-group su-mb-4">
                            <label className="su-input-label">{t('nutrition.goal.sex')}</label>
                            <select
                                className="su-input"
                                value={biologicalSex}
                                onChange={(e) => setBiologicalSex(e.target.value)}
                                data-testid="sex-select"
                            >
                                <option value="Male">{t('nutrition.goal.sex.male')}</option>
                                <option value="Female">{t('nutrition.goal.sex.female')}</option>
                            </select>
                        </div>
                        <div className="su-input-group su-mb-4">
                            <label className="su-input-label">{t('nutrition.goal.activity')}</label>
                            <select
                                className="su-input"
                                value={activityLevel}
                                onChange={(e) => setActivityLevel(e.target.value)}
                                data-testid="activity-select"
                            >
                                {ACTIVITY_LEVELS.map((level) => (
                                    <option key={level} value={level}>{t(`nutrition.goal.activity.${level}`)}</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="su-input-error-text" role="alert">{error}</p>}
                        <Button type="submit" disabled={loading} data-testid="onboarding-submit-btn">
                            {loading ? t('nutrition.goal.calculating') : t('nutrition.goal.calculate')}
                        </Button>
                    </form>
                </section>
            ) : (
                <section className="su-journal-sheet" data-testid="manual-goal-form">
                    <h3 className="su-ledger-heading">{t('nutrition.goal.manual')}</h3>
                    <form onSubmit={handleManualGoal}>
                        <div className="su-macro-fields">
                            <Input label={t('nutrition.macro.kcal')} type="number" value={manualGoal.kcal} onChange={(e) => setManualGoalState((p) => ({ ...p, kcal: e.target.value }))} data-testid="manual-kcal-input" />
                            <Input label={t('nutrition.form.protein')} type="number" value={manualGoal.proteinG} onChange={(e) => setManualGoalState((p) => ({ ...p, proteinG: e.target.value }))} data-testid="manual-protein-input" />
                            <Input label={t('nutrition.form.carb')} type="number" value={manualGoal.carbG} onChange={(e) => setManualGoalState((p) => ({ ...p, carbG: e.target.value }))} data-testid="manual-carb-input" />
                            <Input label={t('nutrition.form.fat')} type="number" value={manualGoal.fatG} onChange={(e) => setManualGoalState((p) => ({ ...p, fatG: e.target.value }))} data-testid="manual-fat-input" />
                        </div>
                        {error && <p className="su-input-error-text" role="alert">{error}</p>}
                        <Button type="submit" disabled={loading} data-testid="manual-submit-btn">
                            {loading ? t('nutrition.form.saving') : t('nutrition.goal.save')}
                        </Button>
                    </form>
                </section>
            )}

            {result?.activeGoal && (
                <section className="su-journal-sheet" data-testid="goal-result">
                    <h3 className="su-ledger-heading">{t('nutrition.goal.active')}</h3>
                    <p>
                        {result.activeGoal.kcal} kcal · P {result.activeGoal.proteinG}g ·
                        C {result.activeGoal.carbG}g · G {result.activeGoal.fatG}g
                    </p>
                </section>
            )}
        </div>
    );
};

export default GoalOnboarding;
