import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = () => {
    // Determine role based on what was saved during login
    const isProfessional = localStorage.getItem('shapeup_role') === 'professional';

    // Global profile state for the session
    const storedName = localStorage.getItem('shapeup_user_name');
    const [coachProfile, setCoachProfile] = useState({ name: storedName || 'Coach Alan', avatar: null });
    const [clientProfile, setClientProfile] = useState({ name: storedName || 'Jane Doe', avatar: null });
    const currentProfile = isProfessional ? coachProfile : clientProfile;

    // Session title — set by TrainingPlansClient when a session starts/ends
    const [sessionTitle, setSessionTitle] = useState(null);

    return (
        <div className="su-layout-wrapper">
            <Sidebar isProfessional={isProfessional} />
            <div className="su-layout-main">
                <Header
                    isProfessional={isProfessional}
                    profile={currentProfile}
                    sessionTitle={sessionTitle}
                />
                <main className="su-layout-content">
                    <Outlet context={{
                        isProfessional,
                        coachProfile, setCoachProfile,
                        clientProfile, setClientProfile,
                        setSessionTitle
                    }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
