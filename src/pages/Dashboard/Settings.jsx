import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, CreditCard, Link as LinkIcon, Smartphone, Shield, Moon, Sun, Camera, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CreditCardUI from '../../components/CreditCardUI';
import { useTheme } from '../../ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Settings.css';

const Settings = () => {
    const {
        isProfessional,
        coachProfile, setCoachProfile,
        clientProfile, setClientProfile
    } = useOutletContext();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');

    const clientId = localStorage.getItem('shapeup_client_id') || 1;
    const userEmail = localStorage.getItem('shapeup_user_email') || '';

    const activeProfile = isProfessional ? coachProfile : clientProfile;

    // --- NOTIFICATION PREFERENCES ---
    const [notifPrefs, setNotifPrefs] = useState(() => {
        const key = isProfessional ? 'shapeup_notif_prefs_pro' : `shapeup_notif_prefs_client_${clientId}`;
        const stored = localStorage.getItem(key);
        // Add defaults for the new toggles
        return stored ? JSON.parse(stored) : {
            messages: true,
            alerts: true,
            alerts_fatigue: true,
            alerts_skipped: true,
            alerts_missed: true,
            system: true
        };
    });

    const toggleNotifPref = (field) => {
        setNotifPrefs(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSaveChanges = () => {
        // Save name to localStorage
        localStorage.setItem('shapeup_user_name', activeProfile.name);

        if (!isProfessional) {
            // Also update the shapeup_clients list so the coach sees the new name
            const storedClients = localStorage.getItem('shapeup_clients');
            if (storedClients) {
                const clientsList = JSON.parse(storedClients);
                const updatedList = clientsList.map(c => {
                    if (c.id === parseInt(clientId) || c.id === clientId) {
                        return { ...c, name: activeProfile.name };
                    }
                    return c;
                });
                localStorage.setItem('shapeup_clients', JSON.stringify(updatedList));
            }

            // Save client card data
            localStorage.setItem(`shapeup_client_card_${clientId}`, JSON.stringify(cardData));
        } else {
            // Predictably save pro billing info
            localStorage.setItem('shapeup_pro_bank', JSON.stringify(bankDetails));
            localStorage.setItem('shapeup_pro_plans', JSON.stringify(proPlans));
        }
        localStorage.setItem('shapeup_user_name', activeProfile.name);

        const notifKey = isProfessional ? 'shapeup_notif_prefs_pro' : `shapeup_notif_prefs_client_${clientId}`;
        localStorage.setItem(notifKey, JSON.stringify(notifPrefs));
    };

    const firstName = activeProfile.name.split(' ')[0] || '';
    const lastName = activeProfile.name.split(' ').slice(1).join(' ') || '';

    const handleNameChange = (first, last) => {
        updateActiveProfile({ name: `${first} ${last}`.trim() });
    };

    const fileInputRef = useRef(null);

    const updateActiveProfile = (newProfileData) => {
        if (isProfessional) {
            setCoachProfile({ ...coachProfile, ...newProfileData });
        } else {
            setClientProfile({ ...clientProfile, ...newProfileData });
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const fileUrl = URL.createObjectURL(file);
            updateActiveProfile({ avatar: fileUrl });
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // --- BILLING STATE ---
    // Professional Billing
    const [bankDetails, setBankDetails] = useState(() => {
        const stored = localStorage.getItem('shapeup_pro_bank');
        return stored ? JSON.parse(stored) : { accountName: '', routingNumber: '', accountNumber: '' };
    });
    const [proPlans, setProPlans] = useState(() => {
        const stored = localStorage.getItem('shapeup_pro_plans');
        return stored ? JSON.parse(stored) : [
            { id: 'plan_1', name: 'Standard Coaching', price: 150, desc: 'Monthly app access and programs.' },
            { id: 'plan_2', name: 'Premium 1-on-1', price: 300, desc: 'Includes weekly video check-ins.' }
        ];
    });

    const [planToDelete, setPlanToDelete] = useState(null);

    const handleAddPlan = () => {
        setProPlans([...proPlans, { id: `plan_${Date.now()}`, name: 'New Plan', price: 0, desc: '' }]);
    };

    const handleDeletePlanClick = (plan) => {
        setPlanToDelete(plan);
    };

    const confirmDeletePlan = () => {
        if (!planToDelete) return;
        setProPlans(proPlans.filter(p => p.id !== planToDelete.id));
        setPlanToDelete(null);
    };

    const updatePlan = (id, field, value) => {
        setProPlans(proPlans.map(p => p.id === id ? { ...p, [field]: field === 'price' ? Number(value) : value } : p));
    };

    // Client Billing
    const [cardData, setCardData] = useState(() => {
        const stored = localStorage.getItem(`shapeup_client_card_${clientId}`);
        return stored ? JSON.parse(stored) : { number: '', name: '', expiry: '', cvv: '' };
    });
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    const [clientAssignedPlan, setClientAssignedPlan] = useState(() => {
        const stored = localStorage.getItem('shapeup_clients');
        if (stored) {
            const list = JSON.parse(stored);
            const me = list.find(c => c.id === parseInt(clientId) || c.id === clientId);
            if (me && me.billingType) {
                if (me.billingType === 'custom') return { name: 'Custom Individual Rate', price: me.customPrice, desc: 'Special rate assigned by your coach.' };
                if (me.billingType === 'plan' && me.billingPlanId) {
                    const allProPlans = JSON.parse(localStorage.getItem('shapeup_pro_plans') || '[]');
                    const found = allProPlans.find(p => p.id === me.billingPlanId);
                    if (found) return found;
                }
            }
        }
        return null; // No assigned plan yet
    });

    const tabsProfessional = [
        { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={18} /> },
        { id: 'notifications', label: t('settings.tabs.notifications'), icon: <Bell size={18} /> },
        { id: 'preferences', label: t('settings.tabs.preferences'), icon: <Smartphone size={18} /> },
        { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCard size={18} /> },
        { id: 'integrations', label: t('settings.tabs.integrations'), icon: <LinkIcon size={18} /> }
    ];

    const tabsClient = [
        { id: 'profile', label: t('settings.tabs.profile_client'), icon: <User size={18} /> },
        { id: 'notifications', label: t('settings.tabs.notifications'), icon: <Bell size={18} /> },
        { id: 'preferences', label: t('settings.tabs.preferences'), icon: <Smartphone size={18} /> },
        { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCard size={18} /> },
        { id: 'coach', label: t('settings.tabs.coach'), icon: <Shield size={18} /> }
    ];

    const activeTabsList = isProfessional ? tabsProfessional : tabsClient;

    return (
        <div className="su-settings-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('settings.title')}</h1>
                    <p className="su-page-subtitle">
                        {isProfessional
                            ? t('settings.subtitle.pro')
                            : t('settings.subtitle.client')}
                    </p>
                </div>
                <Button onClick={handleSaveChanges}>{t('settings.btn.save')}</Button>
            </div>

            <div className="su-settings-layout su-mt-4">

                {/* Sidebar Navigation */}
                <div className="su-settings-sidebar">
                    <nav className="su-settings-nav">
                        {activeTabsList.map(tab => (
                            <button
                                key={tab.id}
                                className={`su-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="su-settings-content">

                    {/* -- SHARED (Profile-ish) SECTION -- */}
                    {activeTab === 'profile' && (
                        <Card className="su-settings-card">
                            <h2 className="su-settings-section-title">
                                {isProfessional ? t('settings.profile.title.pro') : t('settings.profile.title.client')}
                            </h2>

                            <div className="su-settings-avatar-upload">
                                <div className="su-settings-avatar-preview">
                                    {activeProfile?.avatar ? (
                                        <img src={activeProfile.avatar} alt={activeProfile.name} className="su-settings-avatar-img" />
                                    ) : (
                                        <User size={48} className="su-text-muted" />
                                    )}
                                </div>
                                <div className="su-settings-avatar-actions">
                                    <Button variant="outline" onClick={triggerFileInput} icon={<Camera size={16} />}>
                                        {t('settings.profile.photo.change')}
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarUpload}
                                    />
                                    {activeProfile?.avatar && (
                                        <button
                                            className="su-btn-text-danger"
                                            onClick={() => updateActiveProfile({ avatar: null })}
                                            style={{ marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger)' }}
                                        >
                                            {t('settings.profile.photo.remove')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="su-settings-form-grid">
                                <div className="su-form-group">
                                    <label>{t('settings.profile.form.first_name')}</label>
                                    <Input
                                        value={firstName}
                                        onChange={(e) => handleNameChange(e.target.value, lastName)}
                                        placeholder={t('settings.profile.form.first_name')}
                                    />
                                </div>
                                <div className="su-form-group">
                                    <label>{t('settings.profile.form.last_name')}</label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) => handleNameChange(firstName, e.target.value)}
                                        placeholder={t('settings.profile.form.last_name')}
                                    />
                                </div>
                                <div className="su-form-group su-col-span-2">
                                    <label>{t('settings.profile.form.email')}</label>
                                    <Input type="email" disabled value={isProfessional ? "alex@shapeup.fit" : userEmail} />
                                </div>
                                {isProfessional && (
                                    <div className="su-form-group su-col-span-2">
                                        <label>{t('settings.profile.form.bio')}</label>
                                        <textarea
                                            className="su-bare-textarea"
                                            defaultValue="Strength & Conditioning Specialist. Helping athletes reach peak performance."
                                            rows={4}
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* -- PROFESSIONAL SPECIFIC SECTIONS -- */}
                    {isProfessional && activeTab === 'notifications' && (
                        <Card className="su-settings-card">
                            <h2 className="su-settings-section-title">{t('pro.settings.notifications.title')}</h2>
                            <div className="su-settings-list">
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('pro.settings.notifications.messages.title')}</h4>
                                        <p>{t('pro.settings.notifications.messages.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.messages ? 'active' : ''}`} onClick={() => toggleNotifPref('messages')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('pro.settings.notifications.fatigue.title')}</h4>
                                        <p>{t('pro.settings.notifications.fatigue.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.alerts_fatigue ? 'active' : ''}`} onClick={() => toggleNotifPref('alerts_fatigue')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('pro.settings.notifications.skipped.title')}</h4>
                                        <p>{t('pro.settings.notifications.skipped.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.alerts_skipped ? 'active' : ''}`} onClick={() => toggleNotifPref('alerts_skipped')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('pro.settings.notifications.missed.title')}</h4>
                                        <p>{t('pro.settings.notifications.missed.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.alerts_missed ? 'active' : ''}`} onClick={() => toggleNotifPref('alerts_missed')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('pro.settings.notifications.system.title')}</h4>
                                        <p>{t('pro.settings.notifications.system.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.system ? 'active' : ''}`} onClick={() => toggleNotifPref('system')}></div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* -- CLIENT SPECIFIC SECTIONS -- */}
                    {!isProfessional && activeTab === 'notifications' && (
                        <Card className="su-settings-card">
                            <h2 className="su-settings-section-title">{t('client.settings.notifications.title')}</h2>
                            <div className="su-settings-list">
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('client.settings.notifications.chat.title')}</h4>
                                        <p>{t('client.settings.notifications.chat.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.messages ? 'active' : ''}`} onClick={() => toggleNotifPref('messages')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('client.settings.notifications.plan.title')}</h4>
                                        <p>{t('client.settings.notifications.plan.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.alerts ? 'active' : ''}`} onClick={() => toggleNotifPref('alerts')}></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('client.settings.notifications.system.title')}</h4>
                                        <p>{t('client.settings.notifications.system.desc')}</p>
                                    </div>
                                    <div className={`su-toggle-switch ${notifPrefs.system ? 'active' : ''}`} onClick={() => toggleNotifPref('system')}></div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'preferences' && (
                        <Card className="su-settings-card">
                            <h2 className="su-settings-section-title">{t('preferences.title')}</h2>
                            <div className="su-settings-list">
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('preferences.lang.title')}</h4>
                                        <p>{t('preferences.lang.desc')}</p>
                                    </div>
                                    <select
                                        className="su-settings-select"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        style={{ height: '40px', paddingLeft: '1rem', width: '150px' }}
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="pt-BR">Português (BR)</option>
                                    </select>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>{t('preferences.theme.title')}</h4>
                                        <p>{t('preferences.theme.desc')}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                        onClick={toggleTheme}
                                    >
                                        {theme === 'dark' ? t('preferences.theme.light') : t('preferences.theme.dark')}
                                    </Button>
                                </div>
                                {!isProfessional && (
                                    <div className="su-settings-list-item">
                                        <div className="su-item-info">
                                            <h4>{t('preferences.units.title')}</h4>
                                            <p>{t('preferences.units.desc')}</p>
                                        </div>
                                        <select className="su-settings-select" style={{ height: '40px', paddingLeft: '1rem', width: '150px' }}>
                                            <option value="metric">Metric (kg)</option>
                                            <option value="imperial">Imperial (lbs)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {isProfessional && activeTab === 'billing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card className="su-settings-card">
                                <h2 className="su-settings-section-title">{t('pro.settings.billing.bank.title')}</h2>
                                <p className="su-text-muted su-text-sm su-mb-4">{t('pro.settings.billing.bank.desc')}</p>
                                <div className="su-settings-form-grid">
                                    <div className="su-form-group su-col-span-2">
                                        <label>{t('pro.settings.billing.bank.holder')}</label>
                                        <Input value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} placeholder="E.g., ShapeUp Athletics LLC" />
                                    </div>
                                    <div className="su-form-group">
                                        <label>{t('pro.settings.billing.bank.routing')}</label>
                                        <Input value={bankDetails.routingNumber} onChange={e => setBankDetails({ ...bankDetails, routingNumber: e.target.value })} placeholder="9 digits" />
                                    </div>
                                    <div className="su-form-group">
                                        <label>{t('pro.settings.billing.bank.account')}</label>
                                        <Input value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="•••• ••••" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="su-settings-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 className="su-settings-section-title" style={{ marginBottom: 0 }}>{t('pro.settings.billing.plans.title')}</h2>
                                        <p className="su-text-muted su-text-sm">{t('pro.settings.billing.plans.desc')}</p>
                                    </div>
                                    <Button size="small" variant="outline" onClick={handleAddPlan}>{t('pro.settings.billing.plans.add')}</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {proPlans.map((plan, index) => (
                                        <div key={plan.id} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{t('pro.settings.billing.plans.level')} {index + 1}</h4>
                                                <button className="su-icon-btn" onClick={() => handleDeletePlanClick(plan)} style={{ color: 'var(--error)' }} title="Remove Plan">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="su-settings-form-grid">
                                                <div className="su-form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label>{t('pro.settings.billing.plans.name')}</label>
                                                    <Input value={plan.name} onChange={e => updatePlan(plan.id, 'name', e.target.value)} placeholder="e.g. Standard" />
                                                </div>
                                                <div className="su-form-group">
                                                    <label>{t('pro.settings.billing.plans.price')}</label>
                                                    <Input type="number" value={plan.price} onChange={e => updatePlan(plan.id, 'price', e.target.value)} />
                                                </div>
                                                <div className="su-form-group su-col-span-2" style={{ gridColumn: 'span 3' }}>
                                                    <label>Description (What's included?)</label>
                                                    <Input value={plan.desc} onChange={e => updatePlan(plan.id, 'desc', e.target.value)} placeholder="App access, 2 monthly check-ins..." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {proPlans.length === 0 && <p className="su-text-muted su-text-center">No subscription plans created yet.</p>}
                                </div>
                            </Card>
                        </div>
                    )}

                    {!isProfessional && activeTab === 'billing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card className="su-settings-card">
                                <h2 className="su-settings-section-title">{t('client.settings.billing.active.title')}</h2>
                                {clientAssignedPlan ? (
                                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{clientAssignedPlan.name}</h3>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>${clientAssignedPlan.price}<span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></span>
                                        </div>
                                        <p className="su-text-muted">{clientAssignedPlan.desc}</p>
                                    </div>
                                ) : (
                                    <div className="su-empty-state-large" style={{ padding: '2rem' }}>
                                        <h3 className="su-text-muted">{t('client.settings.billing.active.empty.title')}</h3>
                                        <p className="su-text-muted su-text-sm">{t('client.settings.billing.active.empty.desc')}</p>
                                    </div>
                                )}
                            </Card>

                            <Card className="su-settings-card">
                                <h2 className="su-settings-section-title">{t('client.settings.billing.payment.title')}</h2>
                                <p className="su-text-muted su-text-sm su-mb-4">{t('client.settings.billing.payment.desc')}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                    <CreditCardUI cardData={cardData} isFlipped={isCardFlipped} />
                                </div>

                                <div className="su-settings-form-grid">
                                    <div className="su-form-group su-col-span-2">
                                        <label>{t('client.settings.billing.payment.card_num')}</label>
                                        <Input
                                            value={cardData.number}
                                            maxLength={16}
                                            onChange={e => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '') })}
                                            placeholder="0000 0000 0000 0000"
                                            onFocus={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                    <div className="su-form-group su-col-span-2">
                                        <label>{t('client.settings.billing.payment.card_name')}</label>
                                        <Input
                                            value={cardData.name}
                                            onChange={e => setCardData({ ...cardData, name: e.target.value })}
                                            placeholder="JOHN DOE"
                                            onFocus={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                    <div className="su-form-group">
                                        <label>{t('client.settings.billing.payment.expiry')}</label>
                                        <Input
                                            value={cardData.expiry}
                                            maxLength={5}
                                            onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                                            placeholder="12/26"
                                            onFocus={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                    <div className="su-form-group">
                                        <label>CVV / CVC</label>
                                        <Input
                                            value={cardData.cvv}
                                            maxLength={4}
                                            type="password"
                                            onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                            placeholder="•••"
                                            onFocus={() => setIsCardFlipped(true)}
                                            onBlur={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Placeholder for others */}
                    {(activeTab === 'integrations' || activeTab === 'coach') && (
                        <Card className="su-settings-card su-flex-center">
                            <div className="su-empty-state-large">
                                <Shield size={48} className="su-text-muted su-mb-4" />
                                <h3>{t('client.settings.placeholder.title')} {activeTabsList.find(t => t.id === activeTab)?.label}</h3>
                                <p className="su-text-muted">{t('client.settings.placeholder.desc')}</p>
                            </div>
                        </Card>
                    )}

                </div>
            </div>

            {/* Plan Delete Confirmation Modal */}
            {planToDelete && (
                <div className="su-modal-overlay" onClick={() => setPlanToDelete(null)}>
                    <div className="su-modal-box su-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="su-confirm-icon">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="su-confirm-title">Delete Plan?</h3>
                        <p className="su-confirm-body">
                            Are you sure you want to delete the <strong>"{planToDelete.name}"</strong> plan? This action cannot be undone.
                        </p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setPlanToDelete(null)}>
                                Cancel
                            </Button>
                            <Button
                                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                                onClick={confirmDeletePlan}
                            >
                                Delete Plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Settings;
