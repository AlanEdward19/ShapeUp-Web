/* eslint-disable */
import type { KeyboardEvent, MouseEvent, ReactElement, RefObject } from 'react';
import WorkspaceNavigation from '../../dashboard-stitch/WorkspaceNavigation';

export type ExerciseRecord = {
  id: number | string;
  name: string;
  muscles: string[];
  equipments?: { equipmentNamePt?: string; equipmentName?: string }[];
  equipment?: string;
  type?: string;
  description?: string;
  descriptionPt?: string;
  instructions?: string[];
  steps?: (string | { description?: string })[];
  precautions?: string;
  videoUrl?: string;
  muscleDetails?: {
    muscleGroup?: number;
    muscleNamePt?: string;
    muscleName?: string;
    activationPercent?: number;
  }[];
};

export type ExercisesShellState = {
  exercises: ExerciseRecord[];
  filtered: ExerciseRecord[];
  loading: boolean;
  error: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  group: string;
  setGroup: (value: string) => void;
  equipment: string;
  setEquipment: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  view: 'list' | 'cards';
  setView: (value: 'list' | 'cards') => void;
  active: ExerciseRecord | null;
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  inspect: (ex: ExerciseRecord, event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  close: () => void;
  add: (ex: ExerciseRecord | null | undefined) => void;
  notice: string;
  onCopyDetails: () => void;
  onSuggestOpen: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  equipmentName: (ex: ExerciseRecord) => string;
};

function ExerciseRow({
  ex,
  state,
}: {
  ex: ExerciseRecord;
  state: ExercisesShellState;
}) {
  const active = state.active?.id === ex.id;
  const cardStyle =
    state.view === 'cards'
      ? { flexWrap: 'wrap' as const, padding: 20, borderLeftColor: active ? '#e06c43' : 'transparent' }
      : { borderLeftColor: active ? '#e06c43' : 'transparent' };

  return (
    <div
      className={`exercise-item group px-6 py-2.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle transition-colors border-l-2 ${
        active ? 'bg-surface-subtle' : 'border-transparent'
      }`}
      tabIndex={0}
      aria-controls="exerciseDrawer"
      aria-expanded={state.open && active}
      style={cardStyle}
      onClick={(event) => state.inspect(ex, event)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          state.inspect(ex, event);
        }
      }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="w-16 font-mono text-xs text-text-muted">EX-{ex.id}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-text-primary truncate group-hover:text-brand-terracotta transition-colors">
              {ex.name}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-text-muted truncate">
            <span className="text-text-secondary">{ex.muscles.join(', ')}</span>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4 w-2/5 justify-between px-2 text-xs">
        <span className="w-24 text-text-muted truncate">{state.equipmentName(ex)}</span>
        <span className="w-28 text-text-secondary truncate">{ex.type || '—'}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0 w-20 justify-end">
        <button
          type="button"
          className="p-1 rounded text-text-muted hover:text-brand-terracotta hover:bg-surface transition-colors"
          title="Inserir na Ficha"
          onClick={(event) => {
            event.stopPropagation();
            state.add(ex);
          }}
        >
          <span className="material-symbols-outlined text-[17px]">playlist_add</span>
        </button>
        <button type="button" className="p-1 rounded text-brand-terracotta transition-colors" title="Inspecionar">
          <span className="material-symbols-outlined text-[17px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export function ExercisesPublicMarkup({ state }: { state: ExercisesShellState }): ReactElement {
  const muscleOptions = ['all', ...new Set(state.exercises.flatMap((ex) => ex.muscles))];
  const equipmentOptions = ['all', ...new Set(state.exercises.map(state.equipmentName))];
  const active = state.active;
  const drawer = {
    drawerCode: active ? `EX-${active.id}` : '—',
    drawerTitle: active?.name || 'Selecione um exercício',
    drawerPattern: active?.type || 'Exercício',
    drawerPrimaryMuscle: active?.muscles?.join(', ') || '—',
    drawerAgonist: active?.muscles?.[0] || '—',
    drawerSynergist: active?.muscles?.slice(1).join(', ') || '—',
    drawerSets: 'Definir na ficha',
    drawerReps: 'Definir na ficha',
    drawerRest: 'Definir na ficha',
    drawerUsageBadge: 'Biblioteca de exercícios',
    drawerStep1: active?.descriptionPt || active?.description || 'Orientação não cadastrada.',
    drawerStep2: active?.instructions?.[1] || '—',
    drawerStep3: active?.instructions?.[2] || '—',
    drawerError: active?.precautions || '—',
    drawerSubs: 'Consulte a biblioteca para selecionar uma substituição.',
  };

  return (
    <>
      <WorkspaceNavigation flow open={state.navOpen} close={() => state.setNavOpen(false)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-base">
        <header className="h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-condensed text-xl font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <span>Biblioteca de Exercícios</span>
              <span className="text-xs font-mono font-normal text-text-muted">({state.exercises.length})</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded border border-border-subtle p-0.5 bg-surface-muted text-xs">
              <button
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-medium ${state.view === 'list' ? 'bg-surface text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                id="viewModeList"
                onClick={() => state.setView('list')}
              >
                Lista
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-medium ${state.view === 'cards' ? 'bg-surface text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                id="viewModeCards"
                onClick={() => state.setView('cards')}
              >
                Cards
              </button>
            </div>
            <div className="h-4 w-px bg-border-subtle" />
            <button
              type="button"
              className="h-8 px-3.5 bg-brand-terracotta hover:bg-brand-terracotta-hover text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              onClick={state.onSuggestOpen}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Novo Exercício</span>
            </button>
          </div>
        </header>

        <section className="bg-surface border-b border-border-subtle px-6 pt-3.5 pb-3 space-y-3 shrink-0">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-text-muted pointer-events-none">search</span>
            <input
              className="w-full h-9 pl-10 pr-20 bg-bg-base border border-border-subtle focus:border-brand-terracotta rounded text-xs text-text-primary placeholder:text-text-muted focus:ring-0 focus:outline-none transition-all"
              id="globalExerciseSearch"
              placeholder="Buscar exercício por nome, músculo ou equipamento..."
              type="text"
              value={state.searchTerm}
              onChange={(event) => state.setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="font-mono text-[10px] uppercase text-text-muted shrink-0 mr-1.5">Grupo:</span>
              {muscleOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="muscle-pill px-2.5 py-1 rounded text-xs shrink-0"
                  aria-pressed={state.group === value}
                  onClick={() => state.setGroup(value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: state.group === value ? '#e06c43' : 'transparent',
                    whiteSpace: 'nowrap',
                    color: state.group === value ? '#fff' : undefined,
                  }}
                >
                  {value === 'all' ? 'Todos' : value}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border-subtle flex-wrap gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-mono text-[10px] uppercase text-text-muted mr-1.5">Equipamento:</span>
                {equipmentOptions.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="equip-btn px-2 py-0.5 rounded text-[11px]"
                    aria-pressed={state.equipment === value}
                    onClick={() => state.setEquipment(value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: state.equipment === value ? '#3a2d27' : 'transparent',
                    }}
                  >
                    {value === 'all' ? 'Todos' : value}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
                <span>ORDENAR:</span>
                <select
                  className="bg-transparent text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer"
                  value={state.sort}
                  onChange={(event) => state.setSort(event.target.value)}
                >
                  <option value="name">Ordem Alfabética (A-Z)</option>
                  <option value="muscles">Grupo Muscular</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="flex-1 flex overflow-hidden relative">
          <section className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden min-w-0">
            <div className="px-6 py-2 border-b border-border-subtle bg-surface/50 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary font-medium font-mono text-xs" id="exerciseCountLabel">
                  {`${state.filtered.length} exercícios encontrados`}
                </span>
                <span className="text-border-subtle">|</span>
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-brand-terracotta">info</span>
                  Selecione uma linha para inspecionar guia biomecânico
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
                <span>ORDENAR:</span>
                <select
                  className="bg-surface-subtle border border-border-subtle rounded px-2 py-0.5 text-xs text-text-primary focus:ring-0 focus:outline-none"
                  value={state.sort}
                  onChange={(event) => state.setSort(event.target.value)}
                >
                  <option value="name">Ordem Alfabética (A-Z)</option>
                  <option value="muscles">Grupo Muscular</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-2 bg-surface-muted border-b border-border-subtle flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-text-muted select-none shrink-0">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="w-16">CÓDIGO</span>
                <span className="flex-1">EXERCÍCIO &amp; MÚSCULO ALVO</span>
              </div>
              <div className="hidden md:flex items-center gap-4 w-2/5 justify-between px-2">
                <span className="w-24">EQUIPAMENTO</span>
                <span className="w-28">PADRÃO MOTOR</span>
              </div>
              <div className="w-20 text-right pr-2">AÇÕES</div>
            </div>

            <div
              className="flex-1 overflow-y-auto divide-y divide-border-subtle"
              id="exerciseListContainer"
              style={
                state.view === 'cards'
                  ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', alignContent: 'start' }
                  : undefined
              }
            >
              {state.error ? (
                <p role="alert" className="p-6 text-text-muted">Não foi possível carregar a biblioteca. Tente novamente.</p>
              ) : state.loading ? (
                <p className="p-6 text-text-muted">Carregando biblioteca…</p>
              ) : state.filtered.length ? (
                state.filtered.map((ex) => <ExerciseRow key={ex.id} ex={ex} state={state} />)
              ) : (
                <p className="p-6 text-text-muted">Nenhum exercício encontrado.</p>
              )}
            </div>
          </section>

          <aside
            className="w-[390px] xl:w-[440px] shrink-0 border-l border-border-subtle bg-surface flex flex-col h-full shadow-2xl transition-all duration-300 z-20"
            id="exerciseDrawer"
            ref={state.panelRef as RefObject<HTMLElement>}
            data-open={state.open}
            inert={!state.open}
            aria-hidden={!state.open}
            aria-labelledby="drawerTitle"
            onKeyDown={(event) => {
              if (event.key === 'Escape') state.close();
            }}
          >
            <div className="p-4 border-b border-border-subtle bg-surface flex items-start justify-between">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-text-muted" id="drawerCode">{drawer.drawerCode}</span>
                  <span className="text-border-subtle">·</span>
                  <span className="font-mono text-[10px] text-text-muted uppercase" id="drawerPattern">{drawer.drawerPattern}</span>
                </div>
                <h2 className="font-condensed font-bold text-lg text-text-primary leading-tight truncate" id="drawerTitle">
                  {drawer.drawerTitle}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5" id="drawerPrimaryMuscle">{drawer.drawerPrimaryMuscle}</p>
              </div>
              <button
                type="button"
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                title="Fechar Painel"
                onClick={state.close}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              <div className="border border-border-subtle rounded divide-x divide-border-subtle grid grid-cols-3 bg-surface-muted py-2 text-center">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-text-muted">Séries</span>
                  <span className="font-mono text-xs font-semibold text-text-primary" id="drawerSets">{drawer.drawerSets}</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase text-text-muted">Repetições</span>
                  <span className="font-mono text-xs font-semibold text-text-primary" id="drawerReps">{drawer.drawerReps}</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase text-text-muted">Descanso</span>
                  <span className="font-mono text-xs font-semibold text-text-primary" id="drawerRest">{drawer.drawerRest}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border-subtle">
                <div className="flex items-center justify-between text-text-secondary font-mono text-[10px] uppercase tracking-wider">
                  <span>Ativação Primária &amp; Sinergistas</span>
                  <span className="text-text-muted" id="drawerUsageBadge">{drawer.drawerUsageBadge}</span>
                </div>
                <div>
                  <p id="drawerAgonist">{drawer.drawerAgonist}</p>
                  <p id="drawerSynergist">{drawer.drawerSynergist}</p>
                </div>
              </div>

              {active?.description && <p>{active.description}</p>}
              {active?.muscles?.length ? (
                <section>
                  <h4>Músculos</h4>
                  <p>{active.muscles.join(', ')}</p>
                </section>
              ) : null}
              {active?.muscleDetails
                ?.filter((muscle) => typeof muscle === 'object' && Number.isFinite(muscle.activationPercent))
                .map((muscle) => (
                  <p key={String(muscle.muscleGroup)}>
                    {muscle.muscleNamePt || muscle.muscleName}: {muscle.activationPercent}%
                  </p>
                ))}

              <section>
                <h4>Diretrizes Técnicas de Execução</h4>
                {active?.steps?.length ? (
                  <ol style={{ listStyle: 'decimal', paddingLeft: 20 }}>
                    {active.steps.map((step, index) => (
                      <li key={index} style={{ marginTop: 8 }}>
                        {typeof step === 'string' ? step : step.description}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p id="drawerStep1">{drawer.drawerStep1}</p>
                )}
              </section>

              {active?.videoUrl && /^https?:\/\//.test(active.videoUrl) && (
                <a href={active.videoUrl} target="_blank" rel="noopener noreferrer">Vídeo do exercício</a>
              )}

              <div className="p-2.5 rounded bg-surface-muted border-l-2 border-brand-ochre space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ochre font-semibold block">
                  Ponto Crítico &amp; Compensações
                </span>
                <p className="text-text-secondary text-[11px] leading-relaxed" id="drawerError">{drawer.drawerError}</p>
              </div>

              <div className="pt-1 space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">
                  Substituições Mecânicas Equivalentes
                </span>
                <p className="text-text-secondary text-[11px]" id="drawerSubs">{drawer.drawerSubs}</p>
              </div>
            </div>

            <div className="p-3 border-t border-border-subtle bg-surface flex items-center gap-2">
              <button
                type="button"
                className="flex-1 h-8 bg-brand-terracotta hover:bg-brand-terracotta-hover text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                onClick={() => state.add(active)}
              >
                <span className="material-symbols-outlined text-[16px]">playlist_add</span>
                <span>Adicionar à Ficha do Aluno</span>
              </button>
              <button
                type="button"
                className="h-8 px-2.5 border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary rounded text-xs transition-colors flex items-center gap-1"
                title="Copiar Parâmetros"
                onClick={state.onCopyDetails}
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copiar</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div
        className={`fixed bottom-5 right-5 bg-surface-subtle border border-border-strong text-text-primary px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2.5 transition-all duration-300 transform z-50 ${
          state.notice ? '' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        id="toastNotification"
        hidden={!state.notice}
      >
        <span className="material-symbols-outlined text-brand-olive text-[18px]">check_circle</span>
        <span id="toastMessage">{state.notice}</span>
      </div>
    </>
  );
}
