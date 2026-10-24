/* eslint-disable */
import type { KeyboardEvent, MouseEvent, ReactElement, RefObject } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import WorkspaceNavigation from '../../shell-assets/WorkspaceNavigation';
import { ExerciseDrawer } from './ExerciseDrawer';
import { exerciseKind, EXERCISE_KINDS } from '../../../utils/exerciseCatalog';
import { MUSCLE_GROUPS, groupDisplayName, leafDisplayName } from '../../../components/anatomy/muscleRegions';

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
  kind?: string;
  setKind?: (value: string) => void;
  muscles?: string[];
  toggleMuscleGroup?: (group: string) => void;
  toggleMuscleLeaf?: (group: string, leaf: string) => void;
  clearFilters?: () => void;
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

const copy = {
  'pt-BR': {
    kinds: { all: 'Todos', weight: 'Carga', cardio: 'Cardio', isometric: 'Isometria', stretch: 'Alongamento', mobility: 'Mobilidade' },
    searchLabel: 'Buscar exercício',
    type: 'Tipo',
    muscle: 'Músculo',
    clear: 'Limpar filtros',
    emptyTitle: 'Nenhum exercício encontrado',
    emptyBody: 'Tente outro nome ou remova os filtros.',
    equipment: 'Equipamento',
    allEquipment: 'Todos',
  },
  en: {
    kinds: { all: 'All', weight: 'Weights', cardio: 'Cardio', isometric: 'Isometric', stretch: 'Stretching', mobility: 'Mobility' },
    searchLabel: 'Search exercises',
    type: 'Type',
    muscle: 'Muscle',
    clear: 'Clear filters',
    emptyTitle: 'No exercises found',
    emptyBody: 'Try another name or remove the filters.',
    equipment: 'Equipment',
    allEquipment: 'All',
  },
  es: {
    kinds: { all: 'Todos', weight: 'Carga', cardio: 'Cardio', isometric: 'Isometría', stretch: 'Estiramiento', mobility: 'Movilidad' },
    searchLabel: 'Buscar ejercicio',
    type: 'Tipo',
    muscle: 'Músculo',
    clear: 'Limpiar filtros',
    emptyTitle: 'No se encontraron ejercicios',
    emptyBody: 'Prueba otro nombre o quita los filtros.',
    equipment: 'Equipamiento',
    allEquipment: 'Todos',
  },
} as const;

const sectionKey = (ex: ExerciseRecord, sort: string): string => {
  if (sort === 'muscles') return ex.muscles?.[0] || '—';
  const first = String(ex.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
};

function ExerciseRow({ ex, state, kindLabels }: { ex: ExerciseRecord; state: ExercisesShellState; kindLabels: Record<string, string> }) {
  const { t } = useLanguage();
  const active = state.active?.id === ex.id;
  const kind = exerciseKind(ex);
  const equipment = state.equipmentName(ex);
  // Weights are the default; only call out the other kinds so the list stays quiet.
  const subtitle = [(ex.muscles || []).slice(0, 2).join(', '), kind === 'weight' ? '' : kindLabels[kind], equipment].filter(Boolean).join(' · ');
  return (
    <li>
      <div
        className="exercise-item"
        role="button"
        tabIndex={0}
        aria-controls="exerciseDrawer"
        aria-expanded={state.open && active}
        data-active={active || undefined}
        onClick={(event) => state.inspect(ex, event)}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
            event.preventDefault();
            state.inspect(ex, event);
          }
        }}
      >
        <span className="ex-copy">
          <strong>{ex.name}</strong>
          <small>{subtitle}</small>
        </span>
        <button
          type="button"
          className="ex-add"
          title={t('exlib.row.insert')}
          aria-label={`${t('exlib.row.insert')}: ${ex.name}`}
          onClick={(event) => {
            event.stopPropagation();
            state.add(ex);
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">playlist_add</span>
        </button>
        <span className="material-symbols-outlined ex-chevron" aria-hidden="true">chevron_right</span>
      </div>
    </li>
  );
}

export function ExercisesPublicMarkup({ state }: { state: ExercisesShellState }): ReactElement {
  const { t, language } = useLanguage() as { t: (key: string, vars?: Record<string, unknown>) => string; language: string };
  const c = copy[(language as keyof typeof copy) in copy ? (language as keyof typeof copy) : 'pt-BR'];
  const kind = state.kind ?? 'all';
  const selected = state.muscles ?? [];
  const equipmentOptions = [...new Set(state.exercises.map(state.equipmentName))];
  const isGroupActive = (group: string) => selected.includes(group) || MUSCLE_GROUPS[group as keyof typeof MUSCLE_GROUPS].some((leaf) => selected.includes(leaf));
  const expanded = Object.entries(MUSCLE_GROUPS).filter(([group, leaves]) => leaves.length > 1 && isGroupActive(group));
  const sections = state.filtered.reduce<Array<[string, ExerciseRecord[]]>>((acc, ex) => {
    const key = sectionKey(ex, state.sort);
    const last = acc[acc.length - 1];
    if (last && last[0] === key) last[1].push(ex);
    else acc.push([key, [ex]]);
    return acc;
  }, []);
  const filtered = kind !== 'all' || selected.length > 0 || state.equipment !== 'all' || state.searchTerm !== '';

  return (
    <>
      <WorkspaceNavigation flow open={state.navOpen} close={() => state.setNavOpen(false)} />
      <div className="ah ex" data-shell-content style={{ marginLeft: 256 }}>
        <main className="ah-page ex-page">
          <header className="ah-header ah-header-split">
            <div>
              <h1>{t('exlib.title')}</h1>
              <p className="ah-lede" id="exerciseCountLabel">{t('exlib.count', { n: state.filtered.length })}</p>
            </div>
            <button type="button" className="ah-solid-cta" onClick={state.onSuggestOpen}>
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              {t('exlib.new')}
            </button>
          </header>

          <section className="ex-filters" aria-label="Filtros">
            <label className="ah-search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input
                id="globalExerciseSearch"
                type="search"
                aria-label={c.searchLabel}
                placeholder={t('exlib.search.placeholder')}
                value={state.searchTerm}
                onChange={(event) => state.setSearchTerm(event.target.value)}
              />
            </label>

            <div className="ex-segmented" role="group" aria-label={c.type}>
              {EXERCISE_KINDS.map((value) => (
                <button key={value} type="button" aria-pressed={kind === value} onClick={() => state.setKind?.(value)}>
                  {c.kinds[value as keyof typeof c.kinds]}
                </button>
              ))}
            </div>

            {kind !== 'cardio' && (
              <div className="ex-chips" role="group" aria-label={c.muscle}>
                {Object.keys(MUSCLE_GROUPS).map((group) => (
                  <button key={group} type="button" aria-pressed={isGroupActive(group)} onClick={() => state.toggleMuscleGroup?.(group)}>
                    {groupDisplayName(group, language)}
                  </button>
                ))}
              </div>
            )}

            {kind !== 'cardio' && expanded.map(([group, leaves]) => (
              <div key={group} className="ex-chips is-leaves" role="group" aria-label={groupDisplayName(group, language)}>
                <span>{groupDisplayName(group, language)}</span>
                {leaves.map((leaf) => (
                  <button key={leaf} type="button" aria-pressed={selected.includes(leaf)} onClick={() => state.toggleMuscleLeaf?.(group, leaf)}>
                    {leafDisplayName(leaf, language)}
                  </button>
                ))}
              </div>
            ))}

            <div className="ex-meta">
              <label>
                <span>{c.equipment}</span>
                <select value={state.equipment} onChange={(event) => state.setEquipment(event.target.value)}>
                  <option value="all">{c.allEquipment}</option>
                  {equipmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span>{t('exlib.sort')}</span>
                <select value={state.sort} onChange={(event) => state.setSort(event.target.value)}>
                  <option value="name">{t('exlib.sort.name')}</option>
                  <option value="muscles">{t('exlib.sort.muscles')}</option>
                </select>
              </label>
              {filtered && state.clearFilters && (
                <button type="button" className="ah-link" onClick={state.clearFilters}>{c.clear}</button>
              )}
            </div>
          </section>

          <div id="exerciseListContainer">
            {state.error ? (
              <p role="alert" className="ah-alert">{t('exlib.error')}</p>
            ) : state.loading ? (
              <p className="ah-empty">{t('exlib.loading')}</p>
            ) : state.filtered.length ? (
              <div className="ex-groups">
                {sections.map(([label, items]) => (
                  <section key={label} className="ex-group" aria-label={label}>
                    <h2>{label}</h2>
                    <ul className="ex-list">
                      {items.map((ex) => <ExerciseRow key={ex.id} ex={ex} state={state} kindLabels={c.kinds} />)}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <div className="ex-empty">
                <strong>{c.emptyTitle}</strong>
                <p>{t('exlib.empty') === 'exlib.empty' ? c.emptyBody : c.emptyBody}</p>
                {state.clearFilters && <button type="button" className="ah-soft-cta" onClick={state.clearFilters}>{c.clear}</button>}
              </div>
            )}
          </div>
        </main>
        <ExerciseDrawer state={state} />
      </div>
      <div className="ex-toast" id="toastNotification" hidden={!state.notice} role="status">
        <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
        <span id="toastMessage">{state.notice}</span>
      </div>
    </>
  );
}
