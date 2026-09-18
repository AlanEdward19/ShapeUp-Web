/* eslint-disable */
import type { KeyboardEvent, MouseEvent, ReactElement, RefObject } from 'react';
import WorkspaceNavigation from '../../shell-assets/WorkspaceNavigation';
import { ExerciseDrawer } from './ExerciseDrawer';

export type ExerciseEquivalent = {
  exerciseId: number | string;
  matchLabel?: string;
  note?: string;
};

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
  equivalents?: ExerciseEquivalent[];
};

export type ExercisesShellState = {
  exercises: ExerciseRecord[];
  /** Catalog plus GET equivalent records for drawer substitution lookup */
  exerciseLookup?: ExerciseRecord[];
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
  onEquivalentMissing?: (exerciseId?: number | string) => void;
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
                      background: state.equipment === value ? 'var(--border-color)' : 'transparent',
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

          <ExerciseDrawer state={state} />
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
