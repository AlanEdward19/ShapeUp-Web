import Input from '../Input';
import { useLanguage } from '../../contexts/LanguageContext';
import { SET_TYPES, TECHNIQUES } from '../../pages/Dashboard/ClientDetail';

// Straight blocks control their own per-set rest; grouped blocks (Superset/Amrap/Emom) govern
// timing at the block level instead (Block.RestAfterSeconds / TimeCapSeconds / IntervalSeconds).
const SetRow = ({ set, index, blockType, exerciseType = 'weightBased', onChange, onRemove }) => {
    const { t } = useLanguage();
    const restEnabled = blockType === 'straight';
    const isTimeBased = exerciseType === 'timeBased';
    const techniqueOptions = isTimeBased ? ['Straight'] : TECHNIQUES;

    const toggleIntensityType = () => {
        const nextType = set.intensityType === 'rir' ? 'rpe' : 'rir';
        // Switching scale clears the value -- RPE and RIR aren't the same number on a 1:1 basis.
        onChange('intensityType', nextType);
        onChange('intensityValue', '');
    };

    return (
        <div className="su-set-row">
            <div className="su-set-base-grid">
                <div className="su-set-index">{index + 1}</div>
                <div className="su-input-group">
                    <select className="su-select" value={set.type}
                        onChange={e => onChange('type', e.target.value)}>
                        {SET_TYPES.map(type => <option key={type} value={type}>{t(`client.session.set_type.${type}`)}</option>)}
                    </select>
                </div>
                <div className="su-input-group">
                    <select className="su-select" value={isTimeBased ? 'Straight' : set.technique}
                        disabled={isTimeBased}
                        onChange={e => onChange('technique', e.target.value)}>
                        {techniqueOptions.map(tech => <option key={tech} value={tech}>{t(`pro.builder.tech.${tech.toLowerCase().replace(' ', '')}`) || tech}</option>)}
                    </select>
                </div>
                {isTimeBased ? (
                    <>
                        <Input value={set.duration ?? ''} onChange={e => onChange('duration', e.target.value)} placeholder="05:00" />
                        <Input value={set.distance ?? ''} onChange={e => onChange('distance', e.target.value)} placeholder="1000" />
                    </>
                ) : (
                    <>
                        <Input value={set.reps} onChange={e => onChange('reps', e.target.value)} placeholder="8-10" />
                        <Input value={set.load} onChange={e => onChange('load', e.target.value)} placeholder="75" />
                    </>
                )}
                <div className="su-intensity-group">
                    <button
                        type="button"
                        className="su-intensity-toggle"
                        onClick={toggleIntensityType}
                        title={t('pro.builder.intensity.toggle')}
                    >
                        {(set.intensityType || 'rpe').toUpperCase()}
                    </button>
                    <Input value={set.intensityValue} onChange={e => onChange('intensityValue', e.target.value)} placeholder="8" />
                </div>
                <Input
                    value={restEnabled ? set.rest : ''}
                    onChange={e => onChange('rest', e.target.value)}
                    placeholder="90"
                    disabled={!restEnabled}
                    title={restEnabled ? undefined : t('pro.builder.rest.disabled')}
                />
                <div className="su-set-actions">
                    <button className="su-icon-btn su-error-text" onClick={onRemove}>
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetRow;
