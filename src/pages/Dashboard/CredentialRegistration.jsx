import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { asList, getMyCredentials, resubmitCredential, submitCredential } from '../../services/parityClient';
import '../Admin/AdminLedger.css';

const REGIONS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function CredentialRegistration() {
    const { t } = useLanguage();
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [profession, setProfession] = useState('PersonalTrainer');
    const [number, setNumber] = useState('');
    const [region, setRegion] = useState('SP');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setRows(asList(await getMyCredentials()));
        } catch (err) {
            setError(err.message || t('admin.hub.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    const authority = profession === 'Nutritionist' ? 'CRN' : 'CREF';

    return (
        <section className="su-admin-ledger" data-testid="credential-registration">
            <h1 className="su-page-title">{t('parity.credential.title')}</h1>
            <p>{t('parity.credential.help')}</p>
            {loading && <p className="su-text-muted">{t('admin.hub.loading')}</p>}
            {error && <p className="su-input-error-text" role="alert">{error}</p>}
            {message && <p data-testid="credential-saved">{message}</p>}
            {!loading && rows.length === 0 && <p className="su-text-muted">{t('parity.credential.empty')}</p>}
            <ul>
                {rows.map((row) => (
                    <li key={row.id} data-testid={`credential-${row.id}`}>
                        <strong>{row.professionType}</strong>
                        <div>{row.issuingAuthority} {row.credentialNumber}/{row.issuingRegion} · {row.status}</div>
                        {row.changesRequestedMessage && <p>{row.changesRequestedMessage}</p>}
                        {String(row.status) === 'needsChanges' && (
                            <form onSubmit={async (event) => {
                                event.preventDefault();
                                setError('');
                                try {
                                    await resubmitCredential(row.id, { credentialNumber: number || row.credentialNumber, issuingRegion: region });
                                    setMessage(t('parity.credential.saved'));
                                    await load();
                                } catch (err) {
                                    setError(err.message || t('admin.hub.error'));
                                }
                            }}>
                                <input aria-label={t('parity.credential.number')} value={number} onChange={(event) => setNumber(event.target.value)} />
                                <select aria-label={t('parity.credential.region')} value={region} onChange={(event) => setRegion(event.target.value)}>
                                    {REGIONS.map((uf) => <option key={uf}>{uf}</option>)}
                                </select>
                                <button className="su-btn" type="submit">{t('parity.credential.resubmit')}</button>
                            </form>
                        )}
                    </li>
                ))}
            </ul>
            <form onSubmit={async (event) => {
                event.preventDefault();
                setError('');
                setMessage('');
                try {
                    await submitCredential({
                        professionType: profession,
                        credentialNumber: number,
                        issuingAuthority: authority,
                        issuingRegion: region,
                        country: 'BR',
                    });
                    setMessage(t('parity.credential.saved'));
                    setNumber('');
                    await load();
                } catch (err) {
                    setError(err.message || t('admin.hub.error'));
                }
            }}>
                <label>
                    {t('parity.credential.profession')}
                    <select value={profession} onChange={(event) => setProfession(event.target.value)} data-testid="credential-profession">
                        <option value="PersonalTrainer">CREF</option>
                        <option value="Nutritionist">CRN</option>
                    </select>
                </label>
                <input aria-label={t('parity.credential.number')} value={number} onChange={(event) => setNumber(event.target.value)} required maxLength={64} data-testid="credential-number" />
                <select aria-label={t('parity.credential.region')} value={region} onChange={(event) => setRegion(event.target.value)} data-testid="credential-region">
                    {REGIONS.map((uf) => <option key={uf}>{uf}</option>)}
                </select>
                <button className="su-btn" type="submit">{t('parity.credential.submit')}</button>
            </form>
        </section>
    );
}
