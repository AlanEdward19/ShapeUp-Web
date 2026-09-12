import { useEffect, useState } from 'react';
import { MapPin, Search, Building2, ExternalLink } from 'lucide-react';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useLanguage } from '../../contexts/LanguageContext';

const addressOf = gym => typeof gym.address === 'string' ? gym.address : [gym.address?.street, gym.address?.number, gym.address?.city, gym.address?.state].filter(Boolean).join(', ');

export default function ExploreGyms() {
    const { language } = useLanguage();
    const pt = language === 'pt-BR';
    const { getGyms } = useGymManagementApi();
    const [gyms, setGyms] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(false);
        getGyms(undefined, 50).then(response => {
            if (!active) return;
            const items = Array.isArray(response) ? response : response?.items || response?.data || [];
            setGyms(items);
            setSelectedId(items[0]?.id ?? null);
            setCursor(response?.nextCursor || null);
        }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [getGyms, retry]);
    const filtered = gyms.filter(gym => `${gym.name || ''} ${addressOf(gym)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    const selected = filtered.find(gym => gym.id === selectedId) || filtered[0];
    const selectedAddress = selected ? addressOf(selected) : '';
    const mapQuery = selected ? [selected.name, selectedAddress].filter(Boolean).join(', ') : '';
    const loadMore = async () => {
        setLoading(true);
        try {
            const response = await getGyms(cursor, 50);
            setGyms(previous => [...previous, ...(response?.items || response?.data || [])]);
            setCursor(response?.nextCursor || null);
        } catch { setError(true); } finally { setLoading(false); }
    };
    return <div className="su-explore-page">
        <header className="su-dashboard-header-flex"><div><h1 className="su-page-title">{pt ? 'Explorar academias' : 'Explore gyms'}</h1><p className="su-page-subtitle">{pt ? 'Encontre seu próximo espaço de treino.' : 'Find your next training space.'}</p></div><span className="su-text-muted">{filtered.length} {pt ? 'unidades' : 'locations'}</span></header>
        <label className="su-explore-search"><Search size={18} /><input className="su-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={pt ? 'Buscar por academia, bairro ou cidade' : 'Search gym, neighborhood or city'} aria-label={pt ? 'Buscar academias' : 'Search gyms'} /></label>
        {error && <p role="alert" className="su-input-error-text">{pt ? 'Não foi possível carregar as academias.' : 'Could not load gyms.'} <button className="su-btn su-btn-secondary" onClick={() => setRetry(value => value + 1)}>{pt ? 'Tentar novamente' : 'Try again'}</button></p>}
        <div className="su-explore-layout"><section className="su-gym-results" aria-label={pt ? 'Academias' : 'Gyms'}>
            {loading && <p role="status">{pt ? 'Carregando unidades…' : 'Loading locations…'}</p>}
            {!loading && !filtered.length && <p className="su-explore-empty">{pt ? 'Nenhuma unidade encontrada. Experimente outra busca.' : 'No locations found. Try another search.'}</p>}
            {filtered.map(gym => <button type="button" key={gym.id} className={`su-gym-result ${selected?.id === gym.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(gym.id)} aria-pressed={selected?.id === gym.id}><Building2 size={20} /><h2>{gym.name}</h2><p><MapPin size={14} /> {addressOf(gym) || (pt ? 'Endereço não informado' : 'Address unavailable')}</p><span>{pt ? 'Ver localização →' : 'View location →'}</span></button>)}
            {cursor && <button className="su-btn su-btn-secondary" disabled={loading} onClick={loadMore}>{pt ? 'Carregar mais unidades' : 'Load more locations'}</button>}
        </section><section className="su-gym-map" aria-label={pt ? 'Mapa da academia selecionada' : 'Selected gym map'}>
            {selectedAddress ? <iframe title={pt ? 'Localização da academia' : 'Gym location'} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="su-map-empty"><MapPin size={32} /><p>{pt ? 'Selecione uma unidade com endereço para visualizar o mapa.' : 'Select a location with an address to view the map.'}</p></div>}
            {selected && <footer><div><strong>{selected.name}</strong><p>{selectedAddress}</p></div>{selectedAddress && <a className="su-btn su-btn-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {pt ? 'Abrir mapa' : 'Open map'}</a>}</footer>}
        </section></div>
    </div>;
}
