import type { ChangeEvent, ReactElement } from 'react';
import type { DashboardClientRow, StoredMessage } from './types';
import ActivityRings from './athlete/ActivityRings';
import { proCopy } from './athlete/proCopy';

export type ProfessionalDashboardState = {
  userName: string;
  query: string;
  onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
  filter: string;
  onFilterChange: (label: string) => void;
  clients: DashboardClientRow[];
  filtered: DashboardClientRow[];
  loadError: string;
  todayCount: number;
  pending: number;
  adherence: number;
  feedback: StoredMessage[];
  appointments: DashboardClientRow[];
  language: string;
  tr: (text: string) => string;
  onOpenClient: (id: string | number) => void;
  onOpenMessages: () => void;
  onEnrollClient: () => void;
  onNewWorkout: () => void;
  onOpenClients: () => void;
};

/** Filter keys stay in Portuguese: the container compares against them. */
const FILTERS = [
  ['Todos', 'all'],
  ['Atrasados', 'late'],
  ['Revisão', 'review'],
] as const;

function filterCount(label: string, clients: DashboardClientRow[], pending: number): number {
  if (label === 'Todos') return clients.length;
  if (label === 'Atrasados') return clients.filter(client => Number(client.compliance) < 50).length;
  return pending;
}

const initials = (name?: string) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?';

export function ProfessionalDashboardMarkup({ state }: { state: ProfessionalDashboardState }): ReactElement {
  const {
    userName, query, onQueryChange, filter, onFilterChange, clients, filtered, loadError, todayCount, pending,
    adherence, feedback, appointments, language, onOpenClient, onOpenMessages, onEnrollClient, onNewWorkout, onOpenClients,
  } = state;
  const c = proCopy(language);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? c.morning : hour < 18 ? c.afternoon : c.evening;
  const firstName = (userName || '').trim().split(/\s+/)[0];
  const dateLabel = now.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });

  const compliance = (client: DashboardClientRow) => Number(client.compliance || 0);
  const late = clients.filter(client => compliance(client) < 50).length;
  const watch = clients.filter(client => compliance(client) >= 50 && compliance(client) < 75).length;
  const onTrack = clients.length - late - watch;
  const share = (count: number) => (clients.length ? (count / clients.length) * 100 : 0);

  const displayed = filtered.slice(0, 6);
  const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) : '');

  return (
    <div className="ah" data-shell-content style={{ marginLeft: 256 }}>
      <main className="ah-page">
        {loadError ? <p role="alert" className="ah-alert">{loadError}</p> : null}

        <header className="ah-header ah-header-split" data-tour="pro-header">
          <div>
            <p className="ah-date">{dateLabel}</p>
            <h1>{greeting}{firstName ? `, ${firstName}` : ''}</h1>
            <p className="ah-lede">{c.summary(clients.length, pending)}</p>
          </div>
          <div className="ah-actions">
            <button type="button" className="ah-soft-cta" onClick={onEnrollClient}>
              <span className="material-symbols-outlined" aria-hidden="true">person_add</span>
              {c.enroll}
            </button>
            <button type="button" className="ah-solid-cta" onClick={onNewWorkout}>
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              {c.newWorkout}
            </button>
          </div>
        </header>

        <div className="ah-grid">
          <section className="ah-card ah-pro-adherence" data-tour="pro-metrics" aria-label={c.adherence}>
            <h3 className="ah-card-title">{c.adherence}</h3>
            {clients.length ? (
              <div className="ah-summary-body">
                <div className="ah-rings-wrap ah-center">
                  <ActivityRings
                    size={150}
                    stroke={16}
                    summary={`${c.adherence}: ${adherence}%`}
                    rings={[{ label: c.adherence, pct: adherence, color: 'var(--primary)' }]}
                  />
                  <span className="ah-center-value">{adherence}<small>%</small></span>
                </div>
                <dl className="ah-legend">
                  <div style={{ ['--dot' as string]: 'var(--accent)' }}><dt>{c.onTrack}</dt><dd>{onTrack}</dd></div>
                  <div style={{ ['--dot' as string]: 'var(--warning)' }}><dt>{c.watch}</dt><dd>{watch}</dd></div>
                  <div style={{ ['--dot' as string]: 'var(--error)' }}><dt>{c.late}</dt><dd>{late}</dd></div>
                </dl>
                <div className="ah-split" aria-hidden="true">
                  <i style={{ width: `${share(onTrack)}%`, background: 'var(--accent)' }} />
                  <i style={{ width: `${share(watch)}%`, background: 'var(--warning)' }} />
                  <i style={{ width: `${share(late)}%`, background: 'var(--error)' }} />
                </div>
              </div>
            ) : (
              <p className="ah-empty">{c.noData}</p>
            )}
          </section>

          <section className="ah-card ah-pro-today" aria-label={c.today}>
            <h3 className="ah-card-title">{c.today}</h3>
            <div className="ah-duo">
              <div>
                <span className="ah-duo-value">{todayCount}</span>
                <span className="ah-duo-label">{c.trained}</span>
              </div>
              <div>
                <span className="ah-duo-value">{pending}</span>
                <span className="ah-duo-label">{c.review}</span>
              </div>
            </div>
          </section>

          <section className="ah-card ah-pro-agenda" aria-label={c.agenda}>
            <div className="ah-card-head">
              <h3 className="ah-card-title">{c.agenda}</h3>
              <p className="ah-card-sub">{appointments.length}</p>
            </div>
            {appointments.length ? (
              <ul className="ah-list">
                {appointments.slice(0, 4).map(client => (
                  <li key={client.id}>
                    <span className="ah-time">{time(client.nextSessionAt)}</span>
                    <span className="ah-list-copy">
                      <strong>{client.name}</strong>
                      <small>{client.activePlan || c.noPlan}</small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ah-quote is-empty">{c.agendaEmpty}</p>
            )}
          </section>

          <section className="ah-card ah-pro-clients" data-tour="pro-clients" aria-label={c.clients}>
            <div className="ah-card-head ah-wrap">
              <h3 className="ah-card-title">{c.clients}</h3>
              <div className="ah-segmented" role="group">
                {FILTERS.map(([key, id]) => (
                  <button key={key} type="button" aria-pressed={filter === key} onClick={() => onFilterChange(key)}>
                    {c.filters[id]} <small>{filterCount(key, clients, pending)}</small>
                  </button>
                ))}
              </div>
            </div>
            <label className="ah-search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input type="search" placeholder={c.search} aria-label={c.search} value={query} onChange={onQueryChange} />
            </label>
            {displayed.length ? (
              <ul className="ah-rows">
                {displayed.map(client => (
                  <li key={client.id}>
                    <button type="button" onClick={() => onOpenClient(client.id)} aria-label={`${c.open}: ${client.name}`}>
                      <span className="ah-avatar" aria-hidden="true">{initials(client.name)}</span>
                      <span className="ah-list-copy">
                        <strong>{client.name}</strong>
                        <small>{client.goal || client.objective || c.goalMissing}</small>
                      </span>
                      <span className="ah-row-plan">{client.activePlan || c.noPlan}</span>
                      <span className="ah-meter" aria-label={`${compliance(client)}%`}>
                        <span className="ah-bar is-thin"><i style={{ width: `${Math.min(100, compliance(client))}%`, background: compliance(client) < 50 ? 'var(--error)' : compliance(client) < 75 ? 'var(--warning)' : 'var(--accent)' }} /></span>
                        <b>{compliance(client)}%</b>
                      </span>
                      <span className="material-symbols-outlined ah-chevron" aria-hidden="true">chevron_right</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ah-empty">{c.none}</p>
            )}
            <div className="ah-foot">
              <span>{c.showing(displayed.length, filtered.length)}</span>
              <button type="button" className="ah-link" onClick={onOpenClients}>{c.seeAll}</button>
            </div>
          </section>

          <section className="ah-card ah-pro-feedback" aria-label={c.feedback}>
            <div className="ah-card-head">
              <h3 className="ah-card-title">{c.feedback}</h3>
              <p className="ah-card-sub">{feedback.length}</p>
            </div>
            {feedback.length ? (
              <ul className="ah-list is-stacked">
                {feedback.slice(-3).map(message => (
                  <li key={message.id}>
                    <span className="ah-list-copy">
                      <strong>{message.clientName}</strong>
                      <small className="ah-clamp">{message.text}</small>
                    </span>
                    <button type="button" className="ah-link" onClick={onOpenMessages}>{c.reply}</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ah-quote is-empty">{c.feedbackEmpty}</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
