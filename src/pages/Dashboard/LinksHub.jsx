import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    acceptNutritionInvite,
    acceptTrainerInvite,
    asList,
    getMyTrainer,
    listNutritionists,
    removeNutritionist,
} from '../../services/parityClient';
import '../Admin/AdminLedger.css';

export default function LinksHub() {
    const { t } = useLanguage();
    const [trainer, setTrainer] = useState(null);
    const [nutritionists, setNutritionists] = useState([]);
    const [payload, setPayload] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [mine, linked] = await Promise.all([getMyTrainer(), listNutritionists()]);
            setTrainer(mine);
            setNutritionists(asList(linked));
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    const run = async (action, success) => {
        setError('');
        setMessage('');
        try {
            await action();
            setMessage(success);
            await load();
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        }
    };

    return (
        <section className="su-admin-ledger" data-testid="links-hub">
            <h1 className="su-page-title">{t('parity.links.title')}</h1>
            <p>{t('parity.links.help')}</p>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {message && <p data-testid="links-message">{message}</p>}
            <h2>{t('parity.links.trainer')}</h2>
            <p data-testid="trainer-status">
                {trainer?.hasTrainer
                    ? t('parity.links.trainerLinked', { id: trainer.trainerId })
                    : t('parity.links.noTrainer')}
            </p>
            <h2>{t('parity.links.nutritionists')}</h2>
            {!loading && nutritionists.length === 0 && <p className="su-text-muted">{t('parity.links.empty')}</p>}
            <ul>
                {nutritionists.map((row) => (
                    <li key={row.nutritionistUserId} data-testid={`nutritionist-${row.nutritionistUserId}`}>
                        <strong>{row.name || `#${row.nutritionistUserId}`}</strong>
                        {row.startedAtUtc && <div>{t('parity.practice.since')} {String(row.startedAtUtc).slice(0, 10)}</div>}
                        <button type="button" className="su-btn su-btn-secondary" onClick={() => run(async () => {
                            await removeNutritionist(row.nutritionistUserId);
                        }, t('parity.links.removed'))}>{t('parity.links.remove')}</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={(event) => {
                event.preventDefault();
                run(async () => { await acceptTrainerInvite(payload.trim()); setPayload(''); }, t('parity.links.accepted'));
            }}>
                <label>
                    {t('parity.links.acceptTrainer')}
                    <input value={payload} onChange={(event) => setPayload(event.target.value)} required data-testid="trainer-invite-payload" />
                </label>
                <button className="su-btn" type="submit">{t('parity.links.acceptTrainer')}</button>
            </form>
            <form onSubmit={(event) => {
                event.preventDefault();
                run(async () => { await acceptNutritionInvite(token.trim()); setToken(''); }, t('parity.links.accepted'));
            }}>
                <label>
                    {t('parity.links.acceptNutritionist')}
                    <input value={token} onChange={(event) => setToken(event.target.value)} required data-testid="nutrition-invite-token" />
                </label>
                <button className="su-btn su-btn-secondary" type="submit">{t('parity.links.acceptNutritionist')}</button>
            </form>
        </section>
    );
}
