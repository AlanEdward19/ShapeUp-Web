import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardProfessional from './Dashboard/DashboardProfessional';
import DashboardClient from './Dashboard/DashboardClient';

const Dashboard = () => {
    const { isProfessional } = useOutletContext();
    return isProfessional ? <DashboardProfessional /> : <DashboardClient />;
};

export default Dashboard;
