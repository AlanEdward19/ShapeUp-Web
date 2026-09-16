import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent, type ReactElement } from 'react';
import WorkspaceShellPage from '../../components/Workspace/WorkspaceShellPage';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { GymsExploreChrome } from './gyms-explore/GymsExploreChrome';

const gymsMobileCss =
  '@media(max-width:767px){[data-gym-page]{height:auto!important;overflow:visible!important}[data-gym-layout]{flex-direction:column!important;overflow:visible!important}[data-gym-list]{width:100%!important;border-right:0}[data-gym-map]{height:500px;min-height:500px;flex:none!important;width:100%}.shell-body article{max-width:100%}.shell-body article>div{flex-wrap:wrap;gap:8px}.shell-body header{padding:16px;gap:12px}.shell-body header input{min-width:0}.shell-body header>div{max-width:100%;overflow:auto}}';

type GymAddress = string | { street?: string; number?: string; city?: string };
type GymRecord = { id: string | number; name: string; address?: GymAddress };

function formatAddress(gym: GymRecord): string {
  if (typeof gym.address === 'string') return gym.address;
  return [gym.address?.street, gym.address?.number, gym.address?.city].filter(Boolean).join(', ');
}

export default function GymsShell(): ReactElement {
  const { getGyms } = useGymManagementApi();
  const [gyms, setGyms] = useState<GymRecord[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<GymRecord | null>(null);

  useEffect(() => {
    let active = true;
    getGyms(undefined, 50, undefined)
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result) ? result : result?.items || result?.data || [];
        setGyms(list);
        setSelected(list[0] || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getGyms]);

  const filtered = useMemo(
    () =>
      gyms.filter((gym) =>
        `${gym.name} ${formatAddress(gym)}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [gyms, query],
  );

  const mapQuery = selected ? `${selected.name}, ${formatAddress(selected)}` : '';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'Brasil')}&output=embed`;

  const openMaps = () => {
    if (!selected) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    if (button && /Waze|Maps|Ver Espaço/.test(button.textContent || '')) {
      event.preventDefault();
      openMaps();
    }
  };

  return (
    <WorkspaceShellPage name="gyms" css={gymsMobileCss} onBodyClick={onBodyClick}>
      <GymsExploreChrome
        query={query}
        onQueryChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        listColumn={
          <>
            {filtered.map((gym) => (
              <article
                key={gym.id}
                className="bg-surface-panel border rounded-lg p-4 relative shadow-md transition-all cursor-pointer"
                style={{ borderColor: gym.id === selected?.id ? '#e06c43' : '#3a2d27' }}
                onClick={() => setSelected(gym)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-headline font-bold text-lg tracking-tight text-on-surface leading-tight">
                      {gym.name}
                    </h3>
                    <p className="text-xs text-on-surface-muted mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">pin_drop</span>
                      {formatAddress(gym) || 'Endereço não informado'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {gyms.length === 0 && <p className="text-on-surface-muted">Nenhuma academia disponível.</p>}
          </>
        }
        mapColumn={
          <div
            data-gym-map
            className="flex-1 relative bg-[#171311] overflow-hidden flex flex-col justify-between"
            style={{ position: 'relative', minWidth: 0 }}
          >
            <iframe
              title="Mapa das academias"
              style={{
                width: '100%',
                height: '100%',
                minHeight: 500,
                border: 0,
                filter: 'grayscale(.7) invert(.9) hue-rotate(170deg)',
              }}
              src={mapSrc}
            />
            {selected && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 20,
                  right: 20,
                  background: '#211a17',
                  padding: 20,
                  border: '1px solid #3a2d27',
                  borderRadius: 8,
                }}
              >
                <strong>{selected.name}</strong>
                <p style={{ fontSize: 13, margin: '8px 0' }}>{formatAddress(selected)}</p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#e06c43', fontSize: 13 }}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}
                >
                  Traçar rota
                </a>
              </div>
            )}
          </div>
        }
      />
    </WorkspaceShellPage>
  );
}
