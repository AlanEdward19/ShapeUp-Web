import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useMutationQueue } from '../hooks/useMutationQueue';
import { useLanguage } from '../contexts/LanguageContext';
import './OfflineQueueIndicator.css';

const OfflineQueueIndicator = () => {
    const { t } = useLanguage();
    const isOnline = useOnlineStatus();
    const { queue, pendingCount, failedCount, conflictCount, retryMutation, discardMutation } = useMutationQueue();
    const [expanded, setExpanded] = useState(false);

    const attentionCount = failedCount + conflictCount;
    if (isOnline && queue.length === 0) return null;

    const issues = queue.filter(m => m.status === 'failed' || m.status === 'conflict');

    return (
        <div className="su-offline-indicator">
            <button
                className={`su-offline-pill ${attentionCount > 0 ? 'attention' : ''}`}
                onClick={() => setExpanded(e => !e)}
            >
                {!isOnline
                    ? <WifiOff size={14} />
                    : attentionCount > 0
                        ? <AlertTriangle size={14} />
                        : <RefreshCw size={14} className="su-offline-spin" />}
                <span>
                    {!isOnline
                        ? t('offline.status.offline') || 'Offline'
                        : attentionCount > 0
                            ? `${attentionCount} ${t('offline.status.issues') || 'sync issue(s)'}`
                            : `${pendingCount} ${t('offline.status.syncing') || 'syncing...'}`}
                </span>
            </button>

            {expanded && issues.length > 0 && (
                <div className="su-offline-panel">
                    <div className="su-offline-panel-header">{t('offline.panel.title') || 'Sync issues'}</div>
                    {issues.map(item => (
                        <div key={item.id} className="su-offline-panel-item">
                            <div className="su-offline-panel-item-info">
                                <span className="su-offline-panel-item-endpoint">{item.endpoint}</span>
                                <span className="su-offline-panel-item-status">{item.status}</span>
                            </div>
                            <div className="su-offline-panel-item-actions">
                                <button onClick={() => retryMutation(item.id)} title={t('offline.panel.retry') || 'Retry'}>
                                    <RefreshCw size={14} />
                                </button>
                                <button onClick={() => discardMutation(item.id)} title={t('offline.panel.discard') || 'Discard'}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OfflineQueueIndicator;
