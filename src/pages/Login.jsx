import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';
import './Login.css';

const roleMapping = {
    'Trainer': 'professional',
    'GymOwner': 'gym',
    'IndependentClient': 'independent',
    'Client': 'client',
    'GymClient': 'client'
};

const Login = () => {
    const { t } = useLanguage();
    const { signIn, signInWithGoogle, persistSession } = useAuth();
    const { getMyUserRoles } = useGymManagementApi();
    const navigate = useNavigate();

    const [availableRoles, setAvailableRoles] = useState([]);
    const [tempUser, setTempUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const processRoles = async (credential) => {
        try {
            const roles = await getMyUserRoles();
            if (!roles || roles.length === 0) {
                setError(t('login.error.no_roles') || "Nenhum perfil encontrado para este usuário.");
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
                setLoading(false); // Stop loading to show the persona selector
            }
        } catch (err) {
            console.error("Failed to fetch roles:", err);
            setError(t('login.error.api_error') || "Falha ao buscar perfis de usuário.");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value.trim().toLowerCase();
        const password = e.target.password.value;

        setError('');
        setLoading(true);
        try {
            const credential = await signIn(email, password);
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
            const credential = await signInWithGoogle();
            await processRoles(credential);
        } catch (err) {
            setError(getErrorMessage(err.code, t));
            setLoading(false);
        }
    };

    const handlePersonaSelect = (roleObj) => {
        const mappedRole = roleMapping[roleObj.role] || 'client';
        persistSession(tempUser, tempUser.email, mappedRole);
        navigate('/dashboard');
    };

    return (
        <div className="login-container">
            <div className="login-bg-shape login-bg-shape-1"></div>
            <div className="login-bg-shape login-bg-shape-2"></div>

            <div className="login-content">
                <Link to="/" className="su-back-to-home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    {t('login.back')}
                </Link>
                <div className="login-header">
                    <div className="login-logo">
                        <Logo className="login-logo-img" />
                        <span className="login-logo-text">ShapeUp</span>
                    </div>
                    <h1 className="login-tagline">{t('login.tagline')}</h1>
                </div>

                <Card className="login-card">
                    {availableRoles.length > 0 ? (
                        <div className="persona-selection">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                                Quem está acessando hoje?
                            </h2>
                            <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {availableRoles.map((roleObj, index) => {
                                    // Make sure we have a user-friendly label
                                    let label = roleObj.role;
                                    if (roleObj.role === 'Trainer') label = 'Profissional / Treinador';
                                    if (roleObj.role === 'GymOwner') label = 'Administrador da Academia';
                                    if (roleObj.role === 'Client' || roleObj.role === 'GymClient') label = 'Aluno / Cliente';
                                    if (roleObj.role === 'IndependentClient') label = 'Aluno Independente';

                                    return (
                                        <button 
                                            key={index}
                                            type="button" 
                                            className="role-opt" 
                                            onClick={() => handlePersonaSelect(roleObj)}
                                            style={{ padding: '1rem', width: '100%', justifyContent: 'center' }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button 
                                variant="outline" 
                                fullWidth 
                                style={{ marginTop: '2rem' }}
                                onClick={() => {
                                    setAvailableRoles([]);
                                    setTempUser(null);
                                    navigate('/login');
                                }}
                            >
                                {t('login.back')}
                            </Button>
                        </div>
                    ) : (
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
                                    type="password"
                                    label={t('login.password')}
                                    placeholder={t('login.password.placeholder')}
                                    required
                                />
                                <div className="forgot-password-link">
                                    <Link to="/forgot-password">{t('login.forgot')}</Link>
                                </div>
                            </div>

                            {error && (
                                <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.875rem', marginTop: '-0.25rem', textAlign: 'center' }}>
                                    {error}
                                </p>
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
                    )}
                </Card>

                <p className="login-footer-text">
                    {t('login.no_account')} <Link to="/register">{t('login.create_account')}</Link>
                </p>
            </div>
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
