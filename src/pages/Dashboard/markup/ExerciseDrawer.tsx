import type { ReactElement, RefObject } from 'react';
import { ExerciseDrawerSubstitutions } from './ExerciseDrawerSubstitutions';
import { ExerciseDrawerVideo } from './ExerciseDrawerVideo';
import type { ExerciseRecord, ExercisesShellState } from './ExercisesPublicMarkup';

type DrawerState = ExercisesShellState & { onEquivalentMissing?: () => void };

function ExerciseDrawerBackdrop({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): ReactElement {
  return (
    <div
      data-testid="drawer-backdrop"
      id="drawerBackdrop"
      className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] transition-opacity ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      hidden={!open}
    />
  );
}

function ExerciseDrawerActivation({
  muscles,
  muscleDetails,
}: {
  muscles: string[];
  muscleDetails?: ExerciseRecord['muscleDetails'];
}): ReactElement {
  const details = (muscleDetails || []).filter(
    (muscle) => typeof muscle === 'object' && Number.isFinite(muscle.activationPercent),
  );
  const agonistDetail = details[0];
  const synergyDetails = details.slice(1);
  const agonistName = agonistDetail?.muscleNamePt || agonistDetail?.muscleName || muscles[0] || '—';
  const synergistName =
    synergyDetails.map((item) => item.muscleNamePt || item.muscleName).filter(Boolean).join(', ') ||
    muscles.slice(1).join(', ') ||
    '—';
  const agonistPct = agonistDetail?.activationPercent;
  const synergyPct =
    synergyDetails.length > 0
      ? Math.round(
          synergyDetails.reduce((sum, item) => sum + Number(item.activationPercent), 0) / synergyDetails.length,
        )
      : undefined;

  const row = (id: string, label: string, percent: number | undefined, tone: 'terracotta' | 'muted') => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span id={id}>{label}</span>
        {typeof percent === 'number' ? <span className="font-mono text-text-muted">{percent}%</span> : null}
      </div>
      {typeof percent === 'number' ? (
        <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
          <div
            data-activation-bar
            className={`h-full rounded-full ${tone === 'terracotta' ? 'bg-brand-terracotta' : 'bg-text-muted'}`}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-2 pt-1 border-t border-border-subtle">
      <div className="flex items-center justify-between text-text-secondary font-mono text-[10px] uppercase tracking-wider">
        <span>Ativação Primária &amp; Sinergistas</span>
        <span className="text-text-muted" id="drawerUsageBadge">
          Biblioteca de exercícios
        </span>
      </div>
      {row('drawerAgonist', agonistName, agonistPct, 'terracotta')}
      {row('drawerSynergist', synergistName, synergyPct, 'muted')}
    </div>
  );
}

function ExerciseDrawerSteps({
  steps,
  fallbackText,
}: {
  steps?: ExerciseRecord['steps'];
  fallbackText?: string;
}): ReactElement {
  const items =
    steps?.length
      ? steps.map((step) => (typeof step === 'string' ? step : step.description || ''))
      : [fallbackText || 'Orientação não cadastrada.'];

  return (
    <section>
      <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
        Diretrizes Técnicas de Execução
      </h4>
      <ol className="space-y-2">
        {items.map((text, index) => {
          const numeral = String(index + 1).padStart(2, '0') + '.';
          return (
            <li key={index} className="flex gap-2" id={index === 0 ? 'drawerStep1' : undefined}>
              <span className="font-mono text-brand-terracotta font-semibold shrink-0">{numeral}</span>
              <span className="text-text-secondary text-[11px] leading-relaxed">{text}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ExerciseDrawer({ state }: { state: DrawerState }): ReactElement {
  const active = state.active;
  const drawer = {
    drawerCode: active ? `EX-${active.id}` : '—',
    drawerTitle: active?.name || 'Selecione um exercício',
    drawerPattern: active?.type || 'Exercício',
    drawerPrimaryMuscle: active?.muscles?.join(', ') || '—',
    drawerSets: 'Definir na ficha',
    drawerReps: 'Definir na ficha',
    drawerRest: 'Definir na ficha',
    drawerError: active?.precautions || '—',
    drawerStep1: active?.descriptionPt || active?.description || 'Orientação não cadastrada.',
  };

  return (
    <>
      <ExerciseDrawerBackdrop open={state.open} onClose={state.close} />
      <aside
        className="w-[460px] max-w-full shrink-0 border-l border-border-subtle bg-surface flex flex-col h-full shadow-2xl transition-all duration-300 z-20"
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
              <span className="font-mono text-[10px] text-brand-terracotta font-semibold" id="drawerCode">
                {drawer.drawerCode}
              </span>
              <span className="text-border-subtle">·</span>
              <span className="font-mono text-[10px] text-text-muted uppercase" id="drawerPattern">
                {drawer.drawerPattern}
              </span>
            </div>
            <h2 className="font-condensed font-bold text-lg text-text-primary leading-tight truncate" id="drawerTitle">
              {drawer.drawerTitle}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5" id="drawerPrimaryMuscle">
              {drawer.drawerPrimaryMuscle}
            </p>
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
          <ExerciseDrawerVideo videoUrl={active?.videoUrl} title={drawer.drawerTitle} />

          <div
            data-drawer-stats
            className="border-y divide-x divide-border-subtle grid grid-cols-3 py-2 text-center"
          >
            <div>
              <span className="block font-mono text-[10px] uppercase text-text-muted">Séries</span>
              <span className="font-mono text-xs font-semibold text-text-primary" id="drawerSets">
                {drawer.drawerSets}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-text-muted">Repetições</span>
              <span className="font-mono text-xs font-semibold text-text-primary" id="drawerReps">
                {drawer.drawerReps}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-text-muted">Descanso</span>
              <span className="font-mono text-xs font-semibold text-text-primary" id="drawerRest">
                {drawer.drawerRest}
              </span>
            </div>
          </div>

          <ExerciseDrawerActivation muscles={active?.muscles || []} muscleDetails={active?.muscleDetails} />

          <ExerciseDrawerSteps steps={active?.steps} fallbackText={drawer.drawerStep1} />

          <div className="p-3 rounded-md bg-surface-muted border-l-2 border-brand-ochre space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ochre font-semibold block">
              Ponto Crítico &amp; Compensações
            </span>
            <p className="text-text-secondary text-[11px] leading-relaxed" id="drawerError">
              {drawer.drawerError}
            </p>
          </div>

          <ExerciseDrawerSubstitutions
            equivalents={active?.equivalents}
            exercises={state.exerciseLookup ?? state.exercises}
            onSelect={(ex) => {
              const target = (state.panelRef.current || document.body) as HTMLElement;
              state.inspect(ex, { currentTarget: target } as never);
            }}
            onNotFound={() => state.onEquivalentMissing?.()}
          />
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
    </>
  );
}
