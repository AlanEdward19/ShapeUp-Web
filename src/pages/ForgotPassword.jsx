import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Login.css'; // Reusing styles

const ForgotPassword = () => {
    const { t } = useLanguage();
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(t('forgot.success'));
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError(t('forgot.error.user_not_found'));
            } else {
                setError(t('forgot.error.generic'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-bg-shape login-bg-shape-1"></div>
            <div className="login-bg-shape login-bg-shape-2"></div>

            <div className="login-content">
                <div className="login-header">
                    <div className="login-logo">
                        <Logo className="login-logo-img" />
                        <span className="login-logo-text">ShapeUp</span>
                    </div>
                    <h1 className="login-tagline">{t('forgot.tagline')}</h1>
                </div>

                <Card className="login-card">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t('forgot.title')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                {t('forgot.desc')}
                            </p>
                        </div>

                        <Input
                            id="email"
                            type="email"
                            label={t('forgot.email')}
                            placeholder={t('forgot.email.ph')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && (
                            <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.875rem', marginTop: '-0.25rem', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}
                        {success && (
                            <p style={{ color: 'var(--success, #10b981)', fontSize: '0.875rem', marginTop: '-0.25rem', textAlign: 'center' }}>
                                {success}
                            </p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading || !email}>
                            {loading ? t('forgot.btn.sending') : t('forgot.btn')}
                        </Button>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                                ← {t('forgot.back')}
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
