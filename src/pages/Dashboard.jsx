import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardProfessional from './Dashboard/DashboardProfessional';
import DashboardClient from './Dashboard/DashboardClient';
import DashboardIndependent from './Dashboard/DashboardIndependent';
import DashboardGym from './Dashboard/DashboardGym'; // <-- NEW

const Dashboard = () => {
    const { isProfessional, isIndependent, isGym } = useOutletContext();
    if (isGym) return <DashboardGym />;
    if (isProfessional) return <DashboardProfessional />;
    if (isIndependent) return <DashboardIndependent />;
    return <DashboardClient />;
};

export default Dashboard;
