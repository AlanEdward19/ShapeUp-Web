import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNutritionApi } from '../../../../hooks/api/useNutritionApi';
import { enqueueMutation } from '../../../../services/mutationQueue';
import { localDateKey, localDayUtcNoonIso } from '../../../../utils/weightHistory';

type Entry = { day: string; kg: number };

const KG_PER_LB = 1 / 2.2046226218;

const copy = {
  'pt-BR': { title: 'Peso corporal', none: 'Sem pesagens ainda', last: 'Última pesagem', log: 'Registrar peso de hoje', logPh: 'Peso de hoje', save: 'Salvar', target: 'Meta de peso', setTarget: 'Definir meta', editTarget: 'Alterar', toGo: 'faltam', reached: 'Meta atingida', recent: 'Pesagens recentes', cancel: 'Cancelar', targetPh: 'Meta' },
  en: { title: 'Body weight', none: 'No weigh-ins yet', last: 'Last weigh-in', log: "Log today's weight", logPh: "Today's weight", save: 'Save', target: 'Weight goal', setTarget: 'Set goal', editTarget: 'Change', toGo: 'to go', reached: 'Goal reached', recent: 'Recent weigh-ins', cancel: 'Cancel', targetPh: 'Goal' },
  es: { title: 'Peso corporal', none: 'Sin pesajes aún', last: 'Último pesaje', log: 'Registrar peso de hoy', logPh: 'Peso de hoy', save: 'Guardar', target: 'Meta de peso', setTarget: 'Definir meta', editTarget: 'Cambiar', toGo: 'faltan', reached: 'Meta alcanzada', recent: 'Pesajes recientes', cancel: 'Cancelar', targetPh: 'Meta' },
} as const;

function Sparkline({ points }: { points: number[] }): ReactElement | null {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points.map((value, index) => `${(index / (points.length - 1)) * 100},${34 - ((value - min) / span) * 28}`);
  return (
    <svg className="bw-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coords.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Body weight lives on Home, like the mobile app: latest value, trend, goal and a one-field log. */
export default function BodyWeightCard(): ReactElement {
  const { language, unitSystem } = useLanguage() as { language: string; unitSystem: string };
  const c = copy[(language as keyof typeof copy) in copy ? (language as keyof typeof copy) : 'pt-BR'];
  const { getWeightRegisters } = useNutritionApi();
  const clientId = localStorage.getItem('shapeup_client_id') || 1;
  const imperial = unitSystem === 'imperial';
  const unit = imperial ? 'lb' : 'kg';
  const toDisplay = useCallback((kg: number) => (imperial ? kg * 2.2046226218 : kg), [imperial]);
  const fmt = useCallback((kg: number) => toDisplay(kg).toLocaleString(language, { maximumFractionDigits: 1, minimumFractionDigits: 0 }), [toDisplay, language]);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [targetKg, setTargetKg] = useState<number | null>(null);
  const [logValue, setLogValue] = useState('');
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState('');

  useEffect(() => {
    let active = true;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 90);
    Promise.resolve(getWeightRegisters(start.toISOString(), end.toISOString()))
      .then((data: { items?: unknown[]; targetWeight?: number | null } | unknown[] | null) => {
        if (!active || !data) return;
        const rows = (Array.isArray(data) ? data : data.items || []) as Array<{ date?: string; dateUtc?: string; updatedAtUtc?: string; weight: number }>;
        const byDay = new Map<string, Entry>();
        rows.forEach((row) => {
          const day = localDateKey(row.updatedAtUtc || row.dateUtc || `${row.date}T12:00:00`);
          if (day && Number.isFinite(Number(row.weight))) byDay.set(day, { day, kg: Number(row.weight) });
        });
        setEntries([...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)));
        if (!Array.isArray(data) && data.targetWeight != null) setTargetKg(Number(data.targetWeight));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getWeightRegisters]);

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const delta = latest && previous ? toDisplay(latest.kg) - toDisplay(previous.kg) : null;
  const recent = useMemo(() => entries.slice(-5, -1).reverse(), [entries]);
  const dayLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(language, { day: '2-digit', month: 'short' });
  const remaining = latest && targetKg != null ? toDisplay(targetKg) - toDisplay(latest.kg) : null;
  const parse = (value: string) => {
    const parsed = parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const saveWeight = (event: FormEvent) => {
    event.preventDefault();
    const typed = parse(logValue);
    if (typed === null) return;
    const kg = imperial ? typed * KG_PER_LB : typed;
    const now = new Date();
    const day = localDateKey(now);
    enqueueMutation({
      endpoint: '/api/nutrition/weight/registers',
      method: 'POST',
      body: { weight: kg, dateUtc: localDayUtcNoonIso(now) },
      dedupeKey: `weight-register-${clientId}-${day}`,
    });
    setEntries((current) => [...current.filter((entry) => entry.day !== day), { day, kg }].sort((a, b) => a.day.localeCompare(b.day)));
    setLogValue('');
  };

  const saveTarget = (event: FormEvent) => {
    event.preventDefault();
    const typed = parse(targetValue);
    if (typed === null) return;
    const kg = imperial ? typed * KG_PER_LB : typed;
    enqueueMutation({
      endpoint: '/api/nutrition/weight/target',
      method: 'PUT',
      body: { targetWeight: kg },
      dedupeKey: `weight-target-${clientId}`,
    });
    setTargetKg(kg);
    setEditingTarget(false);
  };

  return (
    <section className="ah-card bw" aria-label={c.title} data-testid="body-weight-card">
      <div className="ah-card-head">
        <h3 className="ah-card-title">{c.title}</h3>
        {!editingTarget && (
          <button type="button" className="ah-link" onClick={() => { setTargetValue(targetKg != null ? String(Number(toDisplay(targetKg).toFixed(1))) : ''); setEditingTarget(true); }}>
            {targetKg != null ? c.editTarget : c.setTarget}
          </button>
        )}
      </div>

      <div className="bw-main">
        <p className="ah-big">
          {latest ? fmt(latest.kg) : <span className="bw-none">{c.none}</span>}
          {latest && <small> {unit}</small>}
        </p>
        {delta !== null && Math.abs(delta) >= 0.05 && (
          <span className="bw-delta">{delta > 0 ? '+' : '−'}{Math.abs(delta).toLocaleString(language, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} {unit}</span>
        )}
      </div>
      {latest && <p className="ah-card-sub">{c.last}: {dayLabel(latest.day)}</p>}

      <Sparkline points={entries.slice(-30).map((entry) => toDisplay(entry.kg))} />

      {targetKg != null && latest && !editingTarget && (
        <p className="bw-target">
          {c.target}: <strong>{fmt(targetKg)} {unit}</strong>
          {' · '}
          {remaining !== null && Math.abs(remaining) < 0.05 ? c.reached : `${Math.abs(remaining ?? 0).toLocaleString(language, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} ${unit} ${c.toGo}`}
        </p>
      )}

      {editingTarget && (
        <form className="bw-form" onSubmit={saveTarget}>
          <input type="text" inputMode="decimal" aria-label={c.target} placeholder={`${c.targetPh} (${unit})`} value={targetValue} onChange={(event) => setTargetValue(event.target.value)} autoFocus />
          <button type="submit" className="ah-solid-cta">{c.save}</button>
          <button type="button" className="ah-soft-cta" onClick={() => setEditingTarget(false)}>{c.cancel}</button>
        </form>
      )}

      {recent.length > 0 && (
        <ul className="bw-recent" aria-label={c.recent}>
          {recent.map((entry) => (
            <li key={entry.day}><span>{dayLabel(entry.day)}</span><strong>{fmt(entry.kg)} {unit}</strong></li>
          ))}
        </ul>
      )}

      <form className="bw-form" onSubmit={saveWeight}>
        <input type="text" inputMode="decimal" aria-label={c.logPh} placeholder={`${c.logPh} (${unit})`} value={logValue} onChange={(event) => setLogValue(event.target.value)} />
        <button type="submit" className="ah-solid-cta" disabled={parse(logValue) === null}>{c.log}</button>
      </form>
    </section>
  );
}
