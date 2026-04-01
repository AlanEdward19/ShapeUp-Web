import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';
import './Login.css';

const Register = () => {
    const { t } = useLanguage();
    const { register, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { acceptTrainerClientInvite } = useGymManagementApi();

    const [selectedRole, setSelectedRole] = useState('independent');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteToken, setInviteToken] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const payloadStr = searchParams.get("payload");

        if (payloadStr) {
            setInviteToken(payloadStr);
            setSelectedRole('client');

            // Clean the URL visually
            const url = new URL(window.location);
            url.searchParams.delete("payload");
            window.history.replaceState({}, document.title, url.toString());
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const firstName = e.target.firstName.value.trim();
        const lastName = e.target.lastName.value.trim();
        const email = e.target.email.value.trim().toLowerCase();
        const password = e.target.password.value;

        setError('');
        setLoading(true);

        try {
            await register(email, password);

            if (inviteToken) {
                try {
                    // O backend faz toda a validação pelo payload
                    await acceptTrainerClientInvite({
                        payload: inviteToken
                    });
                } catch (acceptErr) {
                    console.error("Erro ao aceitar convite no backend:", acceptErr);
                }
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
            setError(getErrorMessage(err.code, t));
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
            setError(getErrorMessage(err.code, t));
        } finally {
            setLoading(false);
        }
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
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="10" fill="var(--primary)" />
                            <path d="M12 28L20 12L28 28H12Z" fill="white" />
                        </svg>
                        <span className="login-logo-text">ShapeUp</span>
                    </div>
                    <h1 className="login-tagline">{t('register.tagline')}</h1>
                </div>

                <Card className="login-card">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    id="firstName"
                                    type="text"
                                    label={t('register.first_name')}
                                    placeholder={t('register.first_name.placeholder')}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    id="lastName"
                                    type="text"
                                    label={t('register.last_name')}
                                    placeholder={t('register.last_name.placeholder')}
                                    required
                                />
                            </div>
                        </div>

                        <Input
                            id="email"
                            type="email"
                            label={t('login.email')}
                            placeholder={t('login.email.placeholder')}
                            required
                        />
                        <Input
                            id="password"
                            type="password"
                            label={t('login.password')}
                            placeholder={t('login.password.placeholder')}
                            required
                        />
                        <Input
                            id="birthDate"
                            type="date"
                            label={t('register.birth_date')}
                            required
                        />

                        {/* Role selection removed, defaulting to standard registration */}

                        {error && (
                            <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.875rem', marginTop: '-0.25rem', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? t('register.btn.creating') : t('register.btn.create')}
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
                            {t('register.btn.google')}
                        </Button>
                    </form>
                </Card>

                <p className="login-footer-text">
                    {t('register.already')} <Link to="/login">{t('register.signin')}</Link>
                </p>
            </div>
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
