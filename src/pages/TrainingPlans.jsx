import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TrainingPlansProfessional from './Dashboard/TrainingPlansProfessional';
import TrainingPlansClient from './Dashboard/TrainingPlansClient';
import TrainingPlansIndependent from './Dashboard/TrainingPlansIndependent';

const TrainingPlans = () => {
    const { isProfessional, isIndependent } = useOutletContext();

    if (isProfessional) return <TrainingPlansProfessional />;
    if (isIndependent) return <TrainingPlansIndependent />;
    return <TrainingPlansClient />;
};

export default TrainingPlans;
