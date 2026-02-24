import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, CreditCard, Link as LinkIcon, Smartphone, Shield, Moon, Sun, Camera } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CreditCardUI from '../../components/CreditCardUI';
import { useTheme } from '../../ThemeContext';
import './Settings.css';

const Settings = () => {
    const {
        isProfessional,
        coachProfile, setCoachProfile,
        clientProfile, setClientProfile
    } = useOutletContext();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');

    const clientId = localStorage.getItem('shapeup_client_id') || 1;
    const userEmail = localStorage.getItem('shapeup_user_email') || '';

    const activeProfile = isProfessional ? coachProfile : clientProfile;

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

    const handleAddPlan = () => {
        setProPlans([...proPlans, { id: `plan_${Date.now()}`, name: 'New Plan', price: 0, desc: '' }]);
    };

    const handleDeletePlan = (id) => {
        setProPlans(proPlans.filter(p => p.id !== id));
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
        { id: 'profile', label: 'Profile & Brand', icon: <User size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
        { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={18} /> }
    ];

    const tabsClient = [
        { id: 'profile', label: 'Account Details', icon: <User size={18} /> },
        { id: 'preferences', label: 'App Preferences', icon: <Smartphone size={18} /> },
        { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
        { id: 'coach', label: 'My Coach', icon: <Shield size={18} /> }
    ];

    const activeTabsList = isProfessional ? tabsProfessional : tabsClient;

    return (
        <div className="su-settings-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Settings</h1>
                    <p className="su-page-subtitle">
                        {isProfessional
                            ? 'Manage your professional coaching profile and subscription.'
                            : 'Update your personal details and app preferences.'}
                    </p>
                </div>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                {isProfessional ? 'Professional Brand' : 'Personal Information'}
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
                                        Change Photo
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
                                            Remove Photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="su-settings-form-grid">
                                <div className="su-form-group">
                                    <label>First Name</label>
                                    <Input
                                        value={firstName}
                                        onChange={(e) => handleNameChange(e.target.value, lastName)}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="su-form-group">
                                    <label>Last Name</label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) => handleNameChange(firstName, e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="su-form-group su-col-span-2">
                                    <label>Email Address</label>
                                    <Input type="email" disabled value={isProfessional ? "alex@shapeup.fit" : userEmail} />
                                </div>
                                {isProfessional && (
                                    <div className="su-form-group su-col-span-2">
                                        <label>Bio / Specialties</label>
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
                            <h2 className="su-settings-section-title">Notification Routing</h2>
                            <div className="su-settings-list">
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>New Client Check-ins</h4>
                                        <p>Receive an email when a client submits their weekly check-in.</p>
                                    </div>
                                    <div className="su-toggle-switch active"></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>Form Validation Videos</h4>
                                        <p>Push notification when a video is flagged for review.</p>
                                    </div>
                                    <div className="su-toggle-switch active"></div>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>Daily Summary</h4>
                                        <p>A morning digest of all logged workouts from yesterday.</p>
                                    </div>
                                    <div className="su-toggle-switch"></div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* -- CLIENT SPECIFIC SECTIONS -- */}
                    {!isProfessional && activeTab === 'preferences' && (
                        <Card className="su-settings-card">
                            <h2 className="su-settings-section-title">App Preferences</h2>
                            <div className="su-settings-list">
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>Appearance (Theme)</h4>
                                        <p>Toggle between Light and Dark mode globally.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                        onClick={toggleTheme}
                                    >
                                        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                                    </Button>
                                </div>
                                <div className="su-settings-list-item">
                                    <div className="su-item-info">
                                        <h4>Measurement Units</h4>
                                        <p>Choose between Metric (kg/cm) and Imperial (lbs/in).</p>
                                    </div>
                                    <select className="su-settings-select">
                                        <option value="metric">Metric (kg)</option>
                                        <option value="imperial">Imperial (lbs)</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}

                    {isProfessional && activeTab === 'billing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card className="su-settings-card">
                                <h2 className="su-settings-section-title">Bank Configuration</h2>
                                <p className="su-text-muted su-text-sm su-mb-4">Link your bank account to receive payouts directly from client subscriptions.</p>
                                <div className="su-settings-form-grid">
                                    <div className="su-form-group su-col-span-2">
                                        <label>Account Holder Name</label>
                                        <Input value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} placeholder="E.g., ShapeUp Athletics LLC" />
                                    </div>
                                    <div className="su-form-group">
                                        <label>Routing Number</label>
                                        <Input value={bankDetails.routingNumber} onChange={e => setBankDetails({ ...bankDetails, routingNumber: e.target.value })} placeholder="9 digits" />
                                    </div>
                                    <div className="su-form-group">
                                        <label>Account Number</label>
                                        <Input value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="•••• ••••" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="su-settings-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 className="su-settings-section-title" style={{ marginBottom: 0 }}>Subscription Plans</h2>
                                        <p className="su-text-muted su-text-sm">Create and manage the default billing tiers available for your clients.</p>
                                    </div>
                                    <Button size="small" variant="outline" onClick={handleAddPlan}>Add Plan</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {proPlans.map(plan => (
                                        <div key={plan.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                            <div className="su-settings-form-grid" style={{ marginBottom: '1rem' }}>
                                                <div className="su-form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label>Plan Name</label>
                                                    <Input value={plan.name} onChange={e => updatePlan(plan.id, 'name', e.target.value)} />
                                                </div>
                                                <div className="su-form-group">
                                                    <label>Monthly Price ($)</label>
                                                    <Input type="number" value={plan.price} onChange={e => updatePlan(plan.id, 'price', e.target.value)} />
                                                </div>
                                                <div className="su-form-group su-col-span-2" style={{ gridColumn: 'span 3' }}>
                                                    <label>Description (What's included?)</label>
                                                    <Input value={plan.desc} onChange={e => updatePlan(plan.id, 'desc', e.target.value)} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className="su-btn-text-danger" onClick={() => handleDeletePlan(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--error)' }}>
                                                    Remove Plan
                                                </button>
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
                                <h2 className="su-settings-section-title">Active Subscription</h2>
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
                                        <h3 className="su-text-muted">No Plan Assigned</h3>
                                        <p className="su-text-muted su-text-sm">Your coach has not assigned a billing plan to your account yet.</p>
                                    </div>
                                )}
                            </Card>

                            <Card className="su-settings-card">
                                <h2 className="su-settings-section-title">Payment Method</h2>
                                <p className="su-text-muted su-text-sm su-mb-4">Securely save your card details for automatic monthly billing.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                    <CreditCardUI cardData={cardData} isFlipped={isCardFlipped} />
                                </div>

                                <div className="su-settings-form-grid">
                                    <div className="su-form-group su-col-span-2">
                                        <label>Card Number</label>
                                        <Input
                                            value={cardData.number}
                                            maxLength={16}
                                            onChange={e => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '') })}
                                            placeholder="0000 0000 0000 0000"
                                            onFocus={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                    <div className="su-form-group su-col-span-2">
                                        <label>Cardholder Name</label>
                                        <Input
                                            value={cardData.name}
                                            onChange={e => setCardData({ ...cardData, name: e.target.value })}
                                            placeholder="JOHN DOE"
                                            onFocus={() => setIsCardFlipped(false)}
                                        />
                                    </div>
                                    <div className="su-form-group">
                                        <label>Expiration (MM/YY)</label>
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
                                <h3>{activeTabsList.find(t => t.id === activeTab)?.label} Configuration</h3>
                                <p className="su-text-muted">This module is currently disabled in the prototype environment.</p>
                            </div>
                        </Card>
                    )}

                </div>
            </div>
        </div >
    );
};

export default Settings;
