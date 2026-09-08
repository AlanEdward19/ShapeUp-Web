import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import { enqueueMutation } from '../services/mutationQueue';
import './InviteClientModal.css';

const InviteClientModal = ({ onClose, onInvite }) => {
    const { t } = useLanguage();
    const { setIsOpen, setSteps } = useTour();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_invite_client_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="invite-email"]',
                    content: t('tour.invite.1'),
                },
                {
                    selector: '[data-tour="invite-send"]',
                    content: t('tour.invite.2'),
                }
            ];

            setTimeout(() => {
                setSteps(tourSteps);
                setIsOpen(true);
            }, 600); // Wait for modal animation

            sessionStorage.setItem('shapeup_invite_client_tour_seen', 'true');
        }
    }, [t, setIsOpen, setSteps]);

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

        const trainerId = localStorage.getItem('shapeup_user_id');
        if (!trainerId) {
            setError(t('clients.invite.error.no_trainer_id') || "ID do Treinador não encontrado na sessão.");
            return;
        }

        // Enqueued (offline foundation): the invite email itself is a fire-and-forget backend
        // side-effect -- the caller (Clients.jsx) already writes its own local "Invited" client
        // record independent of this response, so there's nothing to wait for here. Goes
        // through even offline; if it later fails (e.g. lost the permission to invite by the
        // time connectivity returns), it shows up in OfflineQueueIndicator like any other issue.
        enqueueMutation({
            endpoint: `/api/gym-management/trainers/${trainerId}/clients/invites/${email}`,
            method: 'POST',
            body: { trainerPlanId: null, expiresInHours: 48 },
        });

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

                        <div className="su-modal-form" data-tour="invite-email">
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
                            <button className="su-modal-btn-primary" onClick={handleSend} data-tour="invite-send">
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
