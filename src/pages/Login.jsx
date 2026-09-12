import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import WorkspaceIntro from '../components/WorkspaceIntro';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';
import { useUserManagementApi } from '../hooks/api/useUserManagementApi';
import { validateEmail, validatePassword } from '../utils/formValidation';
import './Login.css';

const roleMapping = {
    'Trainer': 'professional',
    'GymOwner': 'gym',
    'IndependentClient': 'independent',
    'Client': 'client',
    'GymClient': 'client'
};

const Login = ({ renderView } = {}) => {
    const { t } = useLanguage();
    const { signIn, signInWithGoogle, persistSession, signOut } = useAuth();
    const { getMyUserRoles } = useGymManagementApi();
    const { getMe } = useUserManagementApi();
    const navigate = useNavigate();

    const [availableRoles, setAvailableRoles] = useState([]);
    const [tempUser, setTempUser] = useState(null);
    const [error, setError] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberSession, setRememberSession] = useState(true);

    const processRoles = async (credential) => {
        try {
            const [roles, userData] = await Promise.all([
                getMyUserRoles(),
                getMe().catch(err => {
                    console.warn("Muted error during /api/users/me:", err);
                    return null;
                })
            ]);

            if (userData) {
                let uid = userData.id || userData.userId || userData.uid || (typeof userData === 'number' ? userData : null);
                if (!uid && roles && roles.length > 0) {
                    uid = roles[0].userId;
                }

                if (uid) {
                    localStorage.setItem('shapeup_user_id', String(uid));
                } else {
                    console.warn("Could not find id string/number in /api/users/me payload:", userData);
                }
            } else if (roles && roles.length > 0 && roles[0].userId) {
                localStorage.setItem('shapeup_user_id', String(roles[0].userId));
            }

            if (!roles || roles.length === 0) {
                setError(t('login.error.no_roles'));
                setLoading(false);
                return;
            }

            if (roles.length === 1) {
                const mappedRole = roleMapping[roles[0].role] || 'client';
                persistSession(credential.user, credential.user.email, mappedRole);
                navigate('/dashboard');
            } else {
                setAvailableRoles(roles);
                setTempUser(credential.user);
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to fetch roles:", err);
            setError(t('login.error.api_error'));
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.currentTarget.elements.email.value.trim().toLowerCase();
        const password = e.currentTarget.elements.password.value;
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password, { min: 1 });
        if (emailErr || passErr) {
            setFieldError(t(emailErr || passErr));
            return;
        }

        setError('');
        setFieldError('');
        setLoading(true);
        try {
            const credential = await signIn(email, password, rememberSession);
            await processRoles(credential);
        } catch (err) {
            setError(getErrorMessage(err.code, t));
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const credential = await signInWithGoogle(rememberSession);
            await processRoles(credential);
        } catch (err) {
            setError(getErrorMessage(err.code, t));
            setLoading(false);
        }
    };

    const handlePersonaSelect = (roleObj, index) => {
        if (isTransitioning) return;

        setSelectedRoleIndex(index);
        setIsTransitioning(true);

        const mappedRole = roleMapping[roleObj.role] || 'client';
        persistSession(tempUser, tempUser.email, mappedRole);

        setTimeout(() => {
            navigate('/dashboard');
        }, 800);
    };

    if (renderView) return renderView({ availableRoles, handlePersonaSelect, handleSubmit, handleGoogleSignIn, error: error || fieldError, loading, rememberSession, setRememberSession, showPassword, setShowPassword });
    return (
        <div className={`login-container su-auth-login ${availableRoles.length > 0 ? 'is-selecting-persona' : ''} ${loading ? 'is-loading' : ''}`}>
            {loading && (
                <div className="login-loading-overlay">
                    <svg className="su-spinner overlay-spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                    </svg>
                </div>
            )}

            {availableRoles.length > 0 && (
                <div className={`persona-selection-wrapper ${isTransitioning ? 'transition-active' : ''}`}>
                    <h2 className={`persona-title-main ${isTransitioning ? 'faded' : ''}`}>
                        {t('login.persona.title')}
                    </h2>
                    <div className="persona-grid">
                        {availableRoles.map((roleObj, index) => {
                            let label = roleObj.role;
                            let icon = null;

                            if (roleObj.role === 'Trainer') {
                                label = t('login.role.trainer');
                                icon = (
                                    <svg viewBox="0 0 24 24" width="60" height="60" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="persona-icon-svg">
                                        <path d="M18 10h3v4h-3M3 10h3v4H3M6 8h4v8H6M14 8h4v8h-4M10 12h4"/>
                                    </svg>
                                );
                            } else if (roleObj.role === 'GymOwner') {
                                label = t('login.role.gym');
                                icon = (
                                    <svg viewBox="0 0 24 24" width="60" height="60" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="persona-icon-svg">
                                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                        <path d="M9 22v-4h6v4" />
                                        <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
                                    </svg>
                                );
                            } else {
                                label = roleObj.role === 'IndependentClient' ? t('login.role.independent') : t('login.role.client');
                                icon = (
                                    <svg viewBox="0 0 24 24" width="60" height="60" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="persona-icon-svg">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                );
                            }

                            const n = String(index + 1).padStart(2, '0');

    return (
                                <button
                                    type="button"
                                    className={`persona-card ${isTransitioning && selectedRoleIndex === index ? 'selected' : ''} ${isTransitioning && selectedRoleIndex !== index ? 'faded' : ''}`}
                                    key={index}
                                    onClick={() => handlePersonaSelect(roleObj, index)}
                                >
                                    <span className="persona-index">{n}</span>
                                    <span className="persona-name">{label}</span>
                                    <div className="persona-avatar">
                                        {icon}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className={`persona-cancel-btn ${isTransitioning ? 'faded' : ''}`}
                        onClick={async () => {
                            setAvailableRoles([]);
                            setTempUser(null);
                            await signOut();
                        }}
                    >
                        {t('login.persona.back')}
                    </button>
                </div>
            )}

            <header className="su-auth-header">
                <Link to="/" className="su-auth-logo">
                    <Logo className="login-logo-img" />
                    <span>ShapeUp</span>
                </Link>
                <Link to="/" className="su-auth-back">{t('login.back')}</Link>
            </header>

            <section className="su-auth-hero">
                <div className="su-auth-copy">
                    <h1 className="su-auth-title">{t('login.welcome')}</h1>
                    <p className="su-auth-subtitle">{t('login.tagline')}</p>

                </div>

                <div className="su-auth-form-wrap">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <Input
                            id="email"
                            type="email"
                            label={t('login.email')}
                            placeholder={t('login.email.placeholder')}
                            required
                        />

                        <div className="password-group">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                label={t('login.password')}
                                placeholder={t('login.password.placeholder')}
                                required
                                trailing={
                                    <button
                                        type="button"
                                        className="su-password-toggle"
                                        onClick={() => setShowPassword((open) => !open)}
                                        aria-label={showPassword ? t('login.password.hide') : t('login.password.show')}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? <EyeOff strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
                                    </button>
                                }
                            />
                            <div className="forgot-password-link">
                                <Link to="/forgot-password">{t('login.forgot')}</Link>
                            </div>
                        </div>

                        <label className="su-login-remember"><input type="checkbox" checked={rememberSession} onChange={event => setRememberSession(event.target.checked)} />Manter sessão ativa neste dispositivo</label>
                        {fieldError && (
                            <p role="alert" className="su-auth-alert">{fieldError}</p>
                        )}
                        {error && (
                            <p className="su-auth-alert">{error}</p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading}>
                            {loading ? t('login.btn.signing') : t('login.btn.signin')}
                        </Button>

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
                            {t('login.btn.google')}
                        </Button>
                    </form>
                    <div className="su-auth-cta-group">
                        <span className="login-footer-text">
                            {t('login.no_account')} <Link to="/register">{t('login.create_account')}</Link>
                        </span>
                    </div>

                </div>
                <WorkspaceIntro />
            </section>
        </div>
    );
};

const getErrorMessage = (code, t) => {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return t('login.error.credentials');
        case 'auth/too-many-requests':
            return t('login.error.too_many');
        case 'auth/user-disabled':
            return t('login.error.disabled');
        case 'auth/popup-closed-by-user':
            return t('login.error.google_cancel');
        default:
            return t('login.error.generic');
    }
};

export default Login;
