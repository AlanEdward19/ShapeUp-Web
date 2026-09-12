import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const tabs = [
    { to: '/dashboard/nutrition/diary', key: 'nutrition.nav.diary' },
    { to: '/dashboard/nutrition/foods', key: 'nutrition.nav.foods' },
    { to: '/dashboard/nutrition/meal-plans', key: 'nutrition.nav.plans' },
    { to: '/dashboard/nutrition/goal', key: 'nutrition.nav.goal' },
];

const NutritionNav = () => {
    const { t } = useLanguage();
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
