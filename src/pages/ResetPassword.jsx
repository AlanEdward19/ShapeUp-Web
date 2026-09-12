import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
            setError(t('reset.match'));
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
                <header className="su-auth-header">
                    <Link to="/" className="su-auth-logo">
                        <Logo className="login-logo-img" />
                        <span>ShapeUp</span>
                    </Link>
                    <Link to="/login" className="su-auth-back">{t('forgot.back')}</Link>
                </header>

                <section className="su-auth-hero">
                    <div className="su-auth-copy">
                        <h1 className="su-auth-title">{t('reset.success')}</h1>
                        <p className="su-auth-subtitle">
                            {t('reset.ready')}
                        </p>
                        <div className="su-auth-cta-group">
                            <Link to="/login" className="su-auth-btn-primary">{t('reset.goto_login')}</Link>
                        </div>
                    </div>

                    <aside className="su-auth-ledger" aria-hidden="true">
                        <p className="su-auth-ledger-label">{t('reset.ledger.label')}</p>
                        <ol className="su-auth-ledger-list">
                            <li><span>{t('reset.ledger.password')}</span><b>Ok</b></li>
                            <li className="is-live"><span>{t('reset.ledger.login')}</span><b>{t('reset.ledger.now')}</b></li>
                        </ol>
                    </aside>
                </section>
            </div>
        );
    }

    return (
        <div className="login-container su-auth-centered">
            <header className="su-auth-header">
                <Link to="/" className="su-auth-logo">
                    <Logo className="login-logo-img" />
                    <span>ShapeUp</span>
                </Link>
                <Link to="/login" className="su-auth-back">{t('forgot.back')}</Link>
            </header>

            <section className="su-auth-hero">
                <div className="su-auth-copy">
                    <h1 className="su-auth-title">{t('reset.title')}</h1>
                    <p className="su-auth-subtitle">{t('reset.tagline')}</p>
                    <p className="su-auth-subtitle">{t('reset.desc')}</p>
                </div>

                <div className="su-auth-form-wrap">
                    <form className="login-form" onSubmit={handleSubmit}>
                        {!oobCode && (
                            <div className="su-auth-code-note">
                                {t('reset.no_code')}
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
                            <p className="su-auth-alert">{error}</p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading || !oobCode}>
                            {loading ? t('reset.btn.loading') : t('reset.btn')}
                        </Button>
                    </form>

                    <p className="login-footer-text">
                        <Link to="/login">{t('common.cancel')}</Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ResetPassword;
