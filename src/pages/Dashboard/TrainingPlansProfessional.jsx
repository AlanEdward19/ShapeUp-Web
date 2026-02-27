import React, { useState, useEffect } from 'react';
import { Target, Activity, Tag, Plus, GripVertical, Settings2, Trash2, Copy, BarChart3, Dumbbell, X, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { PlanEditor } from './ClientDetail';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import './TrainingPlansProfessional.css';

const TrainingPlansProfessional = () => {
    const { t } = useLanguage();
    const [templates, setTemplates] = useState(() => {
        const stored = localStorage.getItem('shapeup_plan_templates');
        if (stored) return JSON.parse(stored);
        return [];
    });

    // Save templates to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('shapeup_plan_templates', JSON.stringify(templates));
    }, [templates]);

    const [activeTemplate, setActiveTemplate] = useState(null); // null means showing library, object means editing
    const [assigningTemplate, setAssigningTemplate] = useState(null); // For assigning to client
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [clients, setClients] = useState(() => {
        const stored = localStorage.getItem('shapeup_clients');
        return stored ? JSON.parse(stored) : [];
    });

    const openNewTemplate = () => {
        setActiveTemplate({
            id: `tmpl_${Date.now()}`,
            name: 'New Training Template',
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            weeks: 4,
            exercises: []
        });
    };

    const deleteTemplate = (id) => {
        if (window.confirm('Delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const duplicateTemplate = (tmpl) => {
        setTemplates(prev => [{ ...tmpl, id: `tmpl_${Date.now()}`, name: `${tmpl.name} (Copy)` }, ...prev]);
    };

    const handleSaveTemplate = (updatedPlan) => {
        setTemplates(prev => {
            const exists = prev.find(t => t.id === updatedPlan.id);
            if (exists) {
                return prev.map(t => t.id === updatedPlan.id ? updatedPlan : t);
            }
            return [updatedPlan, ...prev];
        });
        setActiveTemplate(null);
    };

    const handleAssign = (clientId) => {
        const stored = localStorage.getItem(`shapeup_client_plans_${clientId}`);
        const plans = stored ? JSON.parse(stored) : [];
        const newPlan = { ...assigningTemplate, id: `p${Date.now()}`, history: [] };
        localStorage.setItem(`shapeup_client_plans_${clientId}`, JSON.stringify([...plans, newPlan]));

        addNotification(clientId.toString(), 'alert', 'New Plan Assigned', `Your coach has assigned "${newPlan.name}" to you.`, 'primary', {
            link: '/dashboard/training'
        });

        setAssigningTemplate(null);
        setShowSuccessModal(true);
    };

    return (
        <div className="su-pro-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{activeTemplate ? t('pro.training.title.builder') : t('pro.training.title.library')}</h1>
                    <p className="su-page-subtitle">{activeTemplate ? t('pro.training.subtitle.builder') : t('pro.training.subtitle.library')}</p>
                </div>
                {!activeTemplate && (
                    <Button icon={<Plus size={16} />} onClick={openNewTemplate}>{t('pro.training.btn.create')}</Button>
                )}
                {activeTemplate && (
                    <Button variant="outline" onClick={() => setActiveTemplate(null)}>{t('pro.training.btn.back')}</Button>
                )}
            </div>

            {activeTemplate ? (
                <PlanEditor
                    plan={activeTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => setActiveTemplate(null)}
                    onAssign={setAssigningTemplate}
                />
            ) : (
                <div className="su-training-library">
                    {templates.length === 0 ? (
                        <div className="su-empty-library">
                            <div className="su-empty-icon-wrap">
                                <Dumbbell size={32} />
                            </div>
                            <h2 className="su-empty-title">{t('pro.training.empty.title')}</h2>
                            <p className="su-empty-desc">
                                {t('pro.training.empty.desc')}
                            </p>
                            <Button icon={<Plus size={16} />} onClick={openNewTemplate}>{t('pro.training.empty.btn')}</Button>
                        </div>
                    ) : (
                        <div className="su-grid-cards">
                            {templates.map(tmpl => {
                                const totalSets = tmpl.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                                const totalRest = tmpl.exercises.reduce((acc, ex) =>
                                    acc + ex.sets.reduce((a, s) => a + (parseInt(s.rest) || 90), 0), 0);
                                const estMins = tmpl.exercises.length === 0 ? 0 : Math.round((totalRest + totalSets * 60) / 60);

                                return (
                                    <Card key={tmpl.id} className="su-template-card su-clean-card">
                                        <div className="su-template-main-info">
                                            <div className="su-template-header-row" style={{ alignItems: 'flex-start' }}>
                                                <h3 className="su-template-title-clean" style={{ marginBottom: 0, paddingRight: '1rem' }}>{tmpl.name}</h3>
                                                <div className="su-template-top-actions">
                                                    <button className="su-icon-btn su-text-muted" title="Duplicate" onClick={() => duplicateTemplate(tmpl)}><Copy size={16} /></button>
                                                    <button className="su-icon-btn su-error-text" title="Delete" onClick={() => deleteTemplate(tmpl.id)}><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="su-template-subtitle-clean" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="su-badge su-badge-outline">{tmpl.difficulty}</span>
                                                <span>{tmpl.phase} • {tmpl.weeks} Weeks</span>
                                            </div>

                                            <div className="su-template-metrics-clean">
                                                <div className="su-metric-clean">
                                                    <span className="su-metric-clean-val">{tmpl.exercises.length}</span>
                                                    <span className="su-metric-clean-lbl">{t('pro.training.card.exercises')}</span>
                                                </div>
                                                <div className="su-metric-divider"></div>
                                                <div className="su-metric-clean">
                                                    <span className="su-metric-clean-val">{totalSets}</span>
                                                    <span className="su-metric-clean-lbl">{t('pro.training.card.sets')}</span>
                                                </div>
                                                <div className="su-metric-divider"></div>
                                                <div className="su-metric-clean">
                                                    <span className="su-metric-clean-val">{estMins}m</span>
                                                    <span className="su-metric-clean-lbl">{t('pro.training.card.time')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="su-template-footer-actions">
                                            <Button variant="outline" fullWidth onClick={() => setActiveTemplate(tmpl)}>{t('pro.training.card.btn.edit')}</Button>
                                            <Button fullWidth onClick={() => setAssigningTemplate(tmpl)}>{t('pro.training.card.btn.assign')}</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {assigningTemplate && (
                <div className="su-modal-overlay" onClick={() => setAssigningTemplate(null)} style={{ zIndex: 9999 }}>
                    <div className="su-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <button className="su-modal-close" onClick={() => setAssigningTemplate(null)}><X size={20} /></button>
                        <h2 className="su-modal-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>{t('pro.training.assign.modal.title')}</h2>
                        <p className="su-text-muted su-mb-4" style={{ fontSize: '0.9rem' }}>
                            {t('pro.training.assign.modal.desc')} <strong>{assigningTemplate.name}</strong>:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {clients.length === 0 ? (
                                <p className="su-text-muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('pro.training.assign.empty')}</p>
                            ) : (
                                clients.map(c => (
                                    <Button key={c.id} variant="outline" fullWidth style={{ justifyContent: 'flex-start' }} onClick={() => handleAssign(c.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="su-avatar su-avatar-sm" style={{ backgroundImage: c.avatar ? `url(${c.avatar})` : 'none', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%' }}>
                                                {!c.avatar && c.name.charAt(0)}
                                            </div>
                                            <span>{c.name}</span>
                                        </div>
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="su-modal-overlay su-alert-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="su-modal-box su-alert-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="su-alert-icon-wrap" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="su-modal-title">{t('pro.training.assign.success.title')}</h2>
                        <p className="su-modal-subtitle">
                            {t('pro.training.assign.success.message')}
                        </p>
                        <div className="su-modal-actions">
                            <Button fullWidth onClick={() => setShowSuccessModal(false)}>
                                {t('pro.training.assign.success.btn')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingPlansProfessional;
