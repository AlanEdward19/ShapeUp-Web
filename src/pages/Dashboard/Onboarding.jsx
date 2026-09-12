import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import Input from '../../components/Input';

export default function Onboarding() {
    const { language, unitSystem, setUnitSystem, t } = useLanguage();
    const pt = language === 'pt-BR';
    const navigate = useNavigate();
    const { completeOnboarding } = useNutritionApi();
    const storageKey = `shapeup_setup_${localStorage.getItem('shapeup_user_id') || 'current'}`;
    const [preferences, setPreferences] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey)) || { goal: 'hypertrophy', frequency: '4', experience: 'intermediate', units: unitSystem }; }
        catch { return { goal: 'hypertrophy', frequency: '4', experience: 'intermediate', units: unitSystem }; }
    });
    const [step, setStep] = useState(0);
    const [calculateNutrition, setCalculateNutrition] = useState(false);
    const [nutrition, setNutrition] = useState(() => preferences.measurements || { heightCm: '', age: '', biologicalSex: 'Male', activityLevel: 'ModeratelyActive' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const steps = pt ? ['Metas & periodização', 'Nutrição & NEAT', 'Perfil do atleta', 'Workspace'] : ['Goals & periodization', 'Nutrition & routine', 'Athlete profile', 'Workspace'];
    const goals = pt ? [['hypertrophy', 'Hipertrofia & força máxima', 'Foco em sobrecarga progressiva, tensão mecânica contínua e acúmulo de volume ótimo.'], ['recomposition', 'Recomposição corporal', 'Equilíbrio de densidade muscular e composição corporal.'], ['conditioning', 'Condicionamento & potência', 'Organize sessões para evoluir sua capacidade física.'], ['health', 'Longevidade & saúde articular', 'Construa uma rotina consistente de atividade física.']] : [['hypertrophy', 'Hypertrophy & strength', 'Track load and training volume.'], ['recomposition', 'Body recomposition', 'Track training, nutrition and measurements.'], ['conditioning', 'Conditioning & power', 'Organize sessions and build fitness.'], ['health', 'Longevity & movement', 'Build a consistent activity routine.']];
    const update = (key, value) => setPreferences(previous => ({ ...previous, [key]: value }));
    const save = async () => {
        if (calculateNutrition && (!(Number(nutrition.heightCm) > 0) || !(Number(nutrition.age) > 0))) {
            setStep(1); setError(pt ? 'Informe altura e idade para configurar sua meta nutricional.' : 'Enter height and age to configure your nutrition goal.'); return;
        }
        setSaving(true); setError('');
        try {
            if (calculateNutrition) await completeOnboarding({ ...nutrition, heightCm: Number(nutrition.heightCm), age: Number(nutrition.age) });
            localStorage.setItem(storageKey, JSON.stringify({ ...preferences, measurements: nutrition }));
            setUnitSystem(preferences.units);
            navigate('/dashboard');
        } catch (err) { setError(err.message || (pt ? 'Não foi possível salvar. Tente novamente.' : 'Could not save. Try again.')); }
        finally { setSaving(false); }
    };
    return <section className="su-setup">
        <header className="su-setup-header"><span className="su-setup-label">ShapeUp · {pt ? 'Setup guiado' : 'Guided setup'}</span><nav aria-label={pt ? 'Etapas da configuração' : 'Setup steps'}>{steps.map((label, index) => <button type="button" key={label} onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined}><span>0{index + 1}</span>{label}</button>)}</nav><Link to="/dashboard">{pt ? 'Configurar depois' : 'Set up later'}</Link></header>
        <div className="su-setup-body"><aside className="su-setup-intro"><span className="su-nutrition-kicker">{pt ? 'Calibração de abertura' : 'Your starting point'}</span><h1 className="su-page-title">{pt ? 'Bem-vindo ao ShapeUp.' : 'Welcome to ShapeUp.'}</h1><p>{pt ? 'Vamos calibrar seu ponto de partida para estruturar o primeiro ciclo de treinamento com intensidade precisa.' : 'Set your preferences and start your routine. You can revisit them at any time.'}</p><div className="su-setup-emblem"><img src="/stitch/ryno.png" alt="Ryno, mascote ShapeUp" /></div><blockquote>{pt ? 'Personalize os parâmetros iniciais. Você ou seu treinador poderão ajustar tudo a qualquer momento no workspace.' : 'Every session is a step. Consistency builds progress.'}</blockquote></aside>
        <div className="su-setup-panel">
            {step === 0 && <><h2>{pt ? '1. Objetivo principal (próximos 90 dias)' : '1. Your main goal'}</h2><div className="su-setup-options">{goals.map(([value, label, description]) => <label key={value} className={preferences.goal === value ? 'is-selected' : ''}><input type="radio" name="setup-goal" value={value} checked={preferences.goal === value} onChange={() => update('goal', value)} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div><h2>{pt ? '2. Frequência de treino semanal' : '2. Weekly training frequency'}</h2><div className="su-setup-choice">{['2', '3', '4', '5', '6'].map(value => <button key={value} onClick={() => update('frequency', value)} aria-pressed={preferences.frequency === value}>{value} {pt ? 'dias' : 'days'}</button>)}</div><h2>{pt ? '3. Nível de experiência em musculação' : 'Your training experience'}</h2><div className="su-setup-options">{[['beginner', pt ? 'Iniciante' : 'Beginner'], ['intermediate', pt ? 'Intermediário' : 'Intermediate'], ['advanced', pt ? 'Avançado' : 'Advanced']].map(([value, label]) => <label key={value} className={preferences.experience === value ? 'is-selected' : ''}><input type="radio" name="experience" checked={preferences.experience === value} onChange={() => update('experience', value)} /><strong>{label}</strong></label>)}</div></>}
            {step === 1 && <><h2>{steps[1]}</h2><p className="su-text-muted">{pt ? 'Configure sua meta usando o cálculo nutricional disponível na plataforma ou deixe para depois.' : 'Set your goal with the nutrition calculation available in the platform, or do it later.'}</p><label className="su-setup-check"><input type="checkbox" checked={calculateNutrition} onChange={event => setCalculateNutrition(event.target.checked)} />{pt ? 'Configurar meta nutricional agora' : 'Set nutrition goal now'}</label>{calculateNutrition && <div className="su-setup-fields"><Input label={t('nutrition.goal.height')} type="number" min="1" value={nutrition.heightCm} onChange={event => setNutrition(previous => ({ ...previous, heightCm: event.target.value }))} /><Input label={t('nutrition.goal.age')} type="number" min="1" value={nutrition.age} onChange={event => setNutrition(previous => ({ ...previous, age: event.target.value }))} /><label>{t('nutrition.goal.sex')}<select className="su-input" value={nutrition.biologicalSex} onChange={event => setNutrition(previous => ({ ...previous, biologicalSex: event.target.value }))}><option value="Male">{t('nutrition.goal.sex.male')}</option><option value="Female">{t('nutrition.goal.sex.female')}</option></select></label><label>{t('nutrition.goal.activity')}<select className="su-input" value={nutrition.activityLevel} onChange={event => setNutrition(previous => ({ ...previous, activityLevel: event.target.value }))}>{['Sedentary','LightlyActive','ModeratelyActive','VeryActive','ExtraActive'].map(level => <option key={level} value={level}>{t(`nutrition.goal.activity.${level}`)}</option>)}</select></label></div>}</>}
            {step === 2 && <><h2>{pt ? 'Registro antropométrico' : 'Athlete measurements'}</h2><p className="su-text-muted">{pt ? 'Complete seus dados para personalizar o workspace.' : 'Complete your details to personalize your workspace.'}</p><div className="su-setup-fields"><Input label={t('nutrition.goal.height')} type="number" min="1" value={nutrition.heightCm} onChange={event => setNutrition(previous => ({ ...previous, heightCm: event.target.value }))} /><Input label={t('nutrition.goal.age')} type="number" min="1" value={nutrition.age} onChange={event => setNutrition(previous => ({ ...previous, age: event.target.value }))} /></div><h2>{pt ? 'Sistema de unidades' : 'Unit system'}</h2><div className="su-setup-choice"><button onClick={() => update('units', 'metric')} aria-pressed={preferences.units === 'metric'}>kg / cm</button><button onClick={() => update('units', 'imperial')} aria-pressed={preferences.units === 'imperial'}>lb / in</button></div></>}
            {step === 3 && <><h2>{pt ? 'Tudo pronto para começar' : 'Ready to get started'}</h2><div className="su-setup-summary"><Check size={24} /><h3>{goals.find(([value]) => value === preferences.goal)?.[1]}</h3><p>{preferences.frequency} {pt ? 'dias de treino por semana' : 'training days per week'} · {preferences.units === 'metric' ? 'kg / cm' : 'lb / in'}</p><p>{calculateNutrition ? (pt ? 'A meta nutricional será calculada ao concluir.' : 'Your nutrition goal will be calculated when you finish.') : (pt ? 'Você pode configurar sua nutrição depois no diário.' : 'You can set up nutrition later in your diary.')}</p></div><p className="su-text-muted">{pt ? 'Essas preferências organizam seu ponto de partida. Seus treinos são definidos na área de planos.' : 'These preferences define your starting point. Your workouts are managed in the training plans area.'}</p></>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            <footer className="su-setup-actions"><button className="su-btn su-btn-secondary" disabled={step === 0 || saving} onClick={() => setStep(value => value - 1)}>{pt ? 'Voltar' : 'Back'}</button>{step < 3 ? <button className="su-btn su-btn-primary" onClick={() => setStep(value => value + 1)}>{pt ? 'Continuar' : 'Continue'} <ArrowRight size={16} /></button> : <button className="su-btn su-btn-primary" disabled={saving} onClick={save}>{saving ? (pt ? 'Salvando…' : 'Saving…') : (pt ? 'Concluir configuração' : 'Finish setup')}</button>}</footer>
        </div></div>
    </section>;
}

