import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { enrichExercisesFromCatalog } from '../../utils/workoutStatePayload';
import { collectMuscleHits, LEAF_MUSCLES, maxHitCount } from './muscleRegions';
import BodyMapFront from './BodyMapFront';
import BodyMapBack from './BodyMapBack';
import './WorkoutBodyMap.css';

export default function WorkoutBodyMap({ exercises = [], compact = false, catalog = [] }) {
    const { t } = useLanguage();

    const resolved = useMemo(
        () => (catalog.length ? enrichExercisesFromCatalog(exercises, catalog) : exercises),
        [exercises, catalog],
    );
    const hits = useMemo(() => collectMuscleHits(resolved), [resolved]);
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

    return (
        <section className={`su-body-map ${compact ? 'is-compact' : ''}`} aria-label={t('anatomy.map.title')}>
            <header className="su-body-map-head">
                <h4 className="su-body-map-title">{t('anatomy.map.title')}</h4>
            </header>
            <div className="su-body-map-figure">
                <div className="su-body-map-pane">
                    <span className="su-body-map-pane-label">{t('anatomy.map.front')}</span>
                    <BodyMapFront hits={hits} maxHits={maxHits} labels={labels} />
                </div>
                <div className="su-body-map-pane">
                    <span className="su-body-map-pane-label">{t('anatomy.map.back')}</span>
                    <BodyMapBack hits={hits} maxHits={maxHits} labels={labels} />
                </div>
            </div>
            <p className="su-body-map-hint">
                {hitCount === 0 ? t('anatomy.map.empty') : t('anatomy.map.hint').replace('{n}', String(hitCount))}
            </p>
        </section>
    );
}
