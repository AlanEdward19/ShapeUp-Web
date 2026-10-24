import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { listNotices, markNoticeRead } from '../../services/platformClient';
import { NOTICES_CHANGED } from '../../hooks/useUnreadNotices';
import './NoticeInbox.css';

const copy = {
    'pt-BR': { unread: (n) => (n === 1 ? '1 não lido' : `${n} não lidos`), allRead: 'Tudo em dia', markAll: 'Marcar todos como lidos', empty: 'Nenhum aviso por aqui.' },
    en: { unread: (n) => `${n} unread`, allRead: 'All caught up', markAll: 'Mark all as read', empty: 'No notices here.' },
    es: { unread: (n) => (n === 1 ? '1 sin leer' : `${n} sin leer`), allRead: 'Todo al día', markAll: 'Marcar todo como leído', empty: 'No hay avisos.' },
};

const announce = () => window.dispatchEvent(new Event(NOTICES_CHANGED));

export default function NoticeInbox() {
    const { t, language } = useLanguage();
    const c = copy[language] || copy['pt-BR'];
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

    const unreadRows = rows.filter((notice) => !notice.readAtUtc);

    const markRead = async (ids) => {
        setError('');
        try {
            await Promise.all(ids.map((id) => markNoticeRead(id)));
            const now = new Date().toISOString();
            setRows((current) => current.map((item) => (ids.includes(item.id) ? { ...item, readAtUtc: now } : item)));
            announce();
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        }
    };

    const when = (notice) => {
        const stamp = notice.createdAtUtc || notice.sentAtUtc;
        return stamp ? new Date(stamp).toLocaleDateString(language, { day: '2-digit', month: 'short' }) : '';
    };

    return (
        <section className="ni" data-testid="notice-inbox">
            <header className="ni-head">
                <div>
                    <h1>{t('notices.title')}</h1>
                    {!loading && !error && <p>{unreadRows.length ? c.unread(unreadRows.length) : c.allRead}</p>}
                </div>
                {unreadRows.length > 1 && (
                    <button type="button" className="ni-link" onClick={() => markRead(unreadRows.map((notice) => notice.id))}>{c.markAll}</button>
                )}
            </header>

            {loading && <p className="ni-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="ni-error" role="alert">{error}</p>}
            {!loading && !error && rows.length === 0 && (
                <div className="ni-empty">
                    <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
                    <p>{c.empty}</p>
                </div>
            )}

            <ul className="ni-list">
                {rows.map((notice) => (
                    <li key={notice.id} className="ni-item" data-unread={!notice.readAtUtc || undefined} data-testid={`notice-${notice.id}`}>
                        <span className="ni-dot" aria-hidden="true" />
                        <div className="ni-copy">
                            <div className="ni-title">
                                <strong>{notice.title}</strong>
                                <time>{when(notice)}</time>
                            </div>
                            <p>{notice.body}</p>
                            {!notice.readAtUtc && (
                                <button type="button" className="ni-link" onClick={() => markRead([notice.id])}>{t('notices.read')}</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
