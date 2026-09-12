import React, { useState, useEffect, useCallback } from 'react';
import { usePlatformFeatureFlags } from '../../hooks/api/usePlatformFeatureFlags';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminLedger.css';

const FeatureFlagsPanel = () => {
    const { t } = useLanguage();
    const { getFeatureFlags, putFeatureFlag } = usePlatformFeatureFlags();
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState(null);

    const loadFlags = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getFeatureFlags();
            setFlags(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || t('admin.flags.error.load'));
            setFlags([]);
        } finally {
            setLoading(false);
        }
    }, [getFeatureFlags, t]);

    useEffect(() => {
        loadFlags();
    }, [loadFlags]);

    const handleToggle = async (key, currentEnabled) => {
        setToggling(key);
        setError('');
        try {
            const updated = await putFeatureFlag(key, !currentEnabled);
            setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: updated.enabled } : f)));
        } catch (err) {
            setError(err.message || t('admin.flags.error.save'));
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="su-admin-ledger">
            <span className="su-admin-kicker">{t('admin.flags.kicker')}</span>
            <h1 className="su-page-title su-mb-6">{t('admin.flags.title')}</h1>

            {error && <p className="su-input-error-text su-mb-4" role="alert">{error}</p>}

            {loading ? (
                <p className="su-text-muted">{t('admin.flags.loading')}</p>
            ) : (
                <section className="su-flag-panel" data-testid="flags-panel">
                    {flags.length === 0 ? (
                        <p className="su-text-muted">{t('admin.flags.empty')}</p>
                    ) : (
                        <ul className="su-flag-list">
                            {flags.map((flag) => (
                                <li
                                    key={flag.key}
                                    className="su-flag-row"
                                    data-testid={`flag-row-${flag.key}`}
                                >
                                    <div>
                                        <strong className="su-flag-key">{flag.key}</strong>
                                        <span className="su-flag-status">
                                            {flag.enabled ? t('admin.flags.on') : t('admin.flags.off')}
                                        </span>
                                    </div>
                                    <label className="su-flag-toggle">
                                        <input
                                            type="checkbox"
                                            checked={flag.enabled}
                                            onChange={() => handleToggle(flag.key, flag.enabled)}
                                            disabled={toggling === flag.key}
                                            data-testid={`flag-toggle-${flag.key}`}
                                        />
                                        <span>{t('admin.flags.toggle')}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
};

export default FeatureFlagsPanel;
