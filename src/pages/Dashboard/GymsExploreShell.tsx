import { useEffect, useMemo, useState, type ReactElement } from 'react';
import WorkspaceShellPage from '../../components/Workspace/WorkspaceShellPage';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useLanguage } from '../../contexts/LanguageContext';
import gymsCss from './gyms-explore/gymsExplore.css?inline';

type GymAddress = string | { street?: string; number?: string; city?: string };
type GymRecord = { id: string | number; name: string; address?: GymAddress };

const copy = {
  'pt-BR': { title: 'Academias', count: (n: number) => `${n} ${n === 1 ? 'academia' : 'academias'}`, search: 'Buscar por nome ou endereço', empty: 'Nenhuma academia encontrada.', noAddress: 'Endereço não informado', route: 'Traçar rota', map: 'Mapa das academias', list: 'Academias' },
  en: { title: 'Gyms', count: (n: number) => `${n} ${n === 1 ? 'gym' : 'gyms'}`, search: 'Search by name or address', empty: 'No gyms found.', noAddress: 'Address not provided', route: 'Get directions', map: 'Gym map', list: 'Gyms' },
  es: { title: 'Gimnasios', count: (n: number) => `${n} ${n === 1 ? 'gimnasio' : 'gimnasios'}`, search: 'Buscar por nombre o dirección', empty: 'No se encontraron gimnasios.', noAddress: 'Dirección no informada', route: 'Cómo llegar', map: 'Mapa de gimnasios', list: 'Gimnasios' },
} as const;

function formatAddress(gym: GymRecord): string {
  if (typeof gym.address === 'string') return gym.address;
  return [gym.address?.street, gym.address?.number, gym.address?.city].filter(Boolean).join(', ');
}

export default function GymsShell(): ReactElement {
  const { getGyms } = useGymManagementApi();
  const { language } = useLanguage() as { language: string };
  const c = copy[(language as keyof typeof copy) in copy ? (language as keyof typeof copy) : 'pt-BR'];
  const [gyms, setGyms] = useState<GymRecord[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<GymRecord['id'] | null>(null);

  useEffect(() => {
    let active = true;
    getGyms(undefined, 50, undefined)
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result) ? result : result?.items || result?.data || [];
        setGyms(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getGyms]);

  const filtered = useMemo(
    () => gyms.filter((gym) => `${gym.name} ${formatAddress(gym)}`.toLowerCase().includes(query.toLowerCase())),
    [gyms, query],
  );
  const selected = gyms.find((gym) => gym.id === selectedId) ?? null;
  const mapQuery = selected ? `${selected.name}, ${formatAddress(selected)}` : '';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'Brasil')}&output=embed`;

  return (
    <WorkspaceShellPage name="gyms" css={gymsCss}>
      <main className="gx" data-gym-page>
        <header className="gx-head">
          <div>
            <h1>{c.title}</h1>
            <p>{c.count(filtered.length)}</p>
          </div>
          <label className="gx-search">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              type="search"
              aria-label={c.search}
              placeholder={c.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </header>

        <div className="gx-layout">
          <ul className="gx-list" aria-label={c.list}>
            {filtered.map((gym) => (
              <li key={gym.id}>
                <button type="button" className="gx-item" aria-pressed={gym.id === selectedId} onClick={() => setSelectedId(gym.id)}>
                  <span className="gx-pin" aria-hidden="true">
                    <span className="material-symbols-outlined">pin_drop</span>
                  </span>
                  <span className="gx-copy">
                    <strong>{gym.name}</strong>
                    <small>{formatAddress(gym) || c.noAddress}</small>
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="gx-empty">{c.empty}</li>}
          </ul>

          <section className="gx-map" aria-label={c.map}>
            <div className="gx-frame">
              <iframe title={c.map} src={mapSrc} loading="lazy" />
              {selected && (
                <div className="gx-detail">
                  <div>
                    <strong>{selected.name}</strong>
                    <small>{formatAddress(selected) || c.noAddress}</small>
                  </div>
                  <a
                    className="gx-cta"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">directions</span>
                    {c.route}
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </WorkspaceShellPage>
  );
}
