import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardProfessional from './Dashboard/DashboardProfessional';
import DashboardClient from './Dashboard/DashboardClient';
import DashboardIndependent from './Dashboard/DashboardIndependent';
import DashboardGym from './Dashboard/DashboardGym';
import DashboardAdmin from './Dashboard/DashboardAdmin';

const Dashboard = () => {
    const { isProfessional, isIndependent, isGym, isAdmin } = useOutletContext();
    if (isAdmin) return <DashboardAdmin />;
    if (isGym) return <DashboardGym />;
    if (isProfessional) return <DashboardProfessional />;
    if (isIndependent) return <DashboardIndependent />;
    return <DashboardClient />;
};

export default Dashboard;
