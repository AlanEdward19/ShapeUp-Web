import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../../../components/Button';
import Skeleton from '../../../components/Skeleton';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
    buildPutAgendaBody,
    eatingStartMinutesFromLabel,
    useFastingApi,
} from '../../../hooks/api/useFastingApi';
import { formatFastingCountdown, fastingRemainingSeconds } from '../../../utils/fastingCountdown';
import { eatingStartLabelFromMinutes } from './fastingFormUtils';
import { maybeNotifyEatingWindow } from './fastingPageNotify';
import './Nutrition.css';

const PRESET_PROTOCOLS = ['14:10', '16:8', '18:6', '20:4'];
const CUSTOM_PROTOCOL = 'custom';

const eatingStartOptions = () => {
    const options = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        options.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    }
    return options;
};

const EATING_START_OPTIONS = eatingStartOptions();

const FastingPage = () => {
    const { t } = useLanguage();
    const {
        getClock,
        putAgenda,
        startOverride,
        endOverrideEarly,
        cancelOverride,
        getHistory,
    } = useFastingApi();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [disabledRedirect, setDisabledRedirect] = useState(false);
    const [protocol, setProtocol] = useState('16:8');
    const [customFastHours, setCustomFastHours] = useState('16');
    const [eatingStart, setEatingStart] = useState('12:00');
    const [historyItems, setHistoryItems] = useState(null);
    const [fieldError, setFieldError] = useState('');
    const [actionError, setActionError] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionPending, setActionPending] = useState(false);
    const [tick, setTick] = useState(0);
    const loadVersion = useRef(0);
    const previousClockStatus = useRef(null);

    const applySnapshotToForm = useCallback((data) => {
        if (data?.agenda) {
            setProtocol(data.agenda.protocol);
            if (data.agenda.protocol === CUSTOM_PROTOCOL) {
                setCustomFastHours(String(data.agenda.fastHours ?? 16));
            }
            setEatingStart(eatingStartLabelFromMinutes(data.agenda.eatingStartMinutes));
            return;
        }
        if (data?.recommendation?.protocol) {
            setProtocol(data.recommendation.protocol);
            if (data.recommendation.protocol === CUSTOM_PROTOCOL) {
                setCustomFastHours(String(data.recommendation.fastHours ?? 16));
            }
        }
    }, []);

    const loadSnapshot = useCallback(async () => {
        const version = ++loadVersion.current;
        setLoading(true);
        setLoadError('');
        try {
            const data = await getClock();
            if (version !== loadVersion.current) return null;
            maybeNotifyEatingWindow(previousClockStatus.current, data?.clock?.status, t);
            previousClockStatus.current = data?.clock?.status ?? null;
            setSnapshot(data);
            applySnapshotToForm(data);
            return data;
        } catch (err) {
            if (version !== loadVersion.current) return null;
            if (err?.status === 404 && err?.code === 'nutrition.fasting.disabled') {
                setDisabledRedirect(true);
                return null;
            }
            setLoadError(err.message || t('nutrition.fasting.error.load'));
            setSnapshot(null);
            return null;
        } finally {
            if (version === loadVersion.current) setLoading(false);
        }
    }, [applySnapshotToForm, getClock, t]);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getHistory();
            setHistoryItems(Array.isArray(data?.items) ? data.items : []);
        } catch {
            setHistoryItems([]);
        }
    }, [getHistory]);

    useEffect(() => {
        loadSnapshot();
        loadHistory();
        return () => {
            loadVersion.current += 1;
        };
    }, [loadSnapshot, loadHistory]);

    useEffect(() => {
        const onVisibility = () => {
            if (!document.hidden) setTick((n) => n + 1);
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    useEffect(() => {
        if (!snapshot?.clock?.boundaryAt) return undefined;
        if (snapshot.clock.status === 'Idle' && !snapshot.agenda) return undefined;

        const id = window.setInterval(() => {
            setTick((n) => n + 1);
            const remaining = fastingRemainingSeconds(snapshot.clock.boundaryAt);
            if (remaining <= 0) {
                loadSnapshot();
            }
        }, 1000);
        return () => window.clearInterval(id);
    }, [loadSnapshot, snapshot?.agenda, snapshot?.clock?.boundaryAt, snapshot?.clock?.status]);

    const handleSave = async (e) => {
        e.preventDefault();
        setFieldError('');
        setActionError('');
        if (!protocol) {
            setFieldError(t('nutrition.fasting.validation.protocol'));
            return;
        }
        if (!eatingStartMinutesFromLabel(eatingStart)) {
            setFieldError(t('nutrition.fasting.validation.eatingStart'));
            return;
        }
        let fastHours;
        if (protocol === CUSTOM_PROTOCOL) {
            fastHours = parseInt(customFastHours, 10);
            if (!Number.isInteger(fastHours) || fastHours < 12 || fastHours > 23) {
                setFieldError(t('nutrition.fasting.validation.customHours'));
                return;
            }
        }
        setSaving(true);
        try {
            const body = buildPutAgendaBody({
                protocol,
                eatingStartLabel: eatingStart,
                fastHours: protocol === CUSTOM_PROTOCOL ? fastHours : undefined,
            });
            await putAgenda(body);
            await loadSnapshot();
            await loadHistory();
        } catch (err) {
            setActionError(err.message || t('nutrition.fasting.error.save'));
        } finally {
            setSaving(false);
        }
    };

    const runOverrideAction = async (action) => {
        setActionError('');
        setActionPending(true);
        try {
            await action();
            await loadSnapshot();
        } catch (err) {
            setActionError(err.message || t('nutrition.fasting.error.action'));
        } finally {
            setActionPending(false);
        }
    };

    const handleStart = () => {
        if (!snapshot?.agenda) {
            setFieldError(t('nutrition.fasting.validation.noAgenda'));
            return;
        }
        if (snapshot?.clock?.source === 'Override') return;
        runOverrideAction(startOverride);
    };

    if (disabledRedirect) {
        return <Navigate to="/dashboard/nutrition/diary" replace />;
    }

    const showEmpty = snapshot?.clock?.status === 'Idle' && !snapshot?.agenda;
    const showCountdown =
        snapshot?.clock?.boundaryAt &&
        !(snapshot.clock.status === 'Idle' && !snapshot.agenda);
    const countdownText = showCountdown
        ? formatFastingCountdown(snapshot.clock.boundaryAt)
        : '';
    const startDisabled = actionPending || snapshot?.clock?.source === 'Override';
    const overrideActive = snapshot?.clock?.source === 'Override';

    return (
        <div className="su-nutrition-page" data-testid="fasting-page">
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.fasting.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.fasting.title')}</h1>
                </div>
            </header>

            <p className="su-text-muted" data-testid="fasting-disclaimer">
                {t('nutrition.fasting.disclaimer')}
            </p>

            {loading && !snapshot ? (
                <Skeleton variant="card" />
            ) : loadError ? (
                <p className="su-input-error-text" role="alert" data-testid="fasting-error">
                    {loadError}
                </p>
            ) : (
                <>
                    {showEmpty && (
                        <p className="su-text-muted" data-testid="fasting-empty">
                            {t('nutrition.fasting.empty')}
                        </p>
                    )}

                    {showCountdown && (
                        <p
                            className="su-fasting-countdown"
                            data-testid="fasting-countdown"
                            data-clock-status={snapshot.clock.status}
                            data-clock-source={snapshot.clock.source ?? ''}
                            data-tick={tick}
                            aria-live="polite"
                        >
                            {countdownText}
                        </p>
                    )}

                    <section className="su-journal-sheet">
                        <form onSubmit={handleSave}>
                            <fieldset>
                                <legend>{t('nutrition.fasting.protocolLegend')}</legend>
                                {PRESET_PROTOCOLS.map((value) => (
                                    <label key={value} className="su-fasting-protocol">
                                        <input
                                            type="radio"
                                            name="fasting-protocol"
                                            value={value}
                                            checked={protocol === value}
                                            onChange={() => setProtocol(value)}
                                        />
                                        {value}
                                    </label>
                                ))}
                                <label className="su-fasting-protocol">
                                    <input
                                        type="radio"
                                        name="fasting-protocol"
                                        value={CUSTOM_PROTOCOL}
                                        checked={protocol === CUSTOM_PROTOCOL}
                                        onChange={() => setProtocol(CUSTOM_PROTOCOL)}
                                    />
                                    {t('nutrition.fasting.custom')}
                                </label>
                            </fieldset>

                            {protocol === CUSTOM_PROTOCOL && (
                                <label htmlFor="fasting-custom-hours">
                                    {t('nutrition.fasting.customHours')}
                                    <input
                                        id="fasting-custom-hours"
                                        type="number"
                                        min={12}
                                        max={23}
                                        value={customFastHours}
                                        onChange={(e) => setCustomFastHours(e.target.value)}
                                        data-testid="fasting-custom-hours"
                                    />
                                </label>
                            )}

                            <label htmlFor="fasting-eating-start">
                                {t('nutrition.fasting.eatingStart')}
                            </label>
                            <select
                                id="fasting-eating-start"
                                value={eatingStart}
                                onChange={(e) => setEatingStart(e.target.value)}
                            >
                                {EATING_START_OPTIONS.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>

                            {(fieldError || actionError) && (
                                <p className="su-input-error-text" role="alert">
                                    {fieldError || actionError}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={saving}
                                data-testid="fasting-save"
                            >
                                {t('nutrition.fasting.save')}
                            </Button>
                        </form>
                    </section>

                    <section className="su-journal-sheet" data-testid="fasting-history">
                        <h3 className="su-ledger-heading">{t('nutrition.fasting.historyTitle')}</h3>
                        {historyItems == null ? (
                            <Skeleton variant="list" rows={2} />
                        ) : historyItems.length === 0 ? (
                            <p className="su-text-muted">{t('nutrition.fasting.historyEmpty')}</p>
                        ) : (
                            <ul className="su-fasting-history-list">
                                {historyItems.map((item) => (
                                    <li key={item.id}>
                                        {item.protocol} — {item.outcome}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <div className="su-fasting-actions">
                        <Button
                            type="button"
                            onClick={handleStart}
                            disabled={startDisabled}
                            data-testid="fasting-start"
                        >
                            {t('nutrition.fasting.start')}
                        </Button>
                        {overrideActive && (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => runOverrideAction(endOverrideEarly)}
                                    disabled={actionPending}
                                    data-testid="fasting-end-early"
                                >
                                    {t('nutrition.fasting.endEarly')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => runOverrideAction(cancelOverride)}
                                    disabled={actionPending}
                                    data-testid="fasting-cancel"
                                >
                                    {t('nutrition.fasting.cancel')}
                                </Button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FastingPage;
