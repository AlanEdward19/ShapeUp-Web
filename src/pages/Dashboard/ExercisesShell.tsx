import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import SuggestExerciseModal from '../../components/SuggestExerciseModal';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { useExercises } from '../../hooks/useExercises';
import { useLanguage } from '../../contexts/LanguageContext';
import { exerciseKind, exerciseMatchesMuscleFilter, getCatalogLanguage, pickLocalized } from '../../utils/exerciseCatalog';
import { MUSCLE_GROUPS } from '../../components/anatomy/muscleRegions';
import { mapExerciseEquivalents } from '../../utils/exerciseEquivalents';
import { resolveEquivalentSelection } from './resolveEquivalentSelection';
import athleteHomeCss from './operational-dashboard/athlete/athleteHome.css?inline';
import libraryCss from './markup/exercisesLibrary.css?inline';
import DashboardShellHost from '../shell-assets/DashboardShellHost';
import { workspaceNavStyle } from '../shell-assets/workspaceNavStyle';
import { ExercisesPublicMarkup, type ExerciseRecord } from './markup/ExercisesPublicMarkup';

const drawerCss = `#exerciseDrawer{position:fixed;right:0;top:0;bottom:0;width:min(460px,100vw);height:100dvh;z-index:90;transform:translateX(100%);visibility:hidden;transition:transform 240ms cubic-bezier(.32,.72,0,1),visibility 0s 240ms}#exerciseDrawer[data-open=true]{transform:translateX(0);visibility:visible;transition-delay:0s}#exerciseDrawer .aspect-square{aspect-ratio:1/1;width:100%}#drawerBackdrop{position:fixed;inset:0;z-index:85;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}#drawerBackdrop[hidden]{display:none}@media(prefers-reduced-motion:reduce){#exerciseDrawer{transform:none;opacity:0;transition:opacity 150ms ease,visibility 0s 150ms}#exerciseDrawer[data-open=true]{opacity:1;transition-delay:0s}}`;

const normalize = (value: string) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function ExercisesShell() {
  const langCtx = useLanguage();
  const language = langCtx?.language || getCatalogLanguage();
  const t = langCtx?.t ?? ((key: string) => key);
  const { exercises: exerciseList, loading, error, searchTerm, setSearchTerm } = useExercises();
  const { getExerciseEquivalents, getExerciseById } = useTrainingApi();
  const exercises = exerciseList as ExerciseRecord[];
  const equipmentName = useCallback(
    (ex: ExerciseRecord) =>
      ex.equipment ||
      ex.equipments?.map((item) => pickLocalized(language, item.equipmentName, item.equipmentNamePt)).filter(Boolean).join(', ') ||
      t('exlib.equipment.unknown'),
    [language, t],
  );
  const [equivalentRecords, setEquivalentRecords] = useState<ExerciseRecord[]>([]);
  const inspectRequestRef = useRef(0);
  const [group, setGroup] = useState('all');
  const [kind, setKind] = useState('all');
  const [muscles, setMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState('all');
  const [selected, setSelected] = useState<ExerciseRecord | null>(null);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement | null>(null);
  const [sort, setSort] = useState('name');
  const [view, setView] = useState<'list' | 'cards'>('list');
  const [notice, setNotice] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) panel.current?.querySelector('button')?.focus();
  }, [open, selected?.id]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const loadEquivalentsFor = useCallback(
    async (exerciseId: number | string) => {
      const requestId = ++inspectRequestRef.current;
      try {
        const payload = await getExerciseEquivalents(exerciseId);
        if (inspectRequestRef.current !== requestId) return;
        const { equivalents, records } = mapExerciseEquivalents(payload, language);
        if (records.length) {
          setEquivalentRecords((prev) => {
            const byId = new Map(prev.map((item) => [String(item.id), item]));
            records.forEach((rec) => byId.set(String(rec.id), rec));
            return [...byId.values()];
          });
        }
        setSelected((prev) =>
          prev && String(prev.id) === String(exerciseId) ? { ...prev, equivalents } : prev,
        );
      } catch {
        if (inspectRequestRef.current !== requestId) return;
        setSelected((prev) =>
          prev && String(prev.id) === String(exerciseId) ? { ...prev, equivalents: [] } : prev,
        );
      }
    },
    [getExerciseEquivalents, language],
  );

  const inspect = (ex: ExerciseRecord, event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    trigger.current = event.currentTarget;
    setSelected({ ...ex, equivalents: [] });
    setOpen(true);
    void loadEquivalentsFor(ex.id);
  };

  const exerciseLookup = useMemo(() => {
    const byId = new Map<string, ExerciseRecord>();
    exercises.forEach((ex) => byId.set(String(ex.id), ex));
    equivalentRecords.forEach((ex) => byId.set(String(ex.id), ex));
    return [...byId.values()];
  }, [exercises, equivalentRecords]);

  const filtered = useMemo(() => {
    const list = exercises.filter(
      (ex) =>
        normalize([ex.name, ...ex.muscles, equipmentName(ex)].join(' ')).includes(normalize(searchTerm)) &&
        (group === 'all' || exerciseMatchesMuscleFilter(ex, group)) &&
        (kind === 'all' || exerciseKind(ex) === kind) &&
        (kind === 'cardio' || muscles.length === 0 || muscles.some((muscle) => exerciseMatchesMuscleFilter(ex, muscle))) &&
        (equipment === 'all' || normalize(equipmentName(ex)).includes(normalize(equipment))),
    );
    list.sort((a, b) =>
      (sort === 'muscles' ? a.muscles.join(', ') : a.name).localeCompare(
        sort === 'muscles' ? b.muscles.join(', ') : b.name,
      ),
    );
    return list;
  }, [exercises, searchTerm, group, kind, muscles, equipment, sort, equipmentName]);

  const toggleMuscleGroup = (groupKey: string) =>
    setMuscles((current) => {
      const leaves = MUSCLE_GROUPS[groupKey as keyof typeof MUSCLE_GROUPS] ?? [];
      const active = current.includes(groupKey) || leaves.some((leaf) => current.includes(leaf));
      return active ? current.filter((item) => item !== groupKey && !leaves.includes(item)) : [...current, groupKey];
    });

  /** Narrowing a whole group down to one portion, like the mobile chips. */
  const toggleMuscleLeaf = (groupKey: string, leaf: string) =>
    setMuscles((current) => {
      if (current.includes(groupKey)) return [...current.filter((item) => item !== groupKey), leaf];
      return current.includes(leaf) ? current.filter((item) => item !== leaf) : [...current, leaf];
    });

  const clearFilters = () => {
    setKind('all');
    setMuscles([]);
    setGroup('all');
    setEquipment('all');
    setSearchTerm('');
  };

  const add = (ex: ExerciseRecord | null | undefined) => {
    if (ex) navigate('/dashboard/training', { state: { create: true, exercise: ex } });
  };

  const onCopyDetails = async () => {
    const active = selected;
    try {
      await navigator.clipboard.writeText(
        [active?.name, active?.descriptionPt || active?.description].filter(Boolean).join('\n'),
      );
      setNotice('Detalhes copiados.');
    } catch {
      setNotice('Não foi possível copiar os detalhes.');
    }
  };

  const shellState = {
    exercises,
    exerciseLookup,
    filtered,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    group,
    setGroup,
    kind,
    setKind,
    muscles,
    toggleMuscleGroup,
    toggleMuscleLeaf,
    clearFilters,
    equipment,
    setEquipment,
    sort,
    setSort,
    view,
    setView,
    active: selected,
    open,
    panelRef: panel,
    inspect,
    close,
    add,
    notice,
    onCopyDetails,
    onSuggestOpen: () => setSuggesting(true),
    navOpen,
    setNavOpen,
    equipmentName,
    onEquivalentMissing: (exerciseId?: number | string) => {
      void resolveEquivalentSelection({
        exerciseId,
        exerciseLookup,
        getExerciseById,
        mapExerciseEquivalents,
        inspect,
        setNotice,
        missingNotice: t('exlib.toast.missing_equivalent'),
        inspectEventTarget: (panel.current || document.body) as HTMLElement,
      });
    },
  };

  return (
    <>
      <DashboardShellHost
        name="exercises"
        css={workspaceNavStyle + athleteHomeCss + libraryCss + drawerCss}
        after={
          <button
            type="button"
            className="sn-mobile"
            aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="material-symbols-outlined">{navOpen ? 'close' : 'menu'}</span>
          </button>
        }
      >
        <ExercisesPublicMarkup state={shellState} />
      </DashboardShellHost>
      {suggesting && <SuggestExerciseModal onClose={() => setSuggesting(false)} />}
    </>
  );
}
