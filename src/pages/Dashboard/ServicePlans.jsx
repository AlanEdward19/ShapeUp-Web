import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTrainerPlan, deleteTrainerPlan, getMe, listTrainerPlans } from '../../services/platformClient';

const itemsOf = (page) => page?.items ?? [];

export default function ServicePlans() {
    const { t } = useLanguage();
    const [trainerId, setTrainerId] = useState(null);
    const [plans, setPlans] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('0');
    const [days, setDays] = useState('30');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (id) => {
        setPlans(itemsOf(await listTrainerPlans(id, { pageSize: 20 })));
    }, []);

    useEffect(() => {
        let active = true;
        getMe()
            .then(async (me) => {
                if (!active) return;
                setTrainerId(me.userId);
                await load(me.userId);
            })
            .catch((err) => { if (active) setError(err.message || t('admin.hub.error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [load, t]);

    return (
        <section className="su-admin-ledger" data-testid="service-plans">
            <h1 className="su-page-title">{t('plans.title')}</h1>
            <p>{t('plans.help')}</p>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {!loading && !error && plans.length === 0 && <p className="su-text-muted">{t('plans.empty')}</p>}
            <ul>
                {plans.map((plan) => (
                    <li key={plan.id}>{plan.name} · {plan.price} · {plan.durationDays}d
                        <button type="button" className="su-btn su-btn-secondary" onClick={async () => {
                            setError('');
                            try {
                                await deleteTrainerPlan(trainerId, plan.id);
                                await load(trainerId);
                            } catch (err) {
                                setError(err.message || t('admin.hub.error'));
                            }
                        }}>{t('admin.catalog.delete')}</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={async (event) => {
                event.preventDefault();
                setError('');
                try {
                    await createTrainerPlan(trainerId, { name, description: null, price: Number(price), durationDays: Number(days) });
                    setName('');
                    await load(trainerId);
                } catch (err) {
                    setError(err.message || t('admin.hub.error'));
                }
            }}>
                <input aria-label={t('admin.plans.name')} value={name} onChange={(event) => setName(event.target.value)} required />
                <input aria-label={t('admin.plans.price')} value={price} onChange={(event) => setPrice(event.target.value)} />
                <input aria-label={t('plans.days')} value={days} onChange={(event) => setDays(event.target.value)} />
                <button className="su-btn" type="submit" disabled={!trainerId}>{t('admin.plans.create')}</button>
            </form>
        </section>
    );
}
