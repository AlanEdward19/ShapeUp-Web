import Input from '../Input';
import Button from '../Button';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SetRow from './SetRow';

const newSet = () => ({ type: 'working', technique: 'Straight', reps: '8-10', load: '75', intensityType: 'rpe', intensityValue: '8', rest: '90' });

const ExerciseRow = ({ exercise, blockType, onChange, onRemove }) => {
    const { t } = useLanguage();

    const updateSet = (sIdx, field, value) => {
        const sets = [...exercise.sets];
        sets[sIdx] = { ...sets[sIdx], [field]: value };
        onChange('sets', sets);
    };

    const addSet = () => onChange('sets', [...exercise.sets, newSet()]);
    const removeSet = (sIdx) => onChange('sets', exercise.sets.filter((_, i) => i !== sIdx));

    return (
        <div className="su-exercise-builder-card">
            <div className="su-drag-handle-vertical"><GripVertical size={20} /></div>
            <div className="su-exercise-content">
                <div className="su-ex-header">
                    <div className="su-ex-title-row">
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
                        <button className="su-icon-btn su-error-text" onClick={onRemove}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="su-ex-notes">
                    <Input
                        value={exercise.notes}
                        onChange={e => onChange('notes', e.target.value)}
                        placeholder={t('pro.builder.ex.notes.ph')}
                    />
                </div>

                <div className="su-sets-builder">
                    <div className="su-sets-header-labels">
                        <span></span>
                        <span>{t('pro.builder.set.type')}</span>
                        <span>{t('pro.builder.set.tech')}</span>
                        <span>{t('pro.builder.set.reps')}</span>
                        <span>{t('pro.builder.set.load')}</span>
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
                            onChange={(field, value) => updateSet(sIdx, field, value)}
                            onRemove={() => removeSet(sIdx)}
                        />
                    ))}

                    <Button variant="outline" icon={<Plus size={16} />} className="su-mt-2" onClick={addSet}>
                        {t('pro.builder.add.set')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseRow;
