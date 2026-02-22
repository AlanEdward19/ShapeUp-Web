import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, CreditCard, Link as LinkIcon, Smartphone, Shield, Moon, Sun, Camera } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
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

    const fileInputRef = useRef(null);

    const activeProfile = isProfessional ? coachProfile : clientProfile;

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

    const tabsProfessional = [
        { id: 'profile', label: 'Profile & Brand', icon: <User size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
        { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={18} /> }
    ];

    const tabsClient = [
        { id: 'profile', label: 'Account Details', icon: <User size={18} /> },
        { id: 'preferences', label: 'App Preferences', icon: <Smartphone size={18} /> },
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
                <Button>Save Changes</Button>
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
                                    <label>Full Name</label>
                                    <Input
                                        value={activeProfile.name}
                                        onChange={(e) => updateActiveProfile({ name: e.target.value })}
                                    />
                                </div>
                                <div className="su-form-group">
                                    <label>Email Address</label>
                                    <Input type="email" disabled defaultValue={isProfessional ? "alex@shapeup.fit" : "alan@example.com"} />
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
                                {!isProfessional && (
                                    <>
                                        <div className="su-form-group">
                                            <label>Current Weight (kg)</label>
                                            <Input type="number" defaultValue="82.5" />
                                        </div>
                                        <div className="su-form-group">
                                            <label>Target Weight (kg)</label>
                                            <Input type="number" defaultValue="80.0" />
                                        </div>
                                    </>
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

                    {/* Placeholder for others */}
                    {(activeTab === 'billing' || activeTab === 'integrations' || activeTab === 'coach') && (
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
        </div>
    );
};

export default Settings;
