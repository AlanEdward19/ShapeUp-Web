import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TrainingPlansProfessional from './Dashboard/TrainingPlansProfessional';
import TrainingPlansClient from './Dashboard/TrainingPlansClient';

const TrainingPlans = () => {
    const { isProfessional } = useOutletContext();
    return isProfessional ? <TrainingPlansProfessional /> : <TrainingPlansClient />;
};

export default TrainingPlans;
