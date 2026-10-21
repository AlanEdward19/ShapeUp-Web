import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { listNotices, markNoticeRead } from '../../services/platformClient';

export default function NoticeInbox() {
    const { t } = useLanguage();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        listNotices({ pageSize: 30 })
            .then((page) => { if (active) setRows(page?.items ?? []); })
            .catch((err) => { if (active) setError(err.message || t('admin.hub.error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [t]);

    return (
        <section className="su-admin-ledger" data-testid="notice-inbox">
            <h1 className="su-page-title">{t('notices.title')}</h1>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {!loading && !error && rows.length === 0 && <p className="su-text-muted">{t('notices.empty')}</p>}
            <ul>
                {rows.map((notice) => (
                    <li key={notice.id} data-testid={`notice-${notice.id}`}>
                        <strong>{notice.title}</strong>
                        <div>{notice.body}</div>
                        {!notice.readAtUtc && (
                            <button type="button" className="su-btn su-btn-secondary" onClick={async () => {
                                setError('');
                                try {
                                    await markNoticeRead(notice.id);
                                    setRows((current) => current.map((item) => item.id === notice.id ? { ...item, readAtUtc: new Date().toISOString() } : item));
                                } catch (err) {
                                    setError(err.message || t('admin.hub.error'));
                                }
                            }}>{t('notices.read')}</button>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
