import React, { useState } from 'react';
import { X, Mail, CheckCircle, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './InviteClientModal.css';

const InviteClientModal = ({ onClose, onInvite }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleSend = () => {
        if (!email.trim()) {
            setError(t('clients.invite.error.empty'));
            return;
        }
        if (!isValidEmail(email)) {
            setError(t('clients.invite.error.invalid'));
            return;
        }
        setError('');
        setSent(true);
        if (onInvite) {
            onInvite(email);
        }
    };

    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="su-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {!sent ? (
                    <>
                        <div className="su-modal-icon-header">
                            <div className="su-modal-icon-circle">
                                <Mail size={24} />
                            </div>
                        </div>
                        <h2 className="su-modal-title">{t('clients.invite.title')}</h2>
                        <p className="su-modal-subtitle">
                            {t('clients.invite.subtitle')}
                        </p>

                        <div className="su-modal-form">
                            <label className="su-modal-label">{t('clients.invite.label')}</label>
                            <div className="su-modal-input-row">
                                <Mail size={16} className="su-modal-input-icon" />
                                <input
                                    autoFocus
                                    type="email"
                                    className={`su-modal-input ${error ? 'su-modal-input-error' : ''}`}
                                    placeholder={t('clients.invite.placeholder')}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                            </div>
                            {error && <span className="su-modal-error-msg">{error}</span>}
                        </div>

                        <div className="su-modal-actions">
                            <button className="su-modal-btn-cancel" onClick={onClose}>{t('clients.invite.btn.cancel')}</button>
                            <button className="su-modal-btn-primary" onClick={handleSend}>
                                <Send size={16} /> {t('clients.invite.btn.send')}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="su-modal-success">
                        <div className="su-modal-success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="su-modal-title">{t('clients.invite.success.title')}</h2>
                        <p className="su-modal-subtitle">
                            {t('clients.invite.success.desc').split('{{email}}')[0]}
                            <strong>{email}</strong>
                            {t('clients.invite.success.desc').split('{{email}}')[1]}
                        </p>
                        <button className="su-modal-btn-primary" style={{ alignSelf: 'center', marginTop: '1rem' }} onClick={onClose}>
                            {t('clients.invite.success.btn')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InviteClientModal;
