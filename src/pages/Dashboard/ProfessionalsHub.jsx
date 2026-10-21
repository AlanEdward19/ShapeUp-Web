import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { listProfessionalDirectory } from '../../services/platformClient';

const itemsOf = (page) => page?.items ?? [];

export default function ProfessionalsDirectory() {
    const { t } = useLanguage();
    const [profession, setProfession] = useState('');
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        listProfessionalDirectory({ professionType: profession || undefined, pageSize: 20 })
            .then((page) => { if (active) setRows(itemsOf(page)); })
            .catch((err) => { if (active) setError(err.message || t('admin.hub.error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [profession, t]);

    return (
        <section className="su-admin-ledger" data-testid="professionals-directory">
            <h1 className="su-page-title">{t('professionals.title')}</h1>
            <label>
                {t('professionals.filter')}
                <select value={profession} onChange={(event) => setProfession(event.target.value)}>
                    <option value="">{t('professionals.all')}</option>
                    <option value="PersonalTrainer">{t('professionals.trainer')}</option>
                    <option value="Nutritionist">{t('professionals.nutritionist')}</option>
                </select>
            </label>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {!loading && !error && rows.length === 0 && <p className="su-text-muted">{t('professionals.empty')}</p>}
            <ul>
                {rows.map((row) => (
                    <li key={row.id}>
                        <strong>{row.requesterName || row.requesterEmail || `#${row.userId}`}</strong>
                        <div>{row.professionType} · {row.issuingAuthority} {row.credentialNumber}/{row.issuingRegion}</div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
