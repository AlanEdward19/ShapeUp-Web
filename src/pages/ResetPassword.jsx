import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const ResetPassword = () => {
    const { t } = useLanguage();
    const { confirmReset } = useAuth();
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get('oobCode');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('register.error.weak_password'));
            return;
        }

        if (password !== confirmPassword) {
            // Reusing a translation or hardcoding for standard logic
            setError('Senhas não coincidem / Passwords do not match');
            return;
        }

        if (!oobCode) {
            setError(t('reset.error.invalid_code'));
            return;
        }

        setLoading(true);

        try {
            await confirmReset(oobCode, password);
            setSuccess(true);
        } catch (err) {
            if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
                setError(t('reset.error.invalid_code'));
            } else {
                setError(t('reset.error.generic'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-bg-shape login-bg-shape-1"></div>
                <div className="login-bg-shape login-bg-shape-2"></div>

                <div className="login-content" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Card className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', display: 'inline-flex' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success, #10b981)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--text-main)' }}>{t('reset.success')}</h2>
                        <p className="su-text-muted" style={{ marginBottom: '2rem', lineHeight: '1.5' }}>
                            Você já pode fazer o login com sua nova senha.
                        </p>
                        <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                            <Button fullWidth>Ir para o Login</Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
    }

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
                    <h1 className="login-tagline">{t('reset.tagline')}</h1>
                </div>

                <Card className="login-card">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t('reset.title')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                {t('reset.desc')}
                            </p>
                        </div>

                        {!oobCode && (
                            <div style={{ backgroundColor: 'var(--danger-bg, rgba(239,68,68,0.1))', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--danger)' }}>
                                <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
                                    ⚠️ Nenhum código de recuperação encontrado na URL. Utilize o link enviado para o seu e-mail.
                                </p>
                            </div>
                        )}

                        <Input
                            id="password"
                            type="password"
                            label={t('reset.new_password')}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Input
                            id="confirmPassword"
                            type="password"
                            label={t('reset.confirm')}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.875rem', marginTop: '-0.25rem', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading || !oobCode}>
                            {loading ? t('reset.btn.loading') : t('reset.btn')}
                        </Button>
                        
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
