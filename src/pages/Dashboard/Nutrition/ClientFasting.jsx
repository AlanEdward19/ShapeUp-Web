import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const FASTING_COPY = {
    'pt-BR': {
        status: { Fasting: 'Em jejum', Eating: 'Janela de alimentação', Idle: 'Sem jejum em andamento' },
        off: 'Jejum desativado pelo cliente.',
        protocol: 'Protocolo',
        recent: 'Jejuns recentes',
        empty: 'Nenhum jejum concluído ainda.',
        outcomes: { Completed: 'Concluído', Cancelled: 'Cancelado', EndedEarly: 'Encerrado antes da hora' },
        hours: 'h',
        of: (planned) => `de ${planned} h previstas`,
        reasonLabel: 'Motivo',
        noReason: 'Sem motivo informado',
        pending: (protocol, days) => `Ainda não ativou o jejum recomendado (${protocol}), sugerido há ${days} ${days === 1 ? 'dia' : 'dias'}.`,
        declined: (protocol) => `Dispensou o jejum recomendado (${protocol}).`,
        adopted: (protocol) => `Seguindo o jejum recomendado (${protocol}).`,
        earlyCount: (n, total) => `Encerrou antes da hora em ${n} de ${total} jejuns recentes.`,
    },
    en: {
        status: { Fasting: 'Fasting', Eating: 'Eating window', Idle: 'No fast in progress' },
        off: 'Fasting is turned off by the client.',
        protocol: 'Protocol',
        recent: 'Recent fasts',
        empty: 'No completed fasts yet.',
        outcomes: { Completed: 'Completed', Cancelled: 'Cancelled', EndedEarly: 'Ended early' },
        hours: 'h',
        of: (planned) => `of ${planned} h planned`,
        reasonLabel: 'Reason',
        noReason: 'No reason given',
        pending: (protocol, days) => `Has not turned on the recommended fasting (${protocol}) yet, suggested ${days} ${days === 1 ? 'day' : 'days'} ago.`,
        declined: (protocol) => `Turned down the recommended fasting (${protocol}).`,
        adopted: (protocol) => `Following the recommended fasting (${protocol}).`,
        earlyCount: (n, total) => `Ended early in ${n} of ${total} recent fasts.`,
    },
    es: {
        status: { Fasting: 'En ayuno', Eating: 'Ventana de comida', Idle: 'Sin ayuno en curso' },
        off: 'Ayuno desactivado por el cliente.',
        protocol: 'Protocolo',
        recent: 'Ayunos recientes',
        empty: 'Aún no hay ayunos completados.',
        outcomes: { Completed: 'Completado', Cancelled: 'Cancelado', EndedEarly: 'Terminado antes de tiempo' },
        hours: 'h',
        of: (planned) => `de ${planned} h previstas`,
        reasonLabel: 'Motivo',
        noReason: 'Sin motivo indicado',
        pending: (protocol, days) => `Aún no activó el ayuno recomendado (${protocol}), sugerido hace ${days} ${days === 1 ? 'día' : 'días'}.`,
        declined: (protocol) => `Descartó el ayuno recomendado (${protocol}).`,
        adopted: (protocol) => `Siguiendo el ayuno recomendado (${protocol}).`,
        earlyCount: (n, total) => `Terminó antes de tiempo en ${n} de ${total} ayunos recientes.`,
    },
};

const daysSince = (iso) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0);

/** What a professional sees about a client's fasting: adoption of the suggestion, status and early ends. */
const ClientFasting = ({ fasting, history, t }) => {
    const { language } = useLanguage();
    const c = FASTING_COPY[language] || FASTING_COPY['pt-BR'];
    const items = (Array.isArray(history?.items) ? history.items : []).slice(0, 7);
    if (fasting?.off) {
        return <p data-testid="client-fasting">{t('parity.practice.fastingOff')}</p>;
    }
    if (fasting?.error) {
        return <p data-testid="client-fasting">{t('parity.practice.fasting')} {fasting.error}</p>;
    }
    const agenda = fasting?.agenda;
    const recommendation = fasting?.recommendation?.protocol ? fasting.recommendation : null;
    const recommendationStatus = recommendation?.status || (agenda ? 'Adopted' : 'Pending');
    const early = items.filter((item) => item.outcome === 'EndedEarly');
    const hours = (seconds) => ((seconds || 0) / 3600).toLocaleString(language, { maximumFractionDigits: 1 });
    return (
        <div className="su-practice-fasting" data-testid="client-fasting">
            <h3>{t('parity.practice.fasting')}</h3>

            {recommendation && recommendationStatus === 'Pending' && !agenda && (
                <p className="su-practice-flag is-warning" data-testid="fasting-not-activated">
                    {c.pending(recommendation.protocol, daysSince(recommendation.recommendedAtUtc))}
                </p>
            )}
            {recommendation && recommendationStatus === 'Declined' && (
                <div className="su-practice-flag is-warning" data-testid="fasting-declined">
                    <p>{c.declined(recommendation.protocol)}</p>
                    <small>{c.reasonLabel}: {recommendation.declineReason || c.noReason}</small>
                </div>
            )}
            {recommendation && recommendationStatus === 'Adopted' && agenda && (
                <p className="su-practice-flag is-ok" data-testid="fasting-adopted">{c.adopted(recommendation.protocol)}</p>
            )}

            {agenda ? (
                <p>
                    <strong>{c.status[fasting?.clock?.status] || c.status.Idle}</strong>
                    {', '}{c.protocol} {agenda.protocol}
                </p>
            ) : (
                !recommendation && <p className="su-text-muted">{c.off}</p>
            )}

            {early.length > 0 && (
                <p className="su-practice-flag is-warning" data-testid="fasting-early-summary">{c.earlyCount(early.length, items.length)}</p>
            )}

            {(agenda || items.length > 0) && (
                <>
                    <h4>{c.recent}</h4>
                    {items.length === 0 ? (
                        <p className="su-text-muted">{c.empty}</p>
                    ) : (
                        <ul data-testid="client-fasting-history">
                            {items.map((item) => (
                                <li key={item.id} data-outcome={item.outcome}>
                                    <span>
                                        {item.protocol}, {hours(item.fastingDurationSeconds)} {c.hours}
                                        {item.outcome === 'EndedEarly' && item.plannedFastHours ? ` ${c.of(item.plannedFastHours)}` : ''}
                                    </span>
                                    <small>
                                        {item.startedAtUtc ? `${new Date(item.startedAtUtc).toLocaleDateString(language, { day: '2-digit', month: 'short' })}, ` : ''}
                                        {c.outcomes[item.outcome] || item.outcome}
                                    </small>
                                    {item.outcome === 'EndedEarly' && (
                                        <em className="su-practice-reason" data-testid="fasting-end-reason-line">
                                            {c.reasonLabel}: {item.endReason || c.noReason}
                                        </em>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default ClientFasting;
