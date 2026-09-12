import DashboardGym from './Dashboard/DashboardGym';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { StitchProfessional as DashboardProfessional, StitchAthlete as DashboardClient } from '../stitch/OperationalPages';




const Dashboard = () => {
    const { isProfessional, isIndependent, isGym } = useOutletContext();
    if (isGym) return <DashboardGym />;
    if (isProfessional) return <DashboardProfessional />;
    if (isIndependent) return <DashboardClient />;
    return <DashboardClient />;
};

export default Dashboard;
