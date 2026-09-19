import type { ReactElement } from 'react';
import type { ExerciseEquivalent, ExerciseRecord } from './ExercisesPublicMarkup';

const EMPTY_COPY = 'Nenhuma substituição cadastrada para este exercício.';

function equipmentLabel(ex: ExerciseRecord): string {
  return (
    ex.equipment ||
    ex.equipments?.map((item) => item.equipmentName || item.equipmentNamePt).filter(Boolean).join(', ') ||
    'Não informado'
  );
}

function primaryMuscleLabel(ex: ExerciseRecord): string {
  return ex.muscles?.[0] || ex.muscleDetails?.[0]?.muscleName || ex.muscleDetails?.[0]?.muscleNamePt || '—';
}

export function ExerciseDrawerSubstitutions({
  equivalents,
  exercises,
  onSelect,
  onNotFound,
}: {
  equivalents?: ExerciseEquivalent[];
  exercises: ExerciseRecord[];
  onSelect: (ex: ExerciseRecord) => void;
  onNotFound: (exerciseId: number | string) => void;
}): ReactElement {
  const items = equivalents ?? [];

  return (
    <div className="pt-1 space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-brand-terracotta text-[16px]">sync_alt</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Substituições Mecânicas Equivalentes
        </span>
        {items.length ? (
          <span className="font-mono text-[10px] text-brand-olive">{items.length} opções</span>
        ) : null}
      </div>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((item) => {
            const match = exercises.find((ex) => String(ex.id) === String(item.exerciseId));
            return (
              <li key={String(item.exerciseId)}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded hover:bg-surface-subtle text-left"
                  onClick={() => {
                    if (match) onSelect(match);
                    else onNotFound(item.exerciseId);
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary truncate">{match?.name || `EX-${item.exerciseId}`}</p>
                    <p className="text-[11px] text-text-muted truncate">
                      {match ? primaryMuscleLabel(match) : '—'}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">{match ? equipmentLabel(match) : '—'}</p>
                    {item.matchLabel ? (
                      <p className="text-[11px] text-brand-olive">{item.matchLabel}</p>
                    ) : null}
                    {item.note ? <p className="text-[11px] text-text-secondary">{item.note}</p> : null}
                  </div>
                  <span className="material-symbols-outlined text-[17px] text-brand-terracotta">chevron_right</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-text-secondary text-[11px]" id="drawerSubs">
          {EMPTY_COPY}
        </p>
      )}
    </div>
  );
}
