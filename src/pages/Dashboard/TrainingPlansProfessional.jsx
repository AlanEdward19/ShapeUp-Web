import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Dumbbell, X, CheckCircle2 } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { PlanEditor } from './ClientDetail';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { mapSetType, mapLoadUnit, mapTechnique, mapDifficulty } from '../../utils/trainingEnums';
import { normalizeTemplate } from '../../utils/trainingNormalization';
import './TrainingPlansProfessional.css';


const TrainingPlansProfessional = () => {
    const { t } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const {
        getWorkoutTemplates,
        createWorkoutTemplate,
        updateWorkoutTemplate,
        deleteWorkoutTemplate,
        assignWorkoutTemplate
    } = useTrainingApi();

    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    // Fetch templates from API on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getWorkoutTemplates();
                const raw = Array.isArray(response)
                    ? response
                    : (response?.data || response?.items || []);

                // Normalize from API shape → PlanEditor internal shape
                const data = raw.map(tmpl => normalizeTemplate(tmpl));
                setTemplates(data);
            } catch (err) {
                console.error('Erro ao buscar templates:', err);
                // Fallback to localStorage cache
                const stored = localStorage.getItem('shapeup_plan_templates');
                if (stored) setTemplates(JSON.parse(stored));
            } finally {
                setLoadingTemplates(false);
            }
        };
        fetchTemplates();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Pro Training Plans Tour Trigger ────────────────────────────
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_pro_training_plans_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="tpp-header"]',
                    content: t('tour.training_pro.1'),
                }
            ];

            if (templates.length > 0) {
                tourSteps.push({
                    selector: '[data-tour="tpp-card"]',
                    content: t('tour.training_pro.2'),
                });
                tourSteps.push({
                    selector: '[data-tour="tpp-card-actions"]',
                    content: t('tour.training_pro.3'),
                });
            } else {
                tourSteps.push({
                    selector: '.su-empty-library',
                    content: t('tour.training_pro.4'),
                });
            }

            setSteps(tourSteps);
            setCurrentStep(0);
            setTimeout(() => {
                setIsOpen(true);
            }, 600);
            sessionStorage.setItem('shapeup_pro_training_plans_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps, templates.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const [activeTemplate, setActiveTemplate] = useState(null);
    const [assigningTemplate, setAssigningTemplate] = useState(null);
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


    const duplicateTemplate = async (tmpl) => {
        try {
            // Se for um template do backend, chamamos o endpoint de cópia
            if (tmpl._templateId) {
                const response = await copyWorkoutTemplate(tmpl._templateId, {
                    name: `${tmpl.name} (Copy)`
                });
                
                // O backend provavelmente retorna o novo objeto ou ID
                // Se retornar o objeto normalizamos, senão recarregamos
                if (response && (response.templateId || response.id)) {
                    const newTmpl = normalizeTemplate(response);
                    setTemplates(prev => [newTmpl, ...prev]);
                } else {
                    // Fallback: recarregar lista
                    const data = await getWorkoutTemplates();
                    const raw = Array.isArray(data) ? data : (data?.data || data?.items || []);
                    setTemplates(raw.map(normalizeTemplate));
                }
            } else {
                // Se for algo local ainda não salvo (raro aqui), apenas clonamos no estado
                setTemplates(prev => [{ ...tmpl, id: `tmpl_${Date.now()}`, name: `${tmpl.name} (Copy)` }, ...prev]);
            }
            addNotification('coach', 'success', t('pro.training.copy.success.title'), t('pro.training.copy.success.message'), 'primary');
        } catch (error) {
            console.error('Erro ao duplicar template:', error);
            alert('Erro ao duplicar o template.');
        }
    };

    /**
     * Saves a template — NOT tied to a specific client.
     * Uses createWorkoutTemplate (POST /api/training/workout-templates).
     * The command only requires name, notes and exercises (no targetUserId).
     */
    const handleSaveTemplate = async (updatedPlan) => {
        try {
            const templateBody = {
                name: updatedPlan.name || 'New Template',
                notes: updatedPlan.notes || null,
                durationInWeeks: parseInt(updatedPlan.weeks) || 4,
                phase: updatedPlan.phase || 'Hypertrophy',
                difficulty: mapDifficulty(updatedPlan.difficulty),
                exercises: (updatedPlan.exercises || []).map(ex => ({
                    exerciseId: parseInt(ex.exerciseId) || 1,
                    sets: (ex.sets || []).map(s => ({
                        repetitions: parseInt(s.reps) || 0,
                        load: parseFloat(s.load) || 0,
                        loadUnit: mapLoadUnit(s.loadUnit),
                        setType: mapSetType(s.type ?? s.setType),
                        technique: mapTechnique(s.technique),
                        rpe: parseInt(s.rpe) || 0,
                        restSeconds: parseInt(s.rest) || 0,
                        isExtra: false
                    }))
                }))
            };

            console.log('Enviando template para a API:', templateBody);
            
            if (updatedPlan._templateId) {
                await updateWorkoutTemplate(updatedPlan._templateId, templateBody);
                addNotification('coach', 'success', t('pro.training.save.success.title'), t('pro.training.save.success.message'), 'primary');
            } else {
                await createWorkoutTemplate(templateBody);
                addNotification('coach', 'success', t('pro.training.create.success.title'), t('pro.training.create.success.message'), 'primary');
            }

            // Update local state / cache
            setTemplates(prev => {
                const exists = prev.find(t => t.id === updatedPlan.id);
                if (exists) {
                    return prev.map(t => t.id === updatedPlan.id ? updatedPlan : t);
                }
                return [updatedPlan, ...prev];
            });
            setActiveTemplate(null);
        } catch (error) {
            console.error('Erro ao salvar template na API:', error);
            alert('Erro ao salvar o template. Verifique o console.');
        }
    };

    const deleteTemplate = async (templateId) => {
        if (!window.confirm(t('pro.training.delete.confirm'))) return;
        
        try {
            // Se for um ID do backend (não temporário)
            if (typeof templateId === 'string' && !templateId.startsWith('tmpl_')) {
                await deleteWorkoutTemplate(templateId);
            }
            
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            addNotification('coach', 'alert', t('pro.training.delete.success.title'), t('pro.training.delete.success.message'), 'error');
        } catch (error) {
            console.error('Erro ao excluir template:', error);
            alert('Erro ao excluir o template.');
        }
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
            <div className="su-dashboard-header-flex" data-tour="tpp-header">
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
                                    <Card key={tmpl.id} className="su-template-card su-clean-card" data-tour="tpp-card">
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
                                        <div className="su-template-footer-actions" data-tour="tpp-card-actions">
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
