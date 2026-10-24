import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Nutrition.css';

const DIARY_PATH = '/dashboard/nutrition/diary';

/** The diary is the only nutrition tab; every other screen is reached from it and returns here. */
const NutritionNav = () => {
    const { t } = useLanguage();
    const { pathname } = useLocation();

    if (pathname === DIARY_PATH) return null;

    return (
        <nav className="su-nutrition-nav" data-testid="nutrition-nav">
            <NavLink to={DIARY_PATH} className="su-nutrition-back">
                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                {t('nutrition.nav.diary')}
            </NavLink>
        </nav>
    );
};

export default NutritionNav;
