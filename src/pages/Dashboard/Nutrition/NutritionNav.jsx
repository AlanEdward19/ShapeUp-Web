import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useFastingApi } from '../../../hooks/api/useFastingApi';
import './Nutrition.css';

const baseTabs = [
    { to: '/dashboard/nutrition/diary', key: 'nutrition.nav.diary' },
    { to: '/dashboard/nutrition/foods', key: 'nutrition.nav.foods' },
    { to: '/dashboard/nutrition/meal-plans', key: 'nutrition.nav.plans' },
    { to: '/dashboard/nutrition/goal', key: 'nutrition.nav.goal' },
];

const NutritionNav = () => {
    const { t } = useLanguage();
    const { getClock } = useFastingApi();
    const [fastingTabVisible, setFastingTabVisible] = useState(false);

    useEffect(() => {
        let active = true;
        getClock()
            .then(() => {
                if (active) setFastingTabVisible(true);
            })
            .catch((err) => {
                if (!active) return;
                if (err?.status === 404 && err?.code === 'nutrition.fasting.disabled') {
                    setFastingTabVisible(false);
                } else {
                    setFastingTabVisible(true);
                }
            });
        return () => {
            active = false;
        };
    }, [getClock]);

    const tabs = fastingTabVisible
        ? [...baseTabs, { to: '/dashboard/nutrition/fasting', key: 'nutrition.nav.fasting' }]
        : baseTabs;

    return (
        <nav className="su-nutrition-nav" data-testid="nutrition-nav">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={({ isActive }) => `su-btn su-btn-${isActive ? 'primary' : 'secondary'}`}
                >
                    {t(tab.key)}
                </NavLink>
            ))}
        </nav>
    );
};

export default NutritionNav;
