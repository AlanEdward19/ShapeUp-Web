import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
    asList,
    assignMealPlanTemplate,
    createMealPlanTemplate,
    deleteMealPlanTemplate,
    endNutritionRelationship,
    getClientDiary,
    getClientFasting,
    getClientFastingHistory,
    getClientHydration,
    getClientProfile,
    getClientWeight,
    inviteNutritionClient,
    listMealPlanTemplates,
    listNutritionAdherence,
    listNutritionClients,
    listNutritionInvites,
    revokeNutritionInvite,
    setClientGoal,
} from '../../../services/parityClient';
import FoodPicker from './FoodPicker';
import '../../Admin/AdminLedger.css';
import ClientFasting from './ClientFasting';
import './Nutrition.css';

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
const today = () => new Date().toISOString().slice(0, 10);
const pending = (status) => String(status).toLowerCase() === 'pending' || String(status).toLowerCase() === 'invited';

export default function NutritionPractice() {
    const { t } = useLanguage();
    const [clients, setClients] = useState([]);
    const [adherence, setAdherence] = useState([]);
    const [invites, setInvites] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [chart, setChart] = useState(null);
    const [email, setEmail] = useState('');
    const [created, setCreated] = useState(null);
    const [templateName, setTemplateName] = useState('');
    const [slot, setSlot] = useState('breakfast');
    const [food, setFood] = useState(null);
    const [grams, setGrams] = useState('100');
    const [goal, setGoal] = useState({ kcal: '', proteinG: '', carbG: '', fatG: '', waterMl: '' });
    const [error, setError] = useState('');
    const [forbidden, setForbidden] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        setForbidden(false);
        try {
            const [clientRows, adherencePage, invitePage, templateRows] = await Promise.all([
                listNutritionClients(),
                listNutritionAdherence(),
                listNutritionInvites(),
                listMealPlanTemplates(),
            ]);
            setClients(asList(clientRows));
            setAdherence(asList(adherencePage));
            setInvites(asList(invitePage));
            setTemplates(asList(templateRows));
        } catch (err) {
            if (err.status === 403) setForbidden(true);
            else setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    const openClient = async (clientUserId) => {
        setSelected(clientUserId);
        setError('');
        const date = today();
        const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        const end = new Date().toISOString();
        const [diary, profile, weight, hydration, fasting, history] = await Promise.all([
            getClientDiary(clientUserId, date).catch((err) => ({ error: err.message })),
            getClientProfile(clientUserId).catch((err) => ({ error: err.message })),
            getClientWeight(clientUserId, start, end).catch((err) => ({ error: err.message })),
            getClientHydration(clientUserId, date).catch((err) => ({ error: err.message })),
            getClientFasting(clientUserId).catch((err) => (err.status === 404 ? { off: true } : { error: err.message })),
            getClientFastingHistory(clientUserId).catch(() => ({ items: [] })),
        ]);
        setChart({ diary, profile, weight, hydration, fasting, history });
        const active = profile?.activeGoal;
        if (active) {
            setGoal({
                kcal: String(active.kcal ?? ''),
                proteinG: String(active.proteinG ?? ''),
                carbG: String(active.carbG ?? ''),
                fatG: String(active.fatG ?? ''),
                waterMl: active.waterMl == null ? '' : String(active.waterMl),
            });
        }
    };

    const run = async (action) => {
        setError('');
        try {
            await action();
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        }
    };

    if (forbidden) {
        return <section className="su-admin-ledger" data-testid="nutrition-practice"><p role="alert">{t('parity.practice.forbidden')}</p></section>;
    }

    const adherenceOf = (id) => adherence.find((row) => row.clientUserId === id);
    const lastWeight = chart?.weight?.items?.at?.(-1) ?? chart?.weight?.items?.[chart.weight.items.length - 1];

    return (
        <section className="su-admin-ledger su-nutrition-page su-practice" data-testid="nutrition-practice">
            <h1 className="su-page-title">{t('parity.practice.title')}</h1>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            <h2>{t('parity.practice.clients')}</h2>
            <ul>
                {clients.map((client) => {
                    const row = adherenceOf(client.clientUserId);
                    return (
                        <li key={client.clientUserId} data-testid={`client-${client.clientUserId}`}>
                            <strong>{client.name || `#${client.clientUserId}`}</strong>
                            <div>
                                {t('parity.practice.since')} {client.startedAtUtc?.slice?.(0, 10)}
                                {row ? ` · ${row.daysLogged}/${row.days} ${t('parity.practice.daysLogged')}` : ''}
                            </div>
                            <button type="button" className="su-btn su-btn-secondary" onClick={() => openClient(client.clientUserId)}>{t('parity.practice.open')}</button>
                        </li>
                    );
                })}
            </ul>
            <h2>{t('parity.practice.invite')}</h2>
            <form className="su-practice-invite" onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                    const result = await inviteNutritionClient(email.trim());
                    setCreated(result);
                    setEmail('');
                    await load();
                });
            }}>
                <input aria-label={t('parity.practice.inviteEmail')} value={email} onChange={(event) => setEmail(event.target.value)} data-testid="nutrition-invite-email" />
                <button className="su-btn su-btn-primary" type="submit">{t('parity.practice.sendInvite')}</button>
            </form>
            {created?.token && <p data-testid="invite-token">{created.token}</p>}
            <ul>
                {invites.map((invite) => (
                    <li key={invite.inviteId}>
                        {invite.clientEmail || t('parity.practice.invite')} · {invite.status}
                        {pending(invite.status) && (
                            <button type="button" className="su-btn su-btn-secondary" onClick={() => run(async () => {
                                await revokeNutritionInvite(invite.inviteId);
                                await load();
                            })}>{t('parity.practice.revoke')}</button>
                        )}
                    </li>
                ))}
            </ul>
            <h2>{t('parity.practice.templates')}</h2>
            <ul>
                {templates.map((template) => (
                    <li key={template.id} data-testid={`template-${template.id}`}>
                        <strong>{template.name}</strong>
                        <span> · {(template.items || []).length}</span>
                        <button type="button" className="su-btn su-btn-secondary" disabled={!selected} onClick={() => run(async () => {
                            await assignMealPlanTemplate(template.id, selected, template.name);
                            setCreated({ token: null, note: t('parity.practice.assignedInactive') });
                        })}>{t('parity.practice.assign')}</button>
                        <button type="button" className="su-btn su-btn-secondary" onClick={() => run(async () => {
                            await deleteMealPlanTemplate(template.id);
                            await load();
                        })}>{t('parity.practice.delete')}</button>
                    </li>
                ))}
            </ul>
            {created?.note && <p data-testid="template-assigned">{created.note}</p>}
            <form onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                    await createMealPlanTemplate({
                        name: templateName,
                        notes: null,
                        items: [{ mealSlot: slot, foodId: food?.foodId ?? '', quantityGramsOrMl: Number(grams) }],
                    });
                    setTemplateName('');
                    setFood(null);
                    await load();
                });
            }}>
                <label>
                    {t('parity.practice.templateName')}
                    <input value={templateName} onChange={(event) => setTemplateName(event.target.value)} required data-testid="template-name" />
                </label>
                <label>
                    {t('parity.practice.slot')}
                    <select value={slot} onChange={(event) => setSlot(event.target.value)} data-testid="template-slot">
                        {SLOTS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </label>
                <FoodPicker testId="template-food" value={food} onSelect={setFood} />
                <label>
                    {t('parity.practice.grams')}
                    <input value={grams} onChange={(event) => setGrams(event.target.value)} required data-testid="template-grams" />
                </label>
                <button className="su-btn su-btn-primary" type="submit" disabled={!food}>{t('parity.practice.saveTemplate')}</button>
            </form>
            {selected && chart && (
                <section data-testid="client-chart">
                    <h2>#{selected}</h2>
                    <p data-testid="client-diary">
                        {t('parity.practice.diary')} {chart.diary?.totals?.kcal ?? '-'} kcal
                    </p>
                    <p data-testid="client-goal">
                        {t('parity.practice.goal')} {chart.profile?.activeGoal?.kcal ?? '-'} kcal
                    </p>
                    <p data-testid="client-weight">
                        {t('parity.practice.weight')} {lastWeight?.weight ?? '-'} kg
                    </p>
                    <p data-testid="client-water">
                        {t('parity.practice.water')} {chart.hydration?.totalMl ?? '-'} ml
                    </p>
                    <ClientFasting fasting={chart.fasting} history={chart.history} t={t} />
                    <form className="su-practice-goal" onSubmit={(event) => {
                        event.preventDefault();
                        run(async () => {
                            await setClientGoal(selected, {
                                kcal: Number(goal.kcal),
                                proteinG: Number(goal.proteinG),
                                carbG: Number(goal.carbG),
                                fatG: Number(goal.fatG),
                                waterMl: goal.waterMl === '' ? null : Number(goal.waterMl),
                            });
                            await openClient(selected);
                        });
                    }}>
                        {[['kcal', 'kcal', true], ['proteinG', 'Proteína (g)', true], ['carbG', 'Carboidratos (g)', true], ['fatG', 'Gorduras (g)', true], ['waterMl', 'Água (ml)', false]].map(([key, label, required]) => (
                            <label key={key} className="su-practice-goal-field">
                                <span>{label}</span>
                                <input aria-label={key} inputMode="decimal" value={goal[key]} onChange={(event) => setGoal({ ...goal, [key]: event.target.value })} required={required} />
                            </label>
                        ))}
                        <button className="su-btn su-btn-primary" type="submit">{t('parity.practice.saveGoal')}</button>
                    </form>
                    <button type="button" className="su-btn su-btn-secondary" onClick={() => run(async () => {
                        await endNutritionRelationship(selected);
                        setSelected(null);
                        setChart(null);
                        await load();
                    })}>{t('parity.practice.end')}</button>
                </section>
            )}
        </section>
    );
}
