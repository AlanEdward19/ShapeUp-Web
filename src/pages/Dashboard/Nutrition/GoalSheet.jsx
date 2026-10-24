import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Skeleton from '../../../components/Skeleton';
import { useNutritionApi } from '../../../hooks/api/useNutritionApi';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const ACTIVITY_LEVELS = ['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive', 'ExtraActive'];

const sheetCopy = {
    'pt-BR': {
        title: 'Suas metas',
        optional: 'Opcional — você pode ajustar quando quiser.',
        current: 'Meta atual',
        none: 'Ainda sem meta definida',
        done: 'Concluído',
        close: 'Fechar',
        water: 'Água (ml)',
        waterHint: 'Em branco mantém a meta de água atual.',
        lockedTitle: 'Meta definida pelo seu nutricionista',
        confirmTitle: 'Substituir sua meta atual?', confirmBody: 'A meta abaixo será trocada e o diário passa a usar os novos valores.', confirmTdee: 'Os novos valores serão calculados com seus dados (TDEE).', confirmCta: 'Substituir meta', back: 'Voltar', now: 'Novos valores',
    },
    en: {
        title: 'Your goals',
        optional: 'Optional — adjust it whenever you like.',
        current: 'Current goal',
        none: 'No goal set yet',
        done: 'Done',
        close: 'Close',
        water: 'Water (ml)',
        waterHint: 'Leave blank to keep the current water goal.',
        lockedTitle: 'Goal set by your nutritionist',
        confirmTitle: 'Replace your current goal?', confirmBody: 'The goal below will be replaced and the diary will use the new values.', confirmTdee: 'The new values will be calculated from your data (TDEE).', confirmCta: 'Replace goal', back: 'Back', now: 'New values',
    },
    es: {
        title: 'Tus metas',
        optional: 'Opcional — ajústala cuando quieras.',
        current: 'Meta actual',
        none: 'Aún sin meta definida',
        done: 'Listo',
        close: 'Cerrar',
        water: 'Agua (ml)',
        waterHint: 'En blanco mantiene la meta de agua actual.',
        lockedTitle: 'Meta definida por tu nutricionista',
        confirmTitle: '¿Reemplazar tu meta actual?', confirmBody: 'La meta de abajo será reemplazada y el diario usará los nuevos valores.', confirmTdee: 'Los nuevos valores se calcularán con tus datos (TDEE).', confirmCta: 'Reemplazar meta', back: 'Volver', now: 'Nuevos valores',
    },
};

const text = (value) => (value === undefined || value === null ? '' : String(value));

const GoalSummary = ({ goal }) => (
    <dl className="gs-summary" data-testid="goal-summary">
        <div><dt>kcal</dt><dd>{goal.kcal ?? '—'}</dd></div>
        <div><dt>P</dt><dd>{goal.proteinG ?? '—'}<small> g</small></dd></div>
        <div><dt>C</dt><dd>{goal.carbG ?? '—'}<small> g</small></dd></div>
        <div><dt>G</dt><dd>{goal.fatG ?? '—'}<small> g</small></dd></div>
        {goal.waterMl ? <div><dt>H₂O</dt><dd>{goal.waterMl}<small> ml</small></dd></div> : null}
    </dl>
);

/** Goal editor shown as a sheet over the diary. `locked` = a nutritionist owns the goal. */
const GoalSheet = ({ goal = null, locked = false, onClose = () => {}, onSaved = () => {} }) => {
    const { t, language } = useLanguage();
    const c = sheetCopy[language] || sheetCopy['pt-BR'];
    const { completeOnboarding, setManualGoal } = useNutritionApi();
    const [mode, setMode] = useState(goal ? 'manual' : 'onboarding');
    const [heightCm, setHeightCm] = useState('');
    const [age, setAge] = useState('');
    const [biologicalSex, setBiologicalSex] = useState('Male');
    const [activityLevel, setActivityLevel] = useState('ModeratelyActive');
    const [manualGoal, setManualGoalState] = useState({
        kcal: text(goal?.kcal),
        proteinG: text(goal?.proteinG),
        carbG: text(goal?.carbG),
        fatG: text(goal?.fatG),
        waterMl: text(goal?.waterMl),
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Replacing an existing goal needs an explicit yes; `pending` holds which form asked.
    const [pending, setPending] = useState(null);

    useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const finish = (profile) => {
        setResult(profile);
        onSaved(profile);
    };

    const ask = (kind) => (e) => {
        e.preventDefault();
        if (goal) setPending(kind);
        else (kind === 'onboarding' ? handleOnboarding : handleManualGoal)();
    };

    const confirmReplace = () => {
        const kind = pending;
        setPending(null);
        (kind === 'onboarding' ? handleOnboarding : handleManualGoal)();
    };

    const handleOnboarding = async () => {
        setError('');
        setLoading(true);
        try {
            finish(await completeOnboarding({
                heightCm: parseInt(heightCm, 10),
                age: parseInt(age, 10),
                biologicalSex,
                activityLevel,
            }));
        } catch (err) {
            setError(err.message || t('nutrition.goal.error.onboard'));
        } finally {
            setLoading(false);
        }
    };

    const handleManualGoal = async () => {
        setError('');
        setLoading(true);
        try {
            const next = {
                kcal: parseInt(manualGoal.kcal, 10),
                proteinG: parseInt(manualGoal.proteinG, 10),
                carbG: parseInt(manualGoal.carbG, 10),
                fatG: parseInt(manualGoal.fatG, 10),
            };
            // Empty keeps the stored water goal; 0 clears it.
            if (manualGoal.waterMl !== '') next.waterMl = parseInt(manualGoal.waterMl, 10);
            finish(await setManualGoal({ goal: next }));
        } catch (err) {
            setError(err.message || t('nutrition.goal.error.save'));
        } finally {
            setLoading(false);
        }
    };

    const setField = (key) => (e) => setManualGoalState((p) => ({ ...p, [key]: e.target.value }));
    const shown = result?.activeGoal ?? goal;

    return (
        <div className="gs-overlay" role="presentation" onClick={onClose} data-testid="goal-sheet">
            <div className="gs-sheet" role="dialog" aria-modal="true" aria-label={c.title} onClick={(e) => e.stopPropagation()}>
                <header className="gs-head">
                    <div>
                        <h2>{c.title}</h2>
                        <p>{locked ? c.lockedTitle : c.optional}</p>
                    </div>
                    <button type="button" className="gs-close" onClick={onClose} aria-label={c.close}>×</button>
                </header>

                {locked ? (
                    <>
                        <p role="status" className="gs-locked" data-testid="goal-locked">
                            <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                            {t('nutrition.goal.locked')}
                        </p>
                        {shown ? <GoalSummary goal={shown} /> : <p className="gs-muted">{c.none}</p>}
                    </>
                ) : pending ? (
                    <section className="gs-confirm" data-testid="goal-confirm">
                        <h3>{c.confirmTitle}</h3>
                        <p className="gs-muted">{c.confirmBody}</p>
                        <h4 className="gs-sub">{c.current}</h4>
                        <GoalSummary goal={goal} />
                        <h4 className="gs-sub">{c.now}</h4>
                        {pending === 'manual' ? (
                            <GoalSummary goal={{
                                kcal: manualGoal.kcal,
                                proteinG: manualGoal.proteinG,
                                carbG: manualGoal.carbG,
                                fatG: manualGoal.fatG,
                                waterMl: manualGoal.waterMl !== '' ? manualGoal.waterMl : goal.waterMl,
                            }} />
                        ) : (
                            <p className="gs-locked">{c.confirmTdee}</p>
                        )}
                        <div className="gs-actions">
                            <Button variant="secondary" onClick={() => setPending(null)} data-testid="goal-confirm-back">{c.back}</Button>
                            <Button onClick={confirmReplace} data-testid="goal-confirm-btn">{c.confirmCta}</Button>
                        </div>
                    </section>
                ) : result?.activeGoal ? (
                    <section data-testid="goal-result">
                        <h3 className="gs-sub">{t('nutrition.goal.active')}</h3>
                        <GoalSummary goal={result.activeGoal} />
                        <p className="gs-sr">
                            {result.activeGoal.kcal} kcal · P {result.activeGoal.proteinG}g · C {result.activeGoal.carbG}g · G {result.activeGoal.fatG}g
                            {result.activeGoal.waterMl ? ` · Água ${result.activeGoal.waterMl} ml` : ''}
                        </p>
                        <Button onClick={onClose} data-testid="goal-done-btn">{c.done}</Button>
                    </section>
                ) : (
                    <>
                        {shown && (
                            <div className="gs-current">
                                <h3 className="gs-sub">{c.current}</h3>
                                <GoalSummary goal={shown} />
                            </div>
                        )}

                        <div className="gs-switch" role="group">
                            <button type="button" aria-pressed={mode === 'onboarding'} onClick={() => setMode('onboarding')} data-testid="mode-onboarding-btn">
                                {t('nutrition.goal.tdee')}
                            </button>
                            <button type="button" aria-pressed={mode === 'manual'} onClick={() => setMode('manual')} data-testid="mode-manual-btn">
                                {t('nutrition.goal.manual')}
                            </button>
                        </div>

                        {loading ? (
                            <Skeleton variant="card" />
                        ) : mode === 'onboarding' ? (
                            <form className="gs-form" onSubmit={ask('onboarding')} data-testid="onboarding-form">
                                <Input label={t('nutrition.goal.height')} type="number" inputMode="numeric" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} data-testid="height-input" />
                                <Input label={t('nutrition.goal.age')} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} data-testid="age-input" />
                                <div className="su-input-group">
                                    <label className="su-input-label" htmlFor="gs-sex">{t('nutrition.goal.sex')}</label>
                                    <select id="gs-sex" className="su-input" value={biologicalSex} onChange={(e) => setBiologicalSex(e.target.value)} data-testid="sex-select">
                                        <option value="Male">{t('nutrition.goal.sex.male')}</option>
                                        <option value="Female">{t('nutrition.goal.sex.female')}</option>
                                    </select>
                                </div>
                                <div className="su-input-group">
                                    <label className="su-input-label" htmlFor="gs-activity">{t('nutrition.goal.activity')}</label>
                                    <select id="gs-activity" className="su-input" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} data-testid="activity-select">
                                        {ACTIVITY_LEVELS.map((level) => (
                                            <option key={level} value={level}>{t(`nutrition.goal.activity.${level}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                {error && <p className="su-input-error-text gs-wide" role="alert">{error}</p>}
                                <Button type="submit" className="gs-wide" disabled={loading} data-testid="onboarding-submit-btn">{t('nutrition.goal.calculate')}</Button>
                            </form>
                        ) : (
                            <form className="gs-form" onSubmit={ask('manual')} data-testid="manual-goal-form">
                                <Input label={t('nutrition.macro.kcal')} type="number" inputMode="numeric" value={manualGoal.kcal} onChange={setField('kcal')} data-testid="manual-kcal-input" />
                                <Input label={t('nutrition.form.protein')} type="number" inputMode="numeric" value={manualGoal.proteinG} onChange={setField('proteinG')} data-testid="manual-protein-input" />
                                <Input label={t('nutrition.form.carb')} type="number" inputMode="numeric" value={manualGoal.carbG} onChange={setField('carbG')} data-testid="manual-carb-input" />
                                <Input label={t('nutrition.form.fat')} type="number" inputMode="numeric" value={manualGoal.fatG} onChange={setField('fatG')} data-testid="manual-fat-input" />
                                <Input label={c.water} type="number" inputMode="numeric" min="0" max="10000" step="50" placeholder="2500" value={manualGoal.waterMl} onChange={setField('waterMl')} data-testid="manual-water-input" />
                                <p className="gs-muted gs-wide">{c.waterHint}</p>
                                {error && <p className="su-input-error-text gs-wide" role="alert">{error}</p>}
                                <Button type="submit" className="gs-wide" disabled={loading} data-testid="manual-submit-btn">{t('nutrition.goal.save')}</Button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GoalSheet;
