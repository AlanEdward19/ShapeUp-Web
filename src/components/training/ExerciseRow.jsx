import Input from '../Input';
import Button from '../Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { createDefaultPlannedSet } from '../../utils/workoutPlanPayload';
import SetRow from './SetRow';

const ExerciseRow = ({
    exercise,
    blockType,
    onChange,
    onRemove,
    index = 0,
    blockIdx = 0,
    isDropTarget = false,
    onDragOverIndex,
    onDropAt,
}) => {
    const { t } = useLanguage();
    const exerciseType = exercise.exerciseType || 'weightBased';
    const isTimeBased = exerciseType === 'timeBased';

    const updateSet = (sIdx, field, value) => {
        const sets = [...exercise.sets];
        sets[sIdx] = { ...sets[sIdx], [field]: value };
        onChange('sets', sets);
    };

    const addSet = () => onChange('sets', [...exercise.sets, createDefaultPlannedSet(exerciseType)]);
    const removeSet = (sIdx) => onChange('sets', exercise.sets.filter((_, i) => i !== sIdx));

    return (
        <div
            className={`su-exercise-builder-card${isDropTarget ? ' is-drop-target' : ''}`}
            data-ex-drop={index}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                onDragOverIndex?.();
            }}
            onDrop={onDropAt}
        >
            <button
                type="button"
                className="su-drag-handle-vertical"
                draggable
                aria-label={t('pro.builder.ex.reorder')}
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', JSON.stringify({ blockIdx, exIdx: index }));
                    event.dataTransfer.effectAllowed = 'move';
                    event.currentTarget.closest('.su-exercise-builder-card')?.classList.add('is-dragging');
                }}
                onDragEnd={(event) => {
                    event.currentTarget.closest('.su-exercise-builder-card')?.classList.remove('is-dragging');
                }}
            />
            <div className="su-exercise-content">
                <div className="su-ex-header">
                    <span className="su-prescription-exercise-number">{String(index + 1).padStart(2, '0')}</span><div className="su-ex-title-row">
                        <input
                            className="su-pe-ex-name-input"
                            value={exercise.name}
                            onChange={e => onChange('name', e.target.value)}
                            placeholder={t('pro.builder.ex.name.ph')}
                        />
                        <input
                            className="su-pe-ex-tags-input"
                            value={exercise.tags}
                            onChange={e => onChange('tags', e.target.value)}
                            placeholder={t('pro.builder.ex.tags.ph')}
                        />
                    </div>
                    <div className="su-ex-toggles">
                        <button
                            type="button"
                            className={`su-toggle-btn${exercise.requireRpe ? ' active' : ''}`}
                            aria-pressed={Boolean(exercise.requireRpe)}
                            onClick={() => onChange('requireRpe', !exercise.requireRpe)}
                        >
                            {t('pro.builder.require_rpe')}
                        </button>
                        <button
                            type="button"
                            className="su-icon-btn su-error-text su-ex-remove"
                            onClick={onRemove}
                            aria-label={t('pro.builder.ex.remove')}
                            title={t('pro.builder.ex.remove')}
                        >
                            ×
                        </button>
                    </div>
                </div>



                <div className="su-sets-builder">
                    <div className="su-sets-header-labels">
                        <span></span>
                        <span>{t('pro.builder.set.type')}</span>
                        <span>{t('pro.builder.set.tech')}</span>
                        <span>{isTimeBased ? t('pro.builder.set.duration') : t('pro.builder.set.reps')}</span>
                        <span>{isTimeBased ? t('pro.builder.set.distance') : t('pro.builder.set.load')}</span>
                        <span>{t('pro.builder.set.intensity')}</span>
                        <span>{t('pro.builder.set.rest')}</span>
                        <span></span>
                    </div>

                    {exercise.sets.map((s, sIdx) => (
                        <SetRow
                            key={s.id ?? sIdx}
                            set={s}
                            index={sIdx}
                            blockType={blockType}
                            exerciseType={exerciseType}
                            onChange={(field, value) => updateSet(sIdx, field, value)}
                            onRemove={() => removeSet(sIdx)}
                        />
                    ))}

                    <div className="su-prescription-exercise-footer">                <div className="su-ex-notes">
                    <Input
                        value={exercise.notes}
                        onChange={e => onChange('notes', e.target.value)}
                        placeholder={t('pro.builder.ex.notes.ph')}
                    />
                </div>
                    <Button variant="outline" className="su-mt-2" onClick={addSet}>
                        {t('pro.builder.add.set')}
                    </Button></div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseRow;
