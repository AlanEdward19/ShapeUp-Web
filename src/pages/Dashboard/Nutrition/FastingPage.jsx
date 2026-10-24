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

const pageCopy = {
    'pt-BR': {
        offTitle: 'Jejum desativado',
        useSuggestion: 'Ativar com esta sugestão',
        notNow: 'Agora não',
        declinedLine: 'Você dispensou a sugestão do seu nutricionista.',
        declineTitle: 'Dispensar a sugestão de jejum?',
        declineBody: 'Seu nutricionista vai ver que você não vai ativar o jejum sugerido. Você pode ativar depois quando quiser.',
        declineConfirm: 'Dispensar sugestão',
        reasonLabel: 'Motivo (opcional)',
        reasonHint: 'Seu nutricionista lê isso.',
        disable: 'Desativar jejum',
        disableTitle: 'Desativar o jejum?',
        disableBody: 'A agenda e o contador são removidos. O histórico continua salvo.',
        disableConfirm: 'Desativar',
        offBody: 'Você não tem uma agenda de jejum. Ative só se quiser acompanhar uma janela de alimentação, sozinho ou com seu nutricionista.',
        suggested: (protocol) => `Seu nutricionista sugeriu o protocolo ${protocol}.`,
        activate: 'Ativar jejum',
        edit: 'Editar agenda',
        close: 'Fechar',
        status: { Fasting: 'Em jejum', Eating: 'Janela de alimentação', Idle: 'Sem jejum em andamento' },
        agendaLine: (protocol, start) => `Protocolo ${protocol}, janela de alimentação a partir de ${start}`,
        endTitle: 'Encerrar o jejum antes da hora?',
        endBody: 'A janela de alimentação abre agora. O encerramento fica no seu histórico de jejum, que seu nutricionista acompanha.',
        endConfirm: 'Encerrar jejum',
        back: 'Voltar',
    },
    en: {
        offTitle: 'Fasting is off',
        useSuggestion: 'Use this suggestion',
        notNow: 'Not now',
        declinedLine: 'You turned down your nutritionist\'s suggestion.',
        declineTitle: 'Turn down the fasting suggestion?',
        declineBody: 'Your nutritionist will see that you will not use the suggested fasting. You can turn it on later.',
        declineConfirm: 'Turn down',
        reasonLabel: 'Reason (optional)',
        reasonHint: 'Your nutritionist reads this.',
        disable: 'Turn off fasting',
        disableTitle: 'Turn off fasting?',
        disableBody: 'The schedule and the countdown are removed. Your history stays saved.',
        disableConfirm: 'Turn off',
        offBody: 'You have no fasting schedule. Turn it on only if you want to follow an eating window, on your own or with your nutritionist.',
        suggested: (protocol) => `Your nutritionist suggested the ${protocol} protocol.`,
        activate: 'Turn on fasting',
        edit: 'Edit schedule',
        close: 'Close',
        status: { Fasting: 'Fasting', Eating: 'Eating window', Idle: 'No fast in progress' },
        agendaLine: (protocol, start) => `Protocol ${protocol}, eating window starts at ${start}`,
        endTitle: 'End your fast early?',
        endBody: 'Your eating window opens now. Ending early stays in your fasting history, which your nutritionist follows.',
        endConfirm: 'End fast',
        back: 'Back',
    },
    es: {
        offTitle: 'Ayuno desactivado',
        useSuggestion: 'Usar esta sugerencia',
        notNow: 'Ahora no',
        declinedLine: 'Descartaste la sugerencia de tu nutricionista.',
        declineTitle: '¿Descartar la sugerencia de ayuno?',
        declineBody: 'Tu nutricionista verá que no usarás el ayuno sugerido. Puedes activarlo después.',
        declineConfirm: 'Descartar',
        reasonLabel: 'Motivo (opcional)',
        reasonHint: 'Tu nutricionista lo lee.',
        disable: 'Desactivar ayuno',
        disableTitle: '¿Desactivar el ayuno?',
        disableBody: 'Se quitan la agenda y el contador. Tu historial queda guardado.',
        disableConfirm: 'Desactivar',
        offBody: 'No tienes una agenda de ayuno. Actívala solo si quieres seguir una ventana de comida, por tu cuenta o con tu nutricionista.',
        suggested: (protocol) => `Tu nutricionista sugirió el protocolo ${protocol}.`,
        activate: 'Activar ayuno',
        edit: 'Editar agenda',
        close: 'Cerrar',
        status: { Fasting: 'En ayuno', Eating: 'Ventana de comida', Idle: 'Sin ayuno en curso' },
        agendaLine: (protocol, start) => `Protocolo ${protocol}, la ventana de comida empieza a las ${start}`,
        endTitle: '¿Terminar el ayuno antes de tiempo?',
        endBody: 'Tu ventana de comida se abre ahora. Terminar antes queda en tu historial de ayuno, que tu nutricionista sigue.',
        endConfirm: 'Terminar ayuno',
        back: 'Volver',
    },
};

const ReasonField = ({ c, value, onChange, testId }) => (
    <label className="su-fasting-field">
        {c.reasonLabel}
        <textarea
            className="su-input"
            rows={3}
            maxLength={280}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            data-testid={testId}
        />
        <small className="su-text-muted">{c.reasonHint}</small>
    </label>
);

const FastingPage = () => {
    const { t, language } = useLanguage();
    const c = pageCopy[language] || pageCopy['pt-BR'];
    const {
        getClock,
        putAgenda,
        startOverride,
        cancelOverride,
        disableAgenda,
        endEarly,
        declineRecommendation,
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
    const [formOpen, setFormOpen] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [confirmOff, setConfirmOff] = useState(false);
    const [confirmDecline, setConfirmDecline] = useState(false);
    const [reason, setReason] = useState('');
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
            setHistoryItems((Array.isArray(data?.items) ? data.items : []).slice(0, 14));
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
            setFormOpen(false);
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
        if (!snapshot?.agenda || snapshot?.clock?.source === 'Override') return;
        runOverrideAction(startOverride);
    };

    if (disabledRedirect) {
        return <Navigate to="/dashboard/nutrition/diary" replace />;
    }

    const hasAgenda = Boolean(snapshot?.agenda);
    const showEmpty = !hasAgenda;
    const showCountdown =
        snapshot?.clock?.boundaryAt &&
        !(snapshot.clock.status === 'Idle' && !snapshot.agenda);
    const countdownText = showCountdown
        ? formatFastingCountdown(snapshot.clock.boundaryAt)
        : '';
    const startDisabled = actionPending || snapshot?.clock?.source === 'Override';
    const overrideActive = snapshot?.clock?.source === 'Override';
    const canEndEarly = hasAgenda && snapshot?.clock?.status === 'Fasting';
    const recommendation = snapshot?.recommendation?.protocol ? snapshot.recommendation : null;
    const declined = recommendation?.status === 'Declined';

    return (
        <div className="su-nutrition-page" data-testid="fasting-page">
            <header className="su-nutrition-masthead">
                <div>
                    <span className="su-nutrition-kicker">{t('nutrition.fasting.kicker')}</span>
                    <h1 className="su-page-title">{t('nutrition.fasting.title')}</h1>
                </div>
            </header>

            <p className="su-text-muted su-fasting-disclaimer" data-testid="fasting-disclaimer">
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
                        <section className="su-journal-sheet su-fasting-off" data-testid="fasting-empty">
                            <h3 className="su-ledger-heading">{c.offTitle}</h3>
                            <p className="su-text-muted">{c.offBody}</p>
                            {recommendation && !declined && (
                                <p className="su-fasting-suggestion" data-testid="fasting-suggestion">
                                    {c.suggested(recommendation.protocol)}
                                </p>
                            )}
                            {declined && (
                                <p className="su-text-muted" data-testid="fasting-declined">{c.declinedLine}</p>
                            )}
                            {!formOpen && (
                                <div className="su-fasting-actions">
                                    <Button type="button" onClick={() => setFormOpen(true)} data-testid="fasting-activate">
                                        {recommendation && !declined ? c.useSuggestion : c.activate}
                                    </Button>
                                    {recommendation && !declined && (
                                        <Button type="button" variant="secondary" onClick={() => { setReason(''); setConfirmDecline(true); }} data-testid="fasting-decline">
                                            {c.notNow}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {hasAgenda && (
                    <section className="su-journal-sheet su-fasting-clock">
                    {showCountdown && (
                        <>
                        <p className="su-fasting-status" data-testid="fasting-status">
                            {c.status[snapshot.clock.status] || c.status.Idle}
                        </p>
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
                        </>
                    )}
                    <p className="su-text-muted su-fasting-agenda-line">
                        {c.agendaLine(snapshot.agenda.protocol, eatingStartLabelFromMinutes(snapshot.agenda.eatingStartMinutes))}
                    </p>

                    <div className="su-fasting-actions">
                        <Button
                            type="button"
                            onClick={handleStart}
                            disabled={startDisabled}
                            data-testid="fasting-start"
                        >
                            {t('nutrition.fasting.start')}
                        </Button>
                        {canEndEarly && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => { setReason(''); setConfirmEnd(true); }}
                                disabled={actionPending}
                                data-testid="fasting-end-early"
                            >
                                {t('nutrition.fasting.endEarly')}
                            </Button>
                        )}
                        {overrideActive && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => runOverrideAction(cancelOverride)}
                                disabled={actionPending}
                                data-testid="fasting-cancel"
                            >
                                {t('nutrition.fasting.cancel')}
                            </Button>
                        )}
                        {!formOpen && (
                            <Button type="button" variant="secondary" onClick={() => setFormOpen(true)} data-testid="fasting-edit">
                                {c.edit}
                            </Button>
                        )}
                        <Button type="button" variant="secondary" onClick={() => setConfirmOff(true)} disabled={actionPending} data-testid="fasting-disable">
                            {c.disable}
                        </Button>
                    </div>
                    </section>
                    )}

                    {formOpen && (
                    <section className="su-journal-sheet">
                        <form className="su-fasting-form" onSubmit={handleSave}>
                            <fieldset className="su-fasting-protocols">
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
                                <label className="su-fasting-field" htmlFor="fasting-custom-hours">
                                    {t('nutrition.fasting.customHours')}
                                    <input
                                        id="fasting-custom-hours"
                                        className="su-input"
                                        type="number"
                                        min={12}
                                        max={23}
                                        value={customFastHours}
                                        onChange={(e) => setCustomFastHours(e.target.value)}
                                        data-testid="fasting-custom-hours"
                                    />
                                </label>
                            )}

                            <label className="su-fasting-field" htmlFor="fasting-eating-start">
                                {t('nutrition.fasting.eatingStart')}
                            <select
                                id="fasting-eating-start"
                                className="su-input"
                                value={eatingStart}
                                onChange={(e) => setEatingStart(e.target.value)}
                            >
                                {EATING_START_OPTIONS.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                            </label>

                            {(fieldError || actionError) && (
                                <p className="su-input-error-text" role="alert">
                                    {fieldError || actionError}
                                </p>
                            )}

                            <div className="su-fasting-form-actions">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    data-testid="fasting-save"
                                >
                                    {t('nutrition.fasting.save')}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setFormOpen(false)} data-testid="fasting-form-close">
                                    {c.close}
                                </Button>
                            </div>
                        </form>
                    </section>
                    )}

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
                                        {item.protocol}, {item.outcome}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}

            {confirmEnd && (
                <div className="su-substitute-overlay" data-testid="fasting-end-confirm" onClick={() => setConfirmEnd(false)}>
                    <div className="su-substitute-sheet" role="dialog" aria-modal="true" aria-label={c.endTitle} onClick={(e) => e.stopPropagation()}>
                        <h3 className="su-ledger-heading">{c.endTitle}</h3>
                        <p className="su-text-muted">{c.endBody}</p>
                        <ReasonField c={c} value={reason} onChange={setReason} testId="fasting-end-reason" />
                        <div className="su-form-actions">
                            <Button type="button" variant="secondary" onClick={() => setConfirmEnd(false)}>{c.back}</Button>
                            <Button
                                type="button"
                                onClick={() => { setConfirmEnd(false); runOverrideAction(() => endEarly({ reason: reason.trim() })); }}
                                data-testid="fasting-end-confirm-btn"
                            >
                                {c.endConfirm}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDecline && (
                <div className="su-substitute-overlay" data-testid="fasting-decline-confirm" onClick={() => setConfirmDecline(false)}>
                    <div className="su-substitute-sheet" role="dialog" aria-modal="true" aria-label={c.declineTitle} onClick={(e) => e.stopPropagation()}>
                        <h3 className="su-ledger-heading">{c.declineTitle}</h3>
                        <p className="su-text-muted">{c.declineBody}</p>
                        <ReasonField c={c} value={reason} onChange={setReason} testId="fasting-decline-reason" />
                        <div className="su-form-actions">
                            <Button type="button" variant="secondary" onClick={() => setConfirmDecline(false)}>{c.back}</Button>
                            <Button
                                type="button"
                                onClick={() => { setConfirmDecline(false); runOverrideAction(() => declineRecommendation({ reason: reason.trim() })); }}
                                data-testid="fasting-decline-confirm-btn"
                            >
                                {c.declineConfirm}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {confirmOff && (
                <div className="su-substitute-overlay" data-testid="fasting-disable-confirm" onClick={() => setConfirmOff(false)}>
                    <div className="su-substitute-sheet" role="dialog" aria-modal="true" aria-label={c.disableTitle} onClick={(e) => e.stopPropagation()}>
                        <h3 className="su-ledger-heading">{c.disableTitle}</h3>
                        <p className="su-text-muted">{c.disableBody}</p>
                        <div className="su-form-actions">
                            <Button type="button" variant="secondary" onClick={() => setConfirmOff(false)}>{c.back}</Button>
                            <Button
                                type="button"
                                onClick={() => { setConfirmOff(false); setFormOpen(false); runOverrideAction(disableAgenda); }}
                                data-testid="fasting-disable-confirm-btn"
                            >
                                {c.disableConfirm}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FastingPage;
