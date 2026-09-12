import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const ForgotPassword = ({ renderView } = {}) => {
    const { t, language } = useLanguage();
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

    if (renderView) return renderView({ email, setEmail, error, success, setSuccess, loading, handleSubmit });
    return (
        <div className="login-container su-auth-centered su-recovery">
            <header className="su-auth-header">
                <Link to="/" className="su-auth-logo">
                    <Logo className="login-logo-img" />
                    <span>ShapeUp</span>
                </Link>
                <Link to="/login" className="su-auth-back">{t('forgot.back')}</Link>
            </header>

            <section className="su-auth-hero">
                <div className="su-auth-copy">
                    <span className="su-recovery-kicker">↶ Autenticação · Proteção de credenciais</span><h1 className="su-auth-title">{language === 'pt-BR' ? 'Recuperação de acesso' : t('forgot.title')}</h1>
                    <p className="su-auth-subtitle">{t('forgot.tagline')}</p>
                    <p className="su-auth-subtitle">{t('forgot.desc')}</p>
                </div>

                <div className="su-auth-form-wrap">
                    <form className="login-form" onSubmit={handleSubmit}>
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
                            <p className="su-auth-alert">{error}</p>
                        )}
                        {success && (
                            <p className="su-auth-alert is-ok">{success}</p>
                        )}

                        <Button type="submit" fullWidth className="btn-sign-in" disabled={loading || !email}>
                            {loading ? t('forgot.btn.sending') : t('forgot.btn')}
                        </Button>
                    </form>

                    <p className="su-recovery-help">Dúvidas ou perda de acesso ao e-mail? Fale com a equipe de suporte ou com a administração da sua academia.</p>
                    <p className="login-footer-text">
                        <Link to="/login">{t('forgot.back')}</Link>
                    </p>

                    <aside className="su-auth-ledger" aria-hidden="true">
                        <p className="su-auth-ledger-label">{t('forgot.ledger.label')}</p>
                        <ol className="su-auth-ledger-list">
                            <li><span>{t('forgot.ledger.email')}</span><b>01</b></li>
                            <li><span>{t('forgot.ledger.link')}</span><b>02</b></li>
                            <li className="is-live"><span>{t('forgot.ledger.back')}</span><b>03</b></li>
                        </ol>
                    </aside>
                </div>
            </section>
        </div>
    );
};

export default ForgotPassword;
