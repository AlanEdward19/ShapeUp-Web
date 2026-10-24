import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLang } from '../../../../test/withLang';
import ClientFasting from '../ClientFasting';

const t = (key) => key;
const base = {
    agenda: null,
    override: null,
    recommendation: { protocol: '16:8', fastHours: 16, status: 'Pending', recommendedAtUtc: new Date(Date.now() - 3 * 86400000).toISOString() },
    clock: { status: 'Idle', boundaryAt: null, source: null },
};
const show = (fasting, history = { items: [] }) => render(withLang(<ClientFasting fasting={fasting} history={history} t={t} />));

describe('professional view of a client fasting', () => {
    it('flags a recommended fasting the client has not turned on', () => {
        const { getByTestId } = show(base);
        expect(getByTestId('fasting-not-activated')).toHaveTextContent(/16:8/);
        expect(getByTestId('fasting-not-activated')).toHaveTextContent(/3/);
    });

    it('shows that the client turned the suggestion down, with the reason or a note when empty', () => {
        const withReason = show({ ...base, recommendation: { ...base.recommendation, status: 'Declined', declineReason: 'Treino cedo' } });
        expect(withReason.getByTestId('fasting-declined')).toHaveTextContent('Treino cedo');
        withReason.unmount();
        const noReason = show({ ...base, recommendation: { ...base.recommendation, status: 'Declined' } });
        expect(noReason.getByTestId('fasting-declined')).toHaveTextContent(/sem motivo|no reason/i);
    });

    it('highlights fasts ended early with the planned duration and the reason', () => {
        const fasting = {
            ...base,
            agenda: { protocol: '16:8', fastHours: 16, eatHours: 8, eatingStartMinutes: 720, timeZone: 'UTC' },
            recommendation: { ...base.recommendation, status: 'Adopted' },
            clock: { status: 'Fasting', boundaryAt: new Date(Date.now() + 3600000).toISOString(), source: 'Agenda' },
        };
        const history = {
            items: [
                { id: 'a', protocol: '16:8', outcome: 'EndedEarly', fastingDurationSeconds: 39600, plannedFastHours: 16, endReason: 'Jantar de família', startedAtUtc: new Date().toISOString() },
                { id: 'b', protocol: '16:8', outcome: 'Completed', fastingDurationSeconds: 57600, startedAtUtc: new Date().toISOString() },
            ],
        };
        const { getByTestId } = show(fasting, history);
        expect(getByTestId('fasting-early-summary')).toHaveTextContent(/1/);
        expect(getByTestId('fasting-end-reason-line')).toHaveTextContent('Jantar de família');
        expect(getByTestId('client-fasting-history').querySelector('[data-outcome="EndedEarly"]')).toHaveTextContent(/11/);
        expect(getByTestId('fasting-adopted')).toBeInTheDocument();
    });

    it('says fasting is off when there is no schedule and no suggestion', () => {
        const { getByTestId } = show({ ...base, recommendation: null });
        expect(getByTestId('client-fasting')).toHaveTextContent(/desativado|turned off/i);
    });
});
