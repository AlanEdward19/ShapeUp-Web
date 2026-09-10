import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card';
import { usePlatformFeatureFlags } from '../../hooks/api/usePlatformFeatureFlags';

const FeatureFlagsPanel = () => {
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
            setError(err.message || 'Falha ao carregar flags');
            setFlags([]);
        } finally {
            setLoading(false);
        }
    }, [getFeatureFlags]);

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
            setError(err.message || 'Falha ao atualizar flag');
        } finally {
            setToggling(null);
        }
    };

    return (
        <div>
            <h1 className="su-page-title su-mb-6">Feature flags</h1>

            {error && <p className="su-input-error-text su-mb-4" role="alert">{error}</p>}

            {loading ? (
                <p className="su-text-muted">Carregando...</p>
            ) : (
                <Card data-testid="flags-panel">
                    {flags.length === 0 ? (
                        <p className="su-text-muted">Nenhuma flag configurada.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {flags.map((flag) => (
                                <li
                                    key={flag.key}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}
                                    data-testid={`flag-row-${flag.key}`}
                                >
                                    <div>
                                        <strong>{flag.key}</strong>
                                        <span className="su-text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                                            {flag.enabled ? 'Ativa' : 'Desativada'}
                                        </span>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={flag.enabled}
                                            onChange={() => handleToggle(flag.key, flag.enabled)}
                                            disabled={toggling === flag.key}
                                            data-testid={`flag-toggle-${flag.key}`}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>Ligada</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
};

export default FeatureFlagsPanel;
