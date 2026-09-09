import Input from '../Input';
import Button from '../Button';
import { Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import ExerciseRow from './ExerciseRow';
import { BLOCK_TYPES } from '../../utils/trainingEnums';

// Superset needs 2+ exercises to mean anything -- block the switch instead of silently
// creating an invalid block the backend would reject on save.
const canSwitchTo = (type, exerciseCount) => type !== 'superset' || exerciseCount >= 2;

const BlockCard = ({ block, onChange, onRemove, onAddExercise }) => {
    const { t } = useLanguage();

    const updateExercise = (exIdx, field, value) => {
        const exercises = [...block.exercises];
        exercises[exIdx] = { ...exercises[exIdx], [field]: value };
        onChange('exercises', exercises);
    };

    const removeExercise = (exIdx) => onChange('exercises', block.exercises.filter((_, i) => i !== exIdx));

    const handleTypeChange = (e) => {
        const nextType = e.target.value;
        if (!canSwitchTo(nextType, block.exercises.length)) {
            window.alert(t('pro.builder.block.superset.needs_two'));
            return;
        }
        onChange('type', nextType);
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

                <button className="su-icon-btn su-error-text" onClick={onRemove} title={t('pro.builder.block.remove')}>
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="su-block-exercises">
                {block.exercises.map((ex, exIdx) => (
                    <ExerciseRow
                        key={ex.id ?? exIdx}
                        exercise={ex}
                        blockType={block.type}
                        onChange={(field, value) => updateExercise(exIdx, field, value)}
                        onRemove={() => removeExercise(exIdx)}
                    />
                ))}
            </div>

            <Button variant="outline" icon={<Plus size={16} />} className="su-mt-2" onClick={onAddExercise}>
                {t('pro.builder.block.add_exercise')}
            </Button>
        </div>
    );
};

export default BlockCard;
