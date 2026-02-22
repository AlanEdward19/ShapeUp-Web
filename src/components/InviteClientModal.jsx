import React, { useState } from 'react';
import { X, Mail, CheckCircle, Send } from 'lucide-react';
import './InviteClientModal.css';

const InviteClientModal = ({ onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleSend = () => {
        if (!email.trim()) {
            setError('Please enter an email address.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
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
                        <h2 className="su-modal-title">Invite New Client</h2>
                        <p className="su-modal-subtitle">
                            Send an invitation email to your client. They'll receive a link to create their ShapeUp account and connect with you.
                        </p>

                        <div className="su-modal-form">
                            <label className="su-modal-label">Client Email Address</label>
                            <div className="su-modal-input-row">
                                <Mail size={16} className="su-modal-input-icon" />
                                <input
                                    autoFocus
                                    type="email"
                                    className={`su-modal-input ${error ? 'su-modal-input-error' : ''}`}
                                    placeholder="client@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                            </div>
                            {error && <span className="su-modal-error-msg">{error}</span>}
                        </div>

                        <div className="su-modal-actions">
                            <button className="su-modal-btn-cancel" onClick={onClose}>Cancel</button>
                            <button className="su-modal-btn-primary" onClick={handleSend}>
                                <Send size={16} /> Send Invite
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="su-modal-success">
                        <div className="su-modal-success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="su-modal-title">Invite Sent!</h2>
                        <p className="su-modal-subtitle">
                            An invitation has been sent to <strong>{email}</strong>.<br />
                            They'll receive an email with a link to join your coaching program.
                        </p>
                        <button className="su-modal-btn-primary" style={{ alignSelf: 'center', marginTop: '1rem' }} onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InviteClientModal;
