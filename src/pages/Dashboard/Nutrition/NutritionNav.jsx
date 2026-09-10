import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
    { to: '/dashboard/nutrition/diary', label: 'Diário' },
    { to: '/dashboard/nutrition/foods', label: 'Alimentos' },
    { to: '/dashboard/nutrition/meal-plans', label: 'Cardápio' },
    { to: '/dashboard/nutrition/goal', label: 'Meta' },
];

const NutritionNav = () => (
    <nav className="su-nutrition-nav su-mb-4" data-testid="nutrition-nav" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
            <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) => `su-btn su-btn-${isActive ? 'primary' : 'secondary'}`}
                style={{ textDecoration: 'none' }}
            >
                {tab.label}
            </NavLink>
        ))}
    </nav>
);

export default NutritionNav;
