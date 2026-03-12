import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardProfessional from './Dashboard/DashboardProfessional';
import DashboardClient from './Dashboard/DashboardClient';
import DashboardIndependent from './Dashboard/DashboardIndependent';

const Dashboard = () => {
    const { isProfessional, isIndependent } = useOutletContext();
    if (isProfessional) return <DashboardProfessional />;
    if (isIndependent) return <DashboardIndependent />;
    return <DashboardClient />;
};

export default Dashboard;
