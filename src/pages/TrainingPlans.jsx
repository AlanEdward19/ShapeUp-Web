import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TrainingPlansProfessional from './Dashboard/TrainingPlansProfessional';
import TrainingPlansIndependent from './Dashboard/TrainingPlansIndependent';

const TrainingPlans = () => {
    const { isProfessional } = useOutletContext() || {};

    if (isProfessional) return <TrainingPlansProfessional />;
    return <TrainingPlansIndependent />;
};

export default TrainingPlans;
