import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, Clock, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useMutationQueue } from '../hooks/useMutationQueue';
import { useLanguage } from '../contexts/LanguageContext';
import './OfflineQueueIndicator.css';

// Best-effort human label for a queued mutation. Falls back to the raw endpoint/method for
// anything not explicitly recognized here -- add a case whenever a new flow starts using
// enqueueMutation with something worth describing.
const DESCRIPTORS = [
    [/\/api\/training\/workouts\/start$/, 'offline.item.workout_start', 'Workout start'],
    [/\/api\/training\/workouts\/[^/]+\/state$/, 'offline.item.workout_state', 'Workout progress'],
    [/\/api\/training\/workouts\/[^/]+\/finish$/, 'offline.item.workout_finish', 'Workout completion'],
    [/\/api\/training\/workouts\/[^/]+\/cancel$/, 'offline.item.workout_cancel', 'Workout cancellation'],
    [/\/api\/training\/workout-plans/, 'offline.item.workout_plan', 'Training plan'],
    [/\/api\/training\/workout-templates/, 'offline.item.workout_template', 'Training template'],
    [/\/api\/training\/weight\/target$/, 'offline.item.weight_target', 'Weight goal'],
    [/\/api\/training\/weight\/registers$/, 'offline.item.weight_register', 'Weight log'],
    [/\/api\/gym-management\/trainers\/[^/]+\/clients\/invites\//, 'offline.item.client_invite', 'Client invite'],
    [/\/api\/gym-management\/trainer-client-invites\/accept$/, 'offline.item.invite_accept', 'Invite acceptance'],
];

const describeMutation = (item, t) => {
    const match = DESCRIPTORS.find(([re]) => re.test(item.endpoint));
    if (match) return t(match[1]) || match[2];
    return `${item.method} ${item.endpoint}`;
};

const STATUS_META = {
    pending: { icon: Clock, className: 'pending' },
    syncing: { icon: RefreshCw, className: 'pending', spin: true },
    failed: { icon: AlertTriangle, className: 'attention' },
    conflict: { icon: AlertTriangle, className: 'attention' },
};

const OfflineQueueIndicator = () => {
    const { t } = useLanguage();
    const isOnline = useOnlineStatus();
    const { queue, failedCount, conflictCount, retryMutation, discardMutation } = useMutationQueue();
    const [expanded, setExpanded] = useState(false);

    const attentionCount = failedCount + conflictCount;
    if (isOnline && queue.length === 0) return null;

    const sorted = [...queue].sort((a, b) => a.createdAt - b.createdAt);

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
                            : `${queue.length} ${t('offline.status.syncing') || 'syncing...'}`}
                </span>
            </button>

            {expanded && sorted.length > 0 && (
                <div className="su-offline-panel">
                    <div className="su-offline-panel-header">{t('offline.panel.title_queue') || 'Pending changes'}</div>
                    {sorted.map(item => {
                        const meta = STATUS_META[item.status] || STATUS_META.pending;
                        const Icon = meta.icon;
                        return (
                            <div key={item.id} className="su-offline-panel-item">
                                <Icon size={14} className={`su-offline-panel-item-icon ${meta.className} ${meta.spin ? 'su-offline-spin' : ''}`} />
                                <div className="su-offline-panel-item-info">
                                    <span className="su-offline-panel-item-endpoint">{describeMutation(item, t)}</span>
                                    <span className={`su-offline-panel-item-status ${meta.className}`}>
                                        {t(`offline.item.status.${item.status}`) || item.status}
                                        {item.status === 'conflict' && ` -- ${t('offline.item.conflict_hint') || 'someone else changed this first'}`}
                                        {item.status === 'failed' && item.httpStatus === 403 && ` -- ${t('offline.item.no_permission') || "you don't have permission for this anymore"}`}
                                    </span>
                                </div>
                                <div className="su-offline-panel-item-actions">
                                    {(item.status === 'failed' || item.status === 'conflict') && (
                                        <button onClick={() => retryMutation(item.id)} title={t('offline.panel.retry') || 'Retry'}>
                                            <RefreshCw size={14} />
                                        </button>
                                    )}
                                    {item.status !== 'syncing' && (
                                        <button onClick={() => discardMutation(item.id)} title={t('offline.panel.discard') || 'Cancel'}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OfflineQueueIndicator;
