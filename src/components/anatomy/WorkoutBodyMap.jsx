import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { collectMuscleHits, LEAF_MUSCLES, maxHitCount } from './muscleRegions';
import BodyMapFront from './BodyMapFront';
import BodyMapBack from './BodyMapBack';
import './WorkoutBodyMap.css';

export default function WorkoutBodyMap({ exercises = [], compact = false }) {
    const { t } = useLanguage();
    const [view, setView] = useState('front');

    const hits = useMemo(() => collectMuscleHits(exercises), [exercises]);
    const maxHits = maxHitCount(hits);
    const hitCount = Object.keys(hits).length;

    const labels = useMemo(() => {
        const map = {
            front: t('anatomy.map.front'),
            back: t('anatomy.map.back'),
        };
        LEAF_MUSCLES.forEach(id => {
            map[id] = t(`anatomy.region.${id}`);
        });
        return map;
    }, [t]);

    const Map = view === 'back' ? BodyMapBack : BodyMapFront;

    return (
        <section className={`su-body-map ${compact ? 'is-compact' : ''}`} aria-label={t('anatomy.map.title')}>
            <header className="su-body-map-head">
                <h4 className="su-body-map-title">{t('anatomy.map.title')}</h4>
                <div className="su-body-map-toggle" role="group" aria-label={t('anatomy.map.title')}>
                    <button
                        type="button"
                        className={view === 'front' ? 'is-active' : ''}
                        onClick={() => setView('front')}
                    >
                        {t('anatomy.map.front')}
                    </button>
                    <button
                        type="button"
                        className={view === 'back' ? 'is-active' : ''}
                        onClick={() => setView('back')}
                    >
                        {t('anatomy.map.back')}
                    </button>
                </div>
            </header>
            <div className="su-body-map-figure">
                <Map hits={hits} maxHits={maxHits} labels={labels} />
            </div>
            <p className="su-body-map-hint">
                {hitCount === 0 ? t('anatomy.map.empty') : t('anatomy.map.hint').replace('{n}', String(hitCount))}
            </p>
        </section>
    );
}
