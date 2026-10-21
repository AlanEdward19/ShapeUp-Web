import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

/** Mon-first strip of the weekdays a plan is scheduled on (Date#getDay indices). */
const WeekdayChips = ({ days }) => {
    const { language } = useLanguage();
    if (!days?.length) return null;
    const monday = new Date(2024, 0, 1);
    return (
        <ul className="su-weekday-chips" aria-label="Dias de treino">
            {[1, 2, 3, 4, 5, 6, 0].map((weekday, index) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + index);
                return (
                    <li key={weekday} data-on={days.includes(weekday) || undefined} title={date.toLocaleDateString(language, { weekday: 'long' })}>
                        {date.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase()}
                    </li>
                );
            })}
        </ul>
    );
};

export default WeekdayChips;
