import { useState } from 'react';
import Input from '../Input';
import Button from '../Button';
import { useLanguage } from '../../contexts/LanguageContext';
import ExerciseRow from './ExerciseRow';
import { BLOCK_TYPES } from '../../utils/trainingEnums';
import { parseExerciseDragPayload } from '../../utils/trainingNormalization';

const canSwitchTo = (type, exerciseCount) => type !== 'superset' || exerciseCount >= 2;

const BlockCard = ({ block, blockIdx = 0, onChange, onRemove, onAddExercise, onMoveExercise }) => {
    const { t } = useLanguage();
    const [confirmDissolve, setConfirmDissolve] = useState(false);
    const [dropAt, setDropAt] = useState(null);

    const updateExercise = (exIdx, field, value) => {
        const exercises = [...block.exercises];
        exercises[exIdx] = { ...exercises[exIdx], [field]: value };
        onChange('exercises', exercises);
    };

    const removeExercise = (exIdx) => {
        if (block.exercises.length <= 1) {
            setConfirmDissolve(true);
            return;
        }
        onChange('exercises', block.exercises.filter((_, i) => i !== exIdx));
    };

    const confirmRemoveLast = () => {
        setConfirmDissolve(false);
        onRemove();
    };

    const handleTypeChange = (e) => {
        const nextType = e.target.value;
        if (!canSwitchTo(nextType, block.exercises.length)) {
            window.alert(t('pro.builder.block.superset.needs_two'));
            return;
        }
        onChange('type', nextType);
    };

    const acceptDrop = (event, toEx) => {
        event.preventDefault();
        event.stopPropagation();
        setDropAt(null);
        const from = parseExerciseDragPayload(event.dataTransfer.getData('text/plain'));
        if (!from || !onMoveExercise) return;
        onMoveExercise(from.blockIdx, from.exIdx, toEx);
    };

    return (
        <div className="su-block-card" data-block-type={block.type}>
            <div className="su-block-header-row">
                <div className="su-input-group su-block-type-select">
                    <select className="su-select" value={block.type} onChange={handleTypeChange}>
                        {BLOCK_TYPES.map(type => (
                            <option key={type} value={type}>{t(`pro.builder.block.type.${type}`)}</option>
                        ))}
                    </select>
                </div>

                {block.type === 'amrap' && (
                    <div className="su-block-fields">
                        <Input
                            label={t('pro.builder.block.time_cap')}
                            type="number" min="1"
                            value={block.timeCapSeconds}
                            onChange={e => onChange('timeCapSeconds', e.target.value)}
                            placeholder="600"
                        />
                    </div>
                )}

                {block.type === 'emom' && (
                    <div className="su-block-fields">
                        <Input
                            label={t('pro.builder.block.interval')}
                            type="number" min="1"
                            value={block.intervalSeconds}
                            onChange={e => onChange('intervalSeconds', e.target.value)}
                            placeholder="60"
                        />
                        <Input
                            label={t('pro.builder.block.rounds')}
                            type="number" min="1"
                            value={block.totalRounds}
                            onChange={e => onChange('totalRounds', e.target.value)}
                            placeholder="10"
                        />
                    </div>
                )}

                <button type="button" className="su-icon-btn su-error-text" onClick={onRemove} title={t('pro.builder.block.remove')}>
                    ×
                </button>
            </div>

            <div
                className={`su-block-exercises${dropAt === block.exercises.length ? ' is-drop-target' : ''}`}
                onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    if (!event.target.closest('[data-ex-drop]')) setDropAt(block.exercises.length);
                }}
                onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setDropAt(null);
                }}
                onDrop={(event) => {
                    if (event.target.closest('[data-ex-drop]')) return;
                    acceptDrop(event, block.exercises.length);
                }}
            >
                {block.exercises.map((ex, exIdx) => (
                    <ExerciseRow
                        key={ex.id ?? exIdx}
                        exercise={ex}
                        index={exIdx}
                        blockIdx={blockIdx}
                        blockType={block.type}
                        isDropTarget={dropAt === exIdx}
                        onChange={(field, value) => updateExercise(exIdx, field, value)}
                        onRemove={() => removeExercise(exIdx)}
                        onDragOverIndex={() => setDropAt(exIdx)}
                        onDropAt={(event) => acceptDrop(event, exIdx)}
                    />
                ))}
            </div>

            <Button variant="outline" className="su-mt-2" onClick={onAddExercise}>
                {t('pro.builder.block.add_exercise')}
            </Button>

            {confirmDissolve && (
                <div className="su-modal-overlay" onClick={() => setConfirmDissolve(false)}>
                    <div className="su-modal-box su-confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="su-block-dissolve-title">
                        <h3 id="su-block-dissolve-title" className="su-confirm-title">{t('pro.builder.block.remove_last.title')}</h3>
                        <p className="su-confirm-body">{t('pro.builder.block.remove_last.body')}</p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setConfirmDissolve(false)}>
                                {t('pro.builder.btn.cancel')}
                            </Button>
                            <Button onClick={confirmRemoveLast}>
                                {t('pro.builder.block.remove_last.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockCard;
