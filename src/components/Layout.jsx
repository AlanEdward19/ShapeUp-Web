import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = () => {
    // Determine role based on what was saved during login
    const role = localStorage.getItem('shapeup_role');
    const isProfessional = role === 'professional';
    const isIndependent = role === 'independent';
    const isGym = role === 'gym';
    const isAdmin = role === 'admin';

    // Global profile state for the session
    const storedName = localStorage.getItem('shapeup_user_name');
    const [coachProfile, setCoachProfile] = useState({ name: storedName || 'Coach Alex', avatar: null });
    const [clientProfile, setClientProfile] = useState({ name: storedName || 'Jane Doe', avatar: null });
    const [gymProfile, setGymProfile] = useState({ name: storedName || 'Gym Admin', avatar: null });
    const [adminProfile, setAdminProfile] = useState({ name: storedName || 'System Admin', avatar: null });
    
    const currentProfile = isAdmin ? adminProfile : (isProfessional ? coachProfile : (isGym ? gymProfile : clientProfile));

    // Session title — set by TrainingPlansClient when a session starts/ends
    const [sessionTitle, setSessionTitle] = useState(null);

    return (
        <div className="su-layout-wrapper">
            <Sidebar 
                isProfessional={isProfessional} 
                isIndependent={isIndependent} 
                isGym={isGym} 
                isAdmin={isAdmin} 
            />
            <div className="su-layout-main">
                <Header
                    isProfessional={isProfessional}
                    isIndependent={isIndependent}
                    isGym={isGym}
                    isAdmin={isAdmin}
                    profile={currentProfile}
                    sessionTitle={sessionTitle}
                />
                <main className="su-layout-content">
                    <Outlet context={{
                        isProfessional,
                        isIndependent,
                        isGym,
                        isAdmin,
                        coachProfile, setCoachProfile,
                        clientProfile, setClientProfile,
                        gymProfile, setGymProfile,
                        adminProfile, setAdminProfile,
                        setSessionTitle
                    }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
