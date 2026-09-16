import type { ChangeEvent, ReactElement } from 'react';
import type { DashboardClientRow, StoredMessage } from './types';

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

const filterLabels = ['Todos', 'Atrasados', 'Revisão'] as const;

function filterCount(label: string, clients: DashboardClientRow[], pending: number): number {
  if (label === 'Todos') return clients.length;
  if (label === 'Atrasados') return clients.filter(client => Number(client.compliance) < 50).length;
  return pending;
}

export function ProfessionalDashboardMarkup({ state }: { state: ProfessionalDashboardState }): ReactElement {
  const {
    userName,
    query,
    onQueryChange,
    filter,
    onFilterChange,
    clients,
    filtered,
    loadError,
    todayCount,
    pending,
    adherence,
    feedback,
    appointments,
    language,
    tr,
    onOpenClient,
    onOpenMessages,
    onEnrollClient,
    onNewWorkout,
    onOpenClients,
  } = state;

  const displayed = filtered.slice(0, 4);
  const appointmentDateLabel = new Date().toLocaleDateString(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="sn-space flex min-h-screen flex-col flex-1 min-w-0" data-shell-content style={{ marginLeft: 256 }}>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-brand-border bg-brand-bg/95 px-8 backdrop-blur">
        <nav className="flex shrink-0 items-center gap-2 text-xs font-medium text-brand-muted">
          <span>Treinadores</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>{userName}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-brand-text">Visão Operacional</span>
        </nav>
        <div className="mx-4 max-w-lg flex-1">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-brand-muted">search</span>
            <input
              className="w-full rounded-md border border-brand-border bg-brand-surface py-1.5 pl-9 pr-12 text-xs text-brand-text placeholder-brand-muted transition-colors focus:border-brand-terracotta focus:outline-none"
              placeholder="Buscar aluno por nome, CPF ou objetivo..."
              type="search"
              value={query}
              onChange={onQueryChange}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-elevated"
            onClick={onEnrollClient}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ Matricular Aluno</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-brand-terracotta px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-terracottaHover"
            onClick={onNewWorkout}
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Novo Treino</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-8">
        {loadError ? <p role="alert">{loadError}</p> : null}

        <div className="flex flex-col justify-between gap-2 border-b border-brand-border/60 pb-1 sm:flex-row sm:items-baseline">
          <div>
            <h1 className="font-condensed text-3xl font-bold uppercase tracking-wide text-brand-text">Painel do Treinador</h1>
            <p className="mt-0.5 text-xs text-brand-secondary">
              {clients.length} alunos ativos • {pending} revisões pendentes • {feedback.length} feedbacks aguardando revisão
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-olive" />
            <span>Sincronização em tempo real ativa</span>
          </div>
        </div>

        <section className="grid grid-cols-1 divide-y divide-brand-border rounded-lg border border-brand-border bg-brand-surface sm:grid-cols-2 lg:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col justify-between p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Treinamento Hoje</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-condensed text-2xl font-bold tracking-wide text-brand-text">{todayCount} alunos</span>
              <span className="text-[11px] font-medium text-brand-olive">{todayCount} concluídos</span>
            </div>
            <p className="mt-1 text-xs text-brand-secondary">Sessões registradas hoje</p>
          </div>
          <div className="flex flex-col justify-between p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Revisões Pendentes</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-condensed text-2xl font-bold tracking-wide text-brand-ochre">{pending} fichas</span>
            </div>
            <p className="mt-1 text-xs text-brand-secondary">Necessitam ajuste de ciclo ou volume</p>
          </div>
          <div className="flex flex-col justify-between p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Adesão Semanal</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-condensed text-2xl font-bold tracking-wide text-brand-olive">{adherence}%</span>
            </div>
            <p className="mt-1 text-xs text-brand-secondary">Aderência registrada pelos alunos</p>
          </div>
          <div className="flex flex-col justify-between p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Próxima Sessão</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-condensed text-2xl font-bold tracking-wide text-brand-text">
                {appointments[0]
                  ? new Date(appointments[0].nextSessionAt!).toLocaleTimeString(language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </span>
              <span className="text-[11px] font-semibold text-brand-terracotta">{appointments[0]?.name || 'Sem agendamento'}</span>
            </div>
            <p className="mt-1 text-xs text-brand-secondary">Próximo atendimento</p>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <section className="flex flex-col rounded-lg border border-brand-border bg-brand-surface lg:col-span-8">
            <div className="flex flex-col justify-between gap-3 border-b border-brand-border p-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text">Carteira de Alunos &amp; Status Semanal</h2>
                <p className="mt-0.5 text-xs text-brand-secondary">Visão rápida de execução, consistência e ciclo vigente</p>
              </div>
              <div className="flex items-center gap-1 rounded border border-brand-border bg-brand-bg p-0.5">
                {filterLabels.map(label => {
                  const count = filterCount(label, clients, pending);
                  const active = filter === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`rounded px-2.5 py-1 text-xs font-medium ${active ? 'bg-brand-surface font-semibold text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}
                      aria-pressed={active}
                      onClick={() => onFilterChange(label)}
                    >
                      {tr(label)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            <div data-table-scroll className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/60 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                    <th className="px-4 py-2.5 font-semibold">Aluno &amp; Objetivo</th>
                    <th className="px-3 py-2.5 font-semibold">Último Treino</th>
                    <th className="px-3 py-2.5 font-semibold">Freq. Semanal</th>
                    <th className="px-3 py-2.5 font-semibold">Periodização</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/70">
                  {displayed.length ? (
                    displayed.map(client => (
                      <tr key={client.id} className="transition-colors hover:bg-brand-elevated/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand-border bg-brand-elevated text-xs font-bold"
                              style={{ display: 'grid', placeItems: 'center', background: '#29211d' }}
                            >
                              {(client.name || '?').slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-brand-text">{client.name}</p>
                              <p className="truncate text-[11px] text-brand-muted">
                                {client.goal || client.objective || 'Objetivo não informado'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-brand-secondary">
                          <span className="block font-medium text-brand-text">{client.lastCheckin || 'Sem registro'}</span>
                          <span className="text-[11px] text-brand-olive">{client.activePlan || 'Sem ficha'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-brand-olive">{client.compliance || 0}%</span>
                            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-brand-bg">
                              <div
                                className="h-full rounded-full bg-brand-olive"
                                style={{ width: `${Math.min(100, client.compliance || 0)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block font-medium text-brand-text">{client.activePlan || 'Sem periodização'}</span>
                          <span className="text-[11px] text-brand-muted">{client.phase || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded border border-brand-border bg-brand-elevated px-2.5 py-1 text-xs font-medium text-brand-text transition-colors hover:bg-brand-border"
                            onClick={() => onOpenClient(client.id)}
                          >
                            Abrir Ficha
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-brand-muted">Nenhum aluno encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-brand-border bg-brand-bg/40 p-3 text-xs text-brand-muted">
              <span>
                {tr('Exibindo')} {Math.min(4, filtered.length)} / {filtered.length}{' '}
                {tr('alunos em acompanhamento contínuo')}
              </span>
              <button type="button" className="flex items-center gap-1 font-semibold text-brand-terracotta hover:underline" onClick={onOpenClients}>
                <span>Ver listagem completa da carteira</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <section className="flex flex-col rounded-lg border border-brand-border bg-brand-surface">
              <div className="flex items-center justify-between border-b border-brand-border p-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">Agenda de Hoje</h3>
                  <p className="mt-0.5 text-xs text-brand-muted">{appointmentDateLabel}</p>
                </div>
                <span className="rounded border border-brand-border bg-brand-elevated px-2 py-0.5 text-xs font-semibold text-brand-secondary">
                  {appointments.length} sessões
                </span>
              </div>
              <div className="divide-y divide-brand-border">
                {appointments.length ? (
                  appointments.map(client => (
                    <div key={client.id} className="border-b border-brand-border p-4">
                      <strong className="text-xs text-brand-text">{client.name}</strong>
                      <p className="text-xs text-brand-secondary">
                        {new Date(client.nextSessionAt!).toLocaleTimeString(language, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {client.activePlan}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-brand-muted">Nenhum atendimento agendado para hoje.</p>
                )}
              </div>
            </section>

            <section className="flex flex-col rounded-lg border border-brand-border bg-brand-surface">
              <div className="border-b border-brand-border p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">Feedbacks em Aberto</h3>
                <p className="mt-0.5 text-xs text-brand-muted">{feedback.length} pendentes</p>
              </div>
              <div className="divide-y divide-brand-border">
                {feedback.length ? (
                  feedback.slice(-2).map(message => (
                    <div key={message.id} className="space-y-2.5 p-4">
                      <strong className="text-xs text-brand-text">{message.clientName}</strong>
                      <p className="rounded border border-brand-border bg-brand-bg p-2.5 text-xs text-brand-secondary">{message.text}</p>
                      <button type="button" className="text-xs font-semibold text-brand-terracotta" onClick={onOpenMessages}>
                        Responder Aluno
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-brand-muted">Nenhum feedback pendente.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
