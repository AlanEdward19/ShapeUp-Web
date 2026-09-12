import React, { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WorkspaceNavigation as Sidebar } from '../stitch/Workspace';
import Header from './Header';
import OfflineQueueIndicator from './OfflineQueueIndicator';
import ErrorBoundary from './ErrorBoundary';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const [navigationOpen, setNavigationOpen] = useState(false);
    const closeNavigation = useCallback(() => setNavigationOpen(false), []);
    // Determine role based on what was saved during login
    const role = localStorage.getItem('shapeup_role');
    const isProfessional = role === 'professional';
    const isIndependent = role === 'independent';
    const isGym = role === 'gym';

    // Global profile state for the session
    const storedName = localStorage.getItem('shapeup_user_name');
    const [coachProfile, setCoachProfile] = useState({ name: storedName || 'Coach Alex', avatar: null });
    const [clientProfile, setClientProfile] = useState({ name: storedName || 'Jane Doe', avatar: null });
    const [gymProfile, setGymProfile] = useState({ name: storedName || 'Gym Admin', avatar: null });
    const currentProfile = isProfessional ? coachProfile : (isGym ? gymProfile : clientProfile);

    // Session title — set by TrainingPlansClient when a session starts/ends
    const [sessionTitle, setSessionTitle] = useState(null);

    if (!(isGym && location.pathname === '/dashboard') && ['/dashboard', '/dashboard/exercises', '/dashboard/settings', '/dashboard/financial', '/dashboard/nutrition/diary', '/dashboard/admin/food-moderation', '/dashboard/messages', '/dashboard/feedback', '/dashboard/gyms'].includes(location.pathname)) return <Outlet context={{ isProfessional, isIndependent, isGym, coachProfile, setCoachProfile, clientProfile, setClientProfile, gymProfile, setGymProfile, setSessionTitle }} />;
    return (
        <div className="su-layout-wrapper">
            {navigationOpen && <button className="su-navigation-backdrop" aria-label="Fechar menu" onClick={() => setNavigationOpen(false)} />}
            <Sidebar isProfessional={isProfessional} isIndependent={isIndependent} isGym={isGym} profile={currentProfile} isOpen={navigationOpen} onClose={closeNavigation} />
            <div className="su-layout-main">
                <Header
                    navigationOpen={navigationOpen}
                    onToggleNavigation={() => setNavigationOpen(open => !open)}
                    isProfessional={isProfessional}
                    isIndependent={isIndependent}
                    isGym={isGym}
                    profile={currentProfile}
                    sessionTitle={sessionTitle}
                />
                <main className="su-layout-content">
                    <div className="su-layout-folio">
                        <ErrorBoundary source="dashboard-page">
                            <Outlet context={{
                                isProfessional,
                                isIndependent,
                                isGym,
                                coachProfile, setCoachProfile,
                                clientProfile, setClientProfile,
                                gymProfile, setGymProfile,
                                setSessionTitle
                            }} />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
            <OfflineQueueIndicator />
        </div>
    );
};

export default Layout;
