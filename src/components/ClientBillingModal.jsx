import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import Button from './Button';
import Input from './Input';
import './ClientBillingModal.css';

const ClientBillingModal = ({ isOpen, onClose, client, onSave }) => {
    const { t } = useLanguage();
    const { setIsOpen: setTourOpen, setSteps } = useTour();

    const [billingType, setBillingType] = useState('plan'); // 'plan' or 'custom'
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [customPrice, setCustomPrice] = useState('0');

    const [proPlans, setProPlans] = useState([]);

    useEffect(() => {
        if (!client) return;
        const storedPlans = localStorage.getItem('shapeup_pro_plans');
        if (storedPlans) {
            const parsed = JSON.parse(storedPlans);
            setProPlans(parsed);
            if (parsed.length > 0 && !client.billingPlanId) {
                setSelectedPlanId(parsed[0].id);
            }
        }

        if (client.billingType) {
            setBillingType(client.billingType);
            if (client.billingType === 'plan' && client.billingPlanId) {
                setSelectedPlanId(client.billingPlanId);
            }
            if (client.billingType === 'custom' && client.customPrice) {
                setCustomPrice(client.customPrice.toString());
            }
        }
    }, [client]);

    useEffect(() => {
        if (!isOpen || !client) return;
        
        const hasSeenTour = localStorage.getItem('shapeup_billing_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="billing-type"]',
                    content: t('tour.billing.1'),
                },
                {
                    selector: '[data-tour="billing-save"]',
                    content: t('tour.billing.2'),
                }
            ];
            
            setTimeout(() => {
                setSteps(tourSteps);
                setTourOpen(true);
            }, 600); // Wait for modal animation
            
            localStorage.setItem('shapeup_billing_tour_seen', 'true');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, client, t]);

    const handleSave = () => {
        const result = {
            billingType,
            billingPlanId: billingType === 'plan' ? selectedPlanId : null,
            customPrice: billingType === 'custom' ? Number(customPrice) : null
        };
        onSave(result);
        onClose();
    };

    if (!isOpen || !client) return null;

    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-content su-billing-modal" onClick={e => e.stopPropagation()}>
                <div className="su-modal-header">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('clients.billing.title')}</h2>
                    <button className="su-icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="su-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('clients.billing.for')}</span>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>{client.name}</div>
                    </div>

                    <div className="su-billing-type-selector" data-tour="billing-type">
                        <button
                            className={`su-billing-type-btn ${billingType === 'plan' ? 'active' : ''}`}
                            onClick={() => setBillingType('plan')}
                        >
                            <CreditCard size={18} />
                            {t('clients.billing.type.plan')}
                        </button>
                        <button
                            className={`su-billing-type-btn ${billingType === 'custom' ? 'active' : ''}`}
                            onClick={() => setBillingType('custom')}
                        >
                            <DollarSign size={18} />
                            {t('clients.billing.type.custom')}
                        </button>
                    </div>

                    {billingType === 'plan' && (
                        <div className="su-form-group">
                            <label>{t('clients.billing.plan.label')}</label>
                            {proPlans.length === 0 ? (
                                <p className="su-text-muted su-text-sm" style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    {t('clients.billing.plan.empty')}
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {proPlans.map(plan => (
                                        <div
                                            key={plan.id}
                                            className={`su-plan-selectable ${selectedPlanId === plan.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontWeight: 600 }}>{plan.name}</div>
                                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${plan.price}/mo</div>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{plan.desc}</div>
                                            {selectedPlanId === plan.id && <CheckCircle className="su-plan-checkmark" size={18} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {billingType === 'custom' && (
                        <div className="su-form-group">
                            <label>{t('clients.billing.custom.label')}</label>
                            <Input
                                type="number"
                                value={customPrice}
                                onChange={e => setCustomPrice(e.target.value)}
                                placeholder="0.00"
                            />
                            <p className="su-text-muted su-text-sm su-mt-2">{t('clients.billing.custom.help')}</p>
                        </div>
                    )}

                </div>

                <div className="su-modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose}>{t('clients.billing.btn.cancel')}</Button>
                    <Button onClick={handleSave} disabled={billingType === 'plan' && !selectedPlanId} data-tour="billing-save">
                        {t('clients.billing.btn.apply')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClientBillingModal;
