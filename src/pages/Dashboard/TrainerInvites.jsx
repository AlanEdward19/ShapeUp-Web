import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { asList, listTrainerInvites, revokeTrainerInvite } from '../../services/parityClient';
import '../Admin/AdminLedger.css';

const canRevoke = (status) => String(status).toLowerCase() === 'invited' || String(status).toLowerCase() === 'pending';

export default function TrainerInvites() {
    const { t } = useLanguage();
    const { getMe } = useAuthorizationApi();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const me = await getMe();
            const trainerId = me.userId ?? me.id;
            setRows(asList(await listTrainerInvites(trainerId)));
        } catch (err) {
            setRows([]);
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [getMe, t]);

    useEffect(() => { load(); }, [load]);

    return (
        <section className="su-admin-ledger" data-testid="trainer-invites">
            <h1 className="su-page-title">{t('parity.invites.title')}</h1>
            <p>{t('parity.invites.help')}</p>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {!loading && !error && rows.length === 0 && <p className="su-text-muted" data-testid="invites-empty">{t('parity.invites.empty')}</p>}
            <ul>
                {rows.map((row) => (
                    <li key={row.inviteId} data-testid={`invite-${row.inviteId}`}>
                        <strong>{row.clientEmail}</strong>
                        <span> · {row.status}</span>
                        {canRevoke(row.status) && (
                            <button type="button" className="su-btn su-btn-secondary" onClick={async () => {
                                setError('');
                                try {
                                    const me = await getMe();
                                    await revokeTrainerInvite(me.userId ?? me.id, row.inviteId);
                                    await load();
                                } catch (err) {
                                    setError(err.message || t('admin.hub.error'));
                                }
                            }}>{t('parity.invites.revoke')}</button>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
