import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = () => {
    // Determine role based on what was saved during login
    const isProfessional = localStorage.getItem('shapeup_role') === 'professional';

    // Global profile state for the session
    const [coachProfile, setCoachProfile] = useState({ name: 'Coach Alex', avatar: null });
    const [clientProfile, setClientProfile] = useState({ name: 'Jane Doe', avatar: null });
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
