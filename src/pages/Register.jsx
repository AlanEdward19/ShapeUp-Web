import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { enqueueMutation } from '../services/mutationQueue';
import { isHoneypotFilled, validateBirthDate, validateEmail, validatePassword, validateRequiredName } from '../utils/formValidation';
import './Login.css';

const Register = ({ renderView } = {}) => {
    const { t, language } = useLanguage();
    const { register, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState(() => { const role = new URLSearchParams(window.location.search).get('role'); return ['professional', 'gym', 'independent'].includes(role) ? role : 'professional'; });
    const [step, setStep] = useState(0);
    const [fullName, setFullName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const pt = language === 'pt-BR';
    const [errorKey, setError] = useState('');
    const error = errorKey ? t(errorKey) : '';
    const [loading, setLoading] = useState(false);
    const [inviteToken, setInviteToken] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const payloadStr = searchParams.get("payload");

        if (payloadStr) {
            setInviteToken(payloadStr);
            setSelectedRole('client');

            const url = new URL(window.location);
            url.searchParams.delete("payload");
            window.history.replaceState({}, document.title, url.toString());
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fields = e.currentTarget.elements;
        if (!inviteToken && step < 2) {
            const validation = step === 0
                ? validateRequiredName(fullName) || validateEmail(fields.email.value)
                : validatePassword(fields.password.value) || validatePassword(fields.confirmPassword.value);
            if (validation) { setError(validation); return; }
            if (step === 1 && fields.password.value !== fields.confirmPassword.value) { setError('form.password.mismatch'); return; }
            setError(''); setStep(step + 1); return;
        }
        if (fields.password.value !== fields.confirmPassword.value) { setError('form.password.mismatch'); return; }
        if (inviteToken && !acceptedTerms) { setError('form.terms.required'); return; }
        const firstName = fields.firstName.value.trim();
        const lastName = fields.lastName.value.trim();
        const email = fields.email.value.trim().toLowerCase();
        const password = fields.password.value;
        const birthDate = fields.birthDate.value;
        const honeypot = fields.company_url.value;

        if (isHoneypotFilled(honeypot)) {
            setError('form.spam');
            return;
        }

        const firstErr = validateRequiredName(firstName);
        const lastErr = validateRequiredName(lastName);
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        const birthErr = inviteToken ? null : validateBirthDate(birthDate);
        const firstFail = firstErr || lastErr || emailErr || passErr || birthErr;
        if (firstFail) {
            setError(firstFail);
            return;
        }

        setError('');
        setLoading(true);

        try {
            const registration = await register(email, password);
            localStorage.setItem(`shapeup_registration_${registration?.user?.uid || 'current'}`, JSON.stringify({ name: fullName.trim(), phone: fields.phone.value, role: selectedRole }));

            if (inviteToken) {
                enqueueMutation({
                    endpoint: '/api/gym-management/trainer-client-invites/accept',
                    method: 'POST',
                    body: { payload: inviteToken },
                });
            } else if (selectedRole === 'client') {
                const stored = localStorage.getItem('shapeup_clients');
                let clients = stored ? JSON.parse(stored) : [];

                const invitedIndex = clients.findIndex(c =>
                    c.email?.toLowerCase() === email && c.status === 'Invited'
                );

                if (invitedIndex !== -1) {
                    clients[invitedIndex].name = `${firstName} ${lastName}`;
                    clients[invitedIndex].status = 'Active';
                    clients[invitedIndex].lastCheckin = 'Just now';
                    clients[invitedIndex].email = email;
                } else {
                    const existingIndex = clients.findIndex(c => c.email?.toLowerCase() === email);
                    if (existingIndex !== -1) {
                        clients[existingIndex].name = `${firstName} ${lastName}`;
                    } else {
                        clients.push({
                            id: Date.now(),
                            name: `${firstName} ${lastName}`,
                            email,
                            activePlan: '-',
                            compliance: 0,
                            lastCheckin: 'Just now',
                            status: 'Active',
                        });
                    }
                }
                localStorage.setItem('shapeup_clients', JSON.stringify(clients));
            }

            localStorage.removeItem('shapeup_role');
            localStorage.removeItem('shapeup_client_id');

            navigate('/login');
        } catch (err) {
            setError(getErrorMessage(err.code, key => key));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle(selectedRole);
            navigate('/dashboard');
        } catch (err) {
            setError(getErrorMessage(err.code, key => key));
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'professional', label: pt ? 'Personal Trainer / Coach' : t('login.role.trainer') },
        { id: 'independent', label: pt ? 'Atleta / Aluno' : t('login.role.independent') },
        { id: 'gym', label: pt ? 'Gestor de Academia ou Studio' : t('login.role.gym') },
    ];

    if (renderView) return renderView({ selectedRole, setSelectedRole, step, setStep, fullName, setFullName, acceptedTerms, setAcceptedTerms, error, loading, inviteToken, handleSubmit, handleGoogleSignIn });
    return (
        <div className={`login-container su-auth-centered ${inviteToken ? 'su-auth-invitation' : 'su-registration-workspace'}`}>
            <header className="su-auth-header">
                <Link to="/" className="su-auth-logo">
                    <Logo className="login-logo-img" />
                    <span>ShapeUp</span>
                </Link>
                <Link to="/" className="su-auth-back">{t('login.back')}</Link>
            </header>

            <section className="su-auth-hero">
                <div className="su-auth-copy">
                    {!inviteToken && <ol className="su-register-progress" aria-label={pt ? "Etapas de cadastro" : "Registration steps"}>{(pt ? ["Perfil & identificação", "Credenciais", "Parâmetros"] : ["Profile & identity", "Credentials", "Preferences"]).map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={index <= step ? "is-active" : ""}><span>{index + 1}</span>{label}</li>)}</ol>}
                    {inviteToken && <div className="su-invitation-note"><span className="su-invitation-badge">Convite para acompanhamento</span><p>{language === 'pt-BR' ? 'Você está entrando por um convite. Complete seu cadastro para vincular seu perfil ao treinador.' : 'You are joining through an invitation. Complete your registration to connect with your coach.'}</p></div>}
                    <h1 className="su-auth-title">{inviteToken ? (language === 'pt-BR' ? 'Ativação de conta' : 'Activate your account') : (pt ? ['Como você pretende usar o ShapeUp?', 'Configure seu acesso', 'Últimos detalhes do seu perfil'][step] : ['How will you use ShapeUp?', 'Set up your access', 'Complete your profile'][step])}</h1>
                    <p className="su-auth-subtitle">{pt ? (inviteToken ? 'Defina suas credenciais para vincular seu perfil e acessar sua rotina.' : 'Configure seu ambiente de trabalho de acordo com seu papel de atuação.') : t('register.tagline')}</p>

                </div>

                <div className="su-auth-form-wrap">
                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="su-register-stage" hidden={!inviteToken && step !== 0}>
                        {!inviteToken && <fieldset className="su-register-roles"><legend className="su-visually-hidden">{language === 'pt-BR' ? 'Como você pretende usar o ShapeUp?' : 'How will you use ShapeUp?'}</legend>{roles.map(role => <label key={role.id} className={selectedRole === role.id ? 'is-selected' : ''}><input type="radio" name="profileRole" value={role.id} checked={selectedRole === role.id} onChange={() => setSelectedRole(role.id)} /><span><strong>{role.label}</strong><small>{role.id === 'professional' ? (language === 'pt-BR' ? 'Prescrição de treinos e acompanhamento de alunos.' : 'Training plans and athlete management.') : role.id === 'gym' ? (language === 'pt-BR' ? 'Gestão de equipe, alunos e operação.' : 'Manage staff, members and operations.') : (language === 'pt-BR' ? 'Seus treinos, nutrição e progresso.' : 'Your workouts, nutrition and progress.')}</small></span></label>)}</fieldset>}
                        <h2 className="su-registration-section-label">{pt ? 'Dados de identificação' : 'Identification'}</h2>
                        <Input id="fullName" label={pt ? 'Nome completo' : 'Full name'} placeholder={pt ? 'Seu nome completo' : 'Your full name'} value={fullName} onChange={event => setFullName(event.target.value)} required autoComplete="name" />
                        <input type="hidden" name="firstName" value={fullName.trim().split(/\s+/)[0] || ''} />
                        <input type="hidden" name="lastName" value={fullName.trim().split(/\s+/).slice(1).join(' ')} />
                        <Input
                            id="email"
                            type="email"
                            label={t('login.email')}
                            placeholder={t('login.email.placeholder')}
                            required
                        />
                        <Input id="phone" type="tel" label={pt ? 'Telefone / WhatsApp com DDD' : 'Phone number'} placeholder="(11) 98765-4321" autoComplete="tel" />
                        </div>
                        <div className={`su-register-stage ${inviteToken ? 'su-invitation-passwords' : ''}`} hidden={!inviteToken && step !== 1}>
                        <Input
                            id="password"
                            type="password"
                            label={t('login.password')}
                            placeholder={t('login.password.placeholder')}
                            required
                            minLength={8}
                        />
                        <Input id="confirmPassword" type="password" label={pt ? "Confirmar senha" : "Confirm password"} required minLength={8} autoComplete="new-password" />
                        </div>
                        <div className="su-visually-hidden" aria-hidden="true">
                            <label htmlFor="company_url">Company</label>
                            <input id="company_url" name="company_url" type="text" tabIndex={-1} autoComplete="off" />
                        </div>
                        <div className="su-register-stage" hidden={Boolean(inviteToken) || step !== 2}>
                        <Input
                            id="birthDate"
                            type="date"
                            label={t('register.birth_date')}
                            required
                        />

                        {!inviteToken && <p className="su-text-muted">{pt ? "Após criar a conta, você poderá definir seus objetivos, unidades e rotina no setup guiado." : "After creating your account, set your goals, units and routine in the guided setup."}</p>}
                        </div>
                        {inviteToken && <label className="su-invitation-terms"><input type="checkbox" checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} /> <span>Li e concordo com os <Link to="/terms">Termos de Uso</Link> e a <Link to="/privacy">Política de Privacidade</Link>.</span></label>}
                        {error && (
                            <p className="su-auth-alert">{error}</p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading}>
                            {loading ? t('register.btn.creating') : !inviteToken && step < 2 ? (pt ? 'Continuar configuração →' : 'Continue setup →') : inviteToken && pt ? 'Ativar conta e entrar →' : t('register.btn.create')}
                        </Button>

                        {!inviteToken && step > 0 && <Button type="button" variant="outline" fullWidth onClick={() => { setError(''); setStep(step - 1); }}>{pt ? "Voltar à etapa anterior" : "Back to previous step"}</Button>}
                        <div className="login-divider">
                            <span>{t('login.divider')}</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            className="btn-google"
                            disabled={loading}
                            onClick={handleGoogleSignIn}
                            icon={
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            }
                        >
                            {t('register.btn.google')}
                        </Button>
                    </form>
                    <div className="su-auth-cta-group">
                        <span className="login-footer-text">
                            {t('register.already')} <Link to="/login">{t('register.signin')}</Link>
                        </span>
                    </div>

                    <aside className="su-auth-ledger" aria-hidden="true">
                        <p className="su-auth-ledger-label">Cadastro</p>
                        <ol className="su-auth-ledger-list">
                            <li><span>Nome</span><b>01</b></li>
                            <li><span>Conta</span><b>02</b></li>
                            <li className="is-live"><span>Treinar</span><b>03</b></li>
                        </ol>
                    </aside>
                </div>
            </section>
        </div>
    );
};

const getErrorMessage = (code, t) => {
    switch (code) {
        case 'auth/email-already-in-use':
            return t('register.error.email_in_use');
        case 'auth/weak-password':
            return t('register.error.weak_password');
        case 'auth/invalid-email':
            return t('register.error.invalid_email');
        case 'auth/popup-closed-by-user':
            return t('register.error.google_cancel');
        default:
            return t('register.error.generic');
    }
};

export default Register;
