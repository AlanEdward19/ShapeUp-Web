import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { useAuditLogsApi } from '../../hooks/api/useAuditLogsApi';
import { councilLookupUrl } from '../../utils/councilLookup';
import {
    approveCredential,
    assignUserRole,
    getAdminOverview,
    listCredentialsUnderReview,
    listRoleAssignments,
    listSafetyReports,
    listUsers,
    rejectCredential,
    requestCredentialChanges,
    resolveSafetyReport,
    revokeCredential,
    sendNotice,
    setUserActive,
    suspendCredential,
} from '../../services/platformClient';
import './AdminLedger.css';

const SECTIONS = ['overview', 'users', 'credentials', 'plans', 'catalog', 'safety', 'audit', 'notices'];

const itemsOf = (page) => page?.items ?? page?.Items ?? [];

async function runAction(setError, fallback, action) {
    setError('');
    try {
        await action();
    } catch (err) {
        setError(err?.message || fallback);
    }
}

export default function AdminConsole() {
    const { t } = useLanguage();
    const [params, setParams] = useSearchParams();
    const section = SECTIONS.includes(params.get('section')) ? params.get('section') : 'overview';
    const select = (next) => setParams({ section: next });

    return (
        <div className="su-admin-ledger" data-testid="admin-console">
            <span className="su-admin-kicker">{t('admin.hub.kicker')}</span>
            <h1 className="su-page-title">{t('admin.hub.title')}</h1>
            <nav aria-label={t('admin.hub.nav')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SECTIONS.map((id) => (
                    <button key={id} type="button" className="su-btn su-btn-secondary" aria-current={section === id ? 'page' : undefined} onClick={() => select(id)}>
                        {t(`admin.hub.section.${id}`)}
                    </button>
                ))}
                <Link className="su-btn su-btn-secondary" to="/dashboard/admin/food-moderation">{t('admin.hub.section.food')}</Link>
                <Link className="su-btn su-btn-secondary" to="/dashboard/admin/exercise-requests">{t('admin.hub.section.exerciseRequests')}</Link>
                <Link className="su-btn su-btn-secondary" to="/dashboard/admin/feature-flags">{t('admin.hub.section.flags')}</Link>
            </nav>
            {section === 'overview' && <OverviewSection />}
            {section === 'users' && <UsersSection />}
            {section === 'credentials' && <CredentialsSection />}
            {section === 'plans' && <PlansSection />}
            {section === 'catalog' && <CatalogSection />}
            {section === 'safety' && <SafetySection />}
            {section === 'audit' && <AuditSection />}
            {section === 'notices' && <NoticesSection />}
        </div>
    );
}

function Status({ loading, error, empty }) {
    const { t } = useLanguage();
    if (loading) return <p className="su-text-muted">{t('admin.hub.loading')}</p>;
    if (error) return <p className="su-input-error-text" role="alert">{error}</p>;
    if (empty) return <p className="su-text-muted" data-testid="admin-empty">{t('admin.hub.empty')}</p>;
    return null;
}

function OverviewSection() {
    const { t } = useLanguage();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        getAdminOverview()
            .then((result) => { if (active) setData(result); })
            .catch((err) => { if (active) setError(err.message || t('admin.hub.error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [t]);
    const status = <Status loading={loading} error={error} empty={false} />;
    if (status && (loading || error)) return status;
    const cards = [
        ['usersTotal', data?.usersTotal],
        ['usersActive', data?.usersActive],
        ['credentialsUnderReview', data?.credentialsUnderReview],
        ['openSafetyReports', data?.openSafetyReports],
    ];
    return (
        <section data-testid="admin-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {cards.map(([key, value]) => (
                <article key={key}>
                    <strong data-testid={`metric-${key}`}>{value ?? '-'}</strong>
                    <div>{t(`admin.metric.${key}`)}</div>
                </article>
            ))}
        </section>
    );
}

function UsersSection() {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const load = useCallback(async (term) => {
        setLoading(true);
        setError('');
        try {
            const page = await listUsers({ search: term, pageSize: 20 });
            setRows(itemsOf(page));
        } catch (err) {
            setRows([]);
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);
    useEffect(() => { load(''); }, [load]);
    return (
        <section>
            <form onSubmit={(event) => { event.preventDefault(); load(search); }}>
                <label>
                    {t('admin.users.search')}
                    <input value={search} onChange={(event) => setSearch(event.target.value)} data-testid="user-search" />
                </label>
                <button className="su-btn su-btn-secondary" type="submit">{t('admin.users.find')}</button>
            </form>
            <Status loading={loading} error={error} empty={!loading && !error && rows.length === 0} />
            <ul>
                {rows.map((user) => (
                    <li key={user.userId} data-testid={`user-${user.userId}`}>
                        <strong>{user.displayName || user.email}</strong>
                        <span> {user.email} · {user.isActive ? t('admin.users.active') : t('admin.users.inactive')}</span>
                        <button type="button" className="su-btn su-btn-secondary" onClick={() => runAction(setError, t('admin.hub.error'), async () => {
                            await setUserActive(user.userId, !user.isActive);
                            await load(search);
                        })}>
                            {user.isActive ? t('admin.users.deactivate') : t('admin.users.activate')}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function CredentialsSection() {
    const { t } = useLanguage();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setRows(itemsOf(await listCredentialsUnderReview({ pageSize: 20 })));
        } catch (err) {
            setRows([]);
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);
    useEffect(() => { load(); }, [load]);
    const act = async (fn) => {
        setError('');
        try { await fn(); await load(); }
        catch (err) { setError(err.message || t('admin.hub.error')); }
    };
    return (
        <section data-testid="credentials-queue">
            <Status loading={loading} error={error} empty={!loading && !error && rows.length === 0} />
            <label>
                {t('admin.credentials.reason')}
                <input value={reason} onChange={(event) => setReason(event.target.value)} data-testid="credential-reason" />
            </label>
            <ul>
                {rows.map((item) => {
                    const lookup = councilLookupUrl(item.issuingAuthority, item.issuingRegion);
                    return (
                        <li key={item.id} data-testid={`credential-${item.id}`}>
                            <strong>{item.requesterName || item.requesterEmail || item.userId}</strong>
                            <div>{item.professionType} · {item.issuingAuthority} {item.credentialNumber}/{item.issuingRegion}</div>
                            {lookup && (
                                <a href={lookup} target="_blank" rel="noreferrer" data-testid={`council-link-${item.id}`}>
                                    {t('admin.credentials.lookup')}
                                </a>
                            )}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button type="button" className="su-btn" onClick={() => act(() => approveCredential(item.id))}>{t('admin.food.approve')}</button>
                                <button type="button" className="su-btn su-btn-secondary" onClick={() => act(() => rejectCredential(item.id, reason || t('admin.credentials.defaultReason')))}>{t('admin.food.reject')}</button>
                                <button type="button" className="su-btn su-btn-secondary" onClick={() => act(() => requestCredentialChanges(item.id, reason || t('admin.credentials.defaultChanges')))}>{t('admin.credentials.changes')}</button>
                                <button type="button" className="su-btn su-btn-secondary" onClick={() => act(() => suspendCredential(item.id, reason || t('admin.credentials.defaultReason')))}>{t('admin.credentials.suspend')}</button>
                                <button type="button" className="su-btn su-btn-secondary" onClick={() => act(() => revokeCredential(item.id, reason || t('admin.credentials.defaultReason')))}>{t('admin.credentials.revoke')}</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

function PlansSection() {
    const { t } = useLanguage();
    const { getPlatformTiers, createPlatformTier } = useGymManagementApi();
    const [tiers, setTiers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('0');
    const [roleUserId, setRoleUserId] = useState('');
    const [role, setRole] = useState('trainer');
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [tierPage, assignmentPage] = await Promise.all([
                getPlatformTiers(undefined, 20),
                listRoleAssignments({ pageSize: 20 }),
            ]);
            setTiers(itemsOf(tierPage));
            setAssignments(itemsOf(assignmentPage));
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [getPlatformTiers, t]);
    useEffect(() => { load(); }, [load]);
    return (
        <section>
            <Status loading={loading} error={error} empty={false} />
            <h2>{t('admin.plans.tiers')}</h2>
            <ul>{tiers.map((tier) => <li key={tier.id}>{tier.name} · {tier.price} · {tier.targetRole}</li>)}</ul>
            <form onSubmit={(event) => {
                event.preventDefault();
                runAction(setError, t('admin.hub.error'), async () => {
                    await createPlatformTier({ name, description: null, targetRole: 'independentClient', price: Number(price), maxClients: null, maxTrainers: null });
                    setName('');
                    await load();
                });
            }}>
                <input aria-label={t('admin.plans.name')} value={name} onChange={(event) => setName(event.target.value)} required />
                <input aria-label={t('admin.plans.price')} value={price} onChange={(event) => setPrice(event.target.value)} />
                <button className="su-btn" type="submit">{t('admin.plans.create')}</button>
            </form>
            <h2>{t('admin.plans.assignments')}</h2>
            <ul>{assignments.map((row) => <li key={row.id}>#{row.userId} · {row.role} · {row.tierName || t('admin.plans.noTier')} · {row.isActive ? t('admin.users.active') : t('admin.users.inactive')}</li>)}</ul>
            {!loading && tiers.length === 0 && assignments.length === 0 && <p className="su-text-muted" data-testid="admin-empty">{t('admin.hub.empty')}</p>}
            <form onSubmit={(event) => {
                event.preventDefault();
                runAction(setError, t('admin.hub.error'), async () => {
                    await assignUserRole({ userId: Number(roleUserId), role, platformTierId: null });
                    setRoleUserId('');
                    await load();
                });
            }}>
                <input aria-label={t('admin.plans.userId')} value={roleUserId} onChange={(event) => setRoleUserId(event.target.value)} required />
                <select aria-label={t('admin.plans.role')} value={role} onChange={(event) => setRole(event.target.value)}>
                    {['trainer', 'nutritionist', 'gymOwner', 'admin', 'client', 'independentClient'].map((value) => <option key={value}>{value}</option>)}
                </select>
                <button className="su-btn su-btn-secondary" type="submit">{t('admin.plans.assign')}</button>
            </form>
        </section>
    );
}

function CatalogSection() {
    const { t } = useLanguage();
    const { getExercises, createExercise, deleteExercise, getEquipments, createEquipment, deleteEquipment } = useTrainingApi();
    const [exercises, setExercises] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [exerciseName, setExerciseName] = useState('');
    const [equipmentName, setEquipmentName] = useState('');
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [exercisePage, equipmentPage] = await Promise.all([
                getExercises(undefined, 20),
                getEquipments(undefined, 20),
            ]);
            setExercises(itemsOf(exercisePage));
            setEquipments(itemsOf(equipmentPage));
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [getExercises, getEquipments, t]);
    useEffect(() => { load(); }, [load]);
    return (
        <section>
            <Status loading={loading} error={error} empty={!loading && !error && exercises.length === 0 && equipments.length === 0} />
            <h2>{t('admin.catalog.exercises')}</h2>
            <ul>{exercises.map((item) => (
                <li key={item.id}>{item.namePt || item.name}
                    <button type="button" className="su-btn su-btn-secondary" onClick={() => runAction(setError, t('admin.hub.error'), async () => { await deleteExercise(item.id); await load(); })}>{t('admin.catalog.delete')}</button>
                </li>
            ))}</ul>
            <form onSubmit={(event) => {
                event.preventDefault();
                runAction(setError, t('admin.hub.error'), async () => {
                    await createExercise({ name: exerciseName, namePt: exerciseName, description: null, videoUrl: null, muscles: [], equipmentIds: [], steps: [], exerciseType: 'weightBased' });
                    setExerciseName('');
                    await load();
                });
            }}>
                <input aria-label={t('admin.catalog.exerciseName')} value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} required />
                <button className="su-btn" type="submit">{t('admin.catalog.addExercise')}</button>
            </form>
            <h2>{t('admin.catalog.equipments')}</h2>
            <ul>{equipments.map((item) => (
                <li key={item.id}>{item.namePt || item.name}
                    <button type="button" className="su-btn su-btn-secondary" onClick={() => runAction(setError, t('admin.hub.error'), async () => { await deleteEquipment(item.id); await load(); })}>{t('admin.catalog.delete')}</button>
                </li>
            ))}</ul>
            <form onSubmit={(event) => {
                event.preventDefault();
                runAction(setError, t('admin.hub.error'), async () => {
                    await createEquipment({ name: equipmentName, namePt: equipmentName, description: null });
                    setEquipmentName('');
                    await load();
                });
            }}>
                <input aria-label={t('admin.catalog.equipmentName')} value={equipmentName} onChange={(event) => setEquipmentName(event.target.value)} required />
                <button className="su-btn" type="submit">{t('admin.catalog.addEquipment')}</button>
            </form>
        </section>
    );
}

function SafetySection() {
    const { t } = useLanguage();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try { setRows(itemsOf(await listSafetyReports({ status: 'Open' }))); }
        catch (err) { setRows([]); setError(err.message || t('admin.hub.error')); }
        finally { setLoading(false); }
    }, [t]);
    useEffect(() => { load(); }, [load]);
    return (
        <section>
            <Status loading={loading} error={error} empty={!loading && !error && rows.length === 0} />
            <ul>
                {rows.map((report) => (
                    <li key={report.id} data-testid={`report-${report.id}`}>
                        <strong>{report.reason}</strong> · {report.targetType} · {report.details || ''}
                        <button type="button" className="su-btn" onClick={() => runAction(setError, t('admin.hub.error'), async () => { await resolveSafetyReport(report.id, 'Resolved', t('admin.safety.resolvedNote')); await load(); })}>{t('admin.safety.resolve')}</button>
                        <button type="button" className="su-btn su-btn-secondary" onClick={() => runAction(setError, t('admin.hub.error'), async () => { await resolveSafetyReport(report.id, 'Dismissed', t('admin.safety.dismissedNote')); await load(); })}>{t('admin.safety.dismiss')}</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function AuditSection() {
    const { t } = useLanguage();
    const { getAuditLogs } = useAuditLogsApi();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        getAuditLogs({ PageSize: 20 })
            .then((page) => { if (active) setRows(itemsOf(page)); })
            .catch((err) => { if (active) setError(err.message || t('admin.hub.error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [getAuditLogs, t]);
    return (
        <section>
            <Status loading={loading} error={error} empty={!loading && !error && rows.length === 0} />
            <ul>{rows.map((row) => <li key={row.id}>{row.httpMethod} {row.endpoint} · {row.statusCode} · {row.userEmail || '-'}</li>)}</ul>
        </section>
    );
}

function NoticesSection() {
    const { t } = useLanguage();
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    return (
        <form onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setMessage('');
            try {
                await sendNotice({ userId: Number(userId), title, body });
                setMessage(t('admin.notices.sent'));
                setTitle('');
                setBody('');
            } catch (err) {
                setError(err.message || t('admin.hub.error'));
            }
        }}>
            <p>{t('admin.notices.help')}</p>
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {message && <p data-testid="notice-sent">{message}</p>}
            <input aria-label={t('admin.plans.userId')} value={userId} onChange={(event) => setUserId(event.target.value)} required />
            <input aria-label={t('admin.notices.titleField')} value={title} onChange={(event) => setTitle(event.target.value)} required />
            <textarea aria-label={t('admin.notices.body')} value={body} onChange={(event) => setBody(event.target.value)} required />
            <button className="su-btn" type="submit">{t('admin.notices.send')}</button>
        </form>
    );
}
