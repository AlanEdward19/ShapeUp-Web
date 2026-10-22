import React, { useMemo, useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useLanguage } from '../contexts/LanguageContext';
import { EXERCISE_KINDS, exerciseKind, exerciseKindLabel, exerciseMatchesMuscleFilter } from '../utils/exerciseCatalog';
import { MUSCLE_GROUPS, groupDisplayName, leafDisplayName } from './anatomy/muscleRegions';
import './ExerciseLibraryModal.css';

const normalize = (value) =>
    String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const groupActive = (group, selected) =>
    selected.includes(group) || MUSCLE_GROUPS[group].some((leaf) => selected.includes(leaf));

const ExerciseLibraryModal = ({ onClose, onSelect }) => {
    const { t, language } = useLanguage();
    const { exercises = [], loading } = useExercises();
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState('all');
    const [selected, setSelected] = useState([]);

    const toggleGroup = (group) =>
        setSelected((current) => (groupActive(group, current)
            ? current.filter((item) => item !== group && !MUSCLE_GROUPS[group].includes(item))
            : [...current, group]));

    const toggleLeaf = (group, leaf) =>
        setSelected((current) => {
            if (current.includes(group)) return [...current.filter((item) => item !== group), leaf];
            return current.includes(leaf) ? current.filter((item) => item !== leaf) : [...current, leaf];
        });

    const visible = useMemo(() => {
        const needle = normalize(query);
        return exercises
            .filter((ex) =>
                normalize([ex.name, ...(ex.muscles || [])].join(' ')).includes(needle)
                && (kind === 'all' || exerciseKind(ex) === kind)
                && (kind === 'cardio' || selected.length === 0 || selected.some((muscle) => exerciseMatchesMuscleFilter(ex, muscle))))
            .sort((a, b) => a.name.localeCompare(b.name, language));
    }, [exercises, query, kind, selected, language]);

    const expanded = Object.entries(MUSCLE_GROUPS).filter(([group, leaves]) => leaves.length > 1 && groupActive(group, selected));
    const filtered = kind !== 'all' || selected.length > 0 || query !== '';
    const clear = () => { setQuery(''); setKind('all'); setSelected([]); };

    return (
        <div className="su-modal-overlay su-elm-overlay" onClick={onClose}>
            <div className="su-modal-box su-elm-box" role="dialog" aria-modal="true" aria-label={t('pro.library.title')} onClick={(e) => e.stopPropagation()}>
                <div className="su-elm-header">
                    <div>
                        <h2 className="su-elm-title">{t('pro.library.title')}</h2>
                        <p className="su-elm-subtitle">{t('pro.library.subtitle')}</p>
                    </div>
                    <button className="su-elm-close" onClick={onClose} aria-label={t('common.cancel')} type="button">×</button>
                </div>

                <div className="su-elm-filters">
                    <label className="su-elm-search">
                        <span className="material-symbols-outlined" aria-hidden="true">search</span>
                        <input
                            type="search"
                            placeholder={t('pro.library.search')}
                            aria-label={t('pro.library.search')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </label>

                    <div className="su-elm-chips" role="group" aria-label="Tipo">
                        {EXERCISE_KINDS.map((value) => (
                            <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>
                                {exerciseKindLabel(value, language)}
                            </button>
                        ))}
                    </div>

                    {kind !== 'cardio' && (
                        <div className="su-elm-chips" role="group" aria-label={t('pro.library.muscles')}>
                            {Object.keys(MUSCLE_GROUPS).map((group) => (
                                <button key={group} type="button" aria-pressed={groupActive(group, selected)} onClick={() => toggleGroup(group)}>
                                    {groupDisplayName(group, language)}
                                </button>
                            ))}
                        </div>
                    )}

                    {kind !== 'cardio' && expanded.map(([group, leaves]) => (
                        <div key={group} className="su-elm-chips is-leaves" role="group" aria-label={groupDisplayName(group, language)}>
                            <span>{groupDisplayName(group, language)}</span>
                            {leaves.map((leaf) => (
                                <button key={leaf} type="button" aria-pressed={selected.includes(leaf)} onClick={() => toggleLeaf(group, leaf)}>
                                    {leafDisplayName(leaf, language)}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="su-elm-list">
                    {loading ? (
                        <div className="su-elm-empty"><p>{t('pro.library.loading')}</p></div>
                    ) : (
                        <>
                            <div className="su-elm-count">
                                <span>{t('pro.library.count', { n: visible.length })}</span>
                                {filtered && <button type="button" className="su-elm-clear-btn" onClick={clear}>{t('pro.library.clear')}</button>}
                            </div>
                            {visible.map((ex) => (
                                <button key={ex.id} type="button" className="su-elm-item" onClick={() => onSelect(ex)}>
                                    <span className="su-elm-item-info">
                                        <strong>{ex.name}</strong>
                                        <small>
                                            {[(ex.muscles || []).slice(0, 2).join(', '), exerciseKindLabel(exerciseKind(ex), language)].filter(Boolean).join(' · ')}
                                        </small>
                                    </span>
                                    <span className="material-symbols-outlined su-elm-item-arrow" aria-hidden="true">add_circle</span>
                                </button>
                            ))}
                            {visible.length === 0 && (
                                <div className="su-elm-empty"><p>{t('pro.library.empty')}</p></div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseLibraryModal;
