import SuggestExerciseModal from '../components/SuggestExerciseModal';
import { createElement, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Workspace from './Workspace';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';
import { useExercises } from '../hooks/useExercises';

export default function StitchExercises() {
  const { exercises, loading, error, searchTerm, setSearchTerm } = useExercises();
  const [group, setGroup] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const panel = useRef(null);
  useEffect(() => { if (open) panel.current?.querySelector('button')?.focus(); }, [open, selected?.id]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const inspect = (ex, event) => { trigger.current = event.currentTarget; setSelected(ex); setOpen(true); };
  const [sort, setSort] = useState('name');
  const [view, setView] = useState('list');
  const [notice, setNotice] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const navigate = useNavigate();
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const equipmentName = ex => ex.equipment || ex.equipments?.map(item => item.equipmentNamePt || item.equipmentName).join(', ') || 'Não informado';
  const filtered = exercises.filter(ex => normalize([ex.name, ...ex.muscles, equipmentName(ex)].join(' ')).includes(normalize(searchTerm)) && (group === 'all' || normalize(ex.muscles.join(' ')).includes(normalize(group))) && (equipment === 'all' || normalize(equipmentName(ex)).includes(normalize(equipment))));
  filtered.sort((a, b) => (sort === 'muscles' ? a.muscles.join(', ') : a.name).localeCompare(sort === 'muscles' ? b.muscles.join(', ') : b.name));
  const active = selected;
  const row = sourceDocument('exercises').querySelector('.exercise-item');
  const add = ex => { if (ex) navigate('/dashboard/training', { state: { create: true, exercise: ex } }); };
  const drawer = { drawerCode: active ? `EX-${active.id}` : '—', drawerTitle: active?.name || 'Selecione um exercício', drawerPattern: active?.type || 'Exercício', drawerPrimaryMuscle: active?.muscles?.join(', ') || '—', drawerAgonist: active?.muscles?.[0] || '—', drawerSynergist: active?.muscles?.slice(1).join(', ') || '—', drawerSets: 'Definir na ficha', drawerReps: 'Definir na ficha', drawerRest: 'Definir na ficha', drawerUsageBadge: 'Biblioteca de exercícios', drawerStep1: active?.descriptionPt || active?.description || 'Orientação não cadastrada.', drawerStep2: active?.instructions?.[1] || '—', drawerStep3: active?.instructions?.[2] || '—', drawerError: active?.precautions || '—', drawerSubs: 'Consulte a biblioteca para selecionar uma substituição.' };
  return <><Workspace name="exercises" css={`#exerciseDrawer{position:fixed;right:0;top:0;bottom:0;width:min(440px,100vw);height:100dvh;z-index:90;transform:translateX(100%);visibility:hidden;transition:transform 240ms cubic-bezier(.32,.72,0,1),visibility 0s 240ms}#exerciseDrawer[data-open=true]{transform:translateX(0);visibility:visible;transition-delay:0s}@media(prefers-reduced-motion:reduce){#exerciseDrawer{transform:none;opacity:0;transition:opacity 150ms ease,visibility 0s 150ms}#exerciseDrawer[data-open=true]{opacity:1;transition-delay:0s}}`} bind={(node, props) => {
    const text = nodeText(node);
    if (node.localName === 'div' && node.querySelector(':scope > .muscle-pill')) return <div {...props}><span>Grupo:</span>{['all', ...new Set(exercises.flatMap(ex => ex.muscles))].map(value => <button key={value} type="button" aria-pressed={group === value} onClick={() => setGroup(value)} style={{padding:'4px 10px',borderRadius:4,background:group === value ? '#e06c43' : 'transparent',whiteSpace:'nowrap'}}>{value === 'all' ? 'Todos' : value}</button>)}</div>;
    if (node.localName === 'div' && node.querySelector(':scope > .equip-btn')) return <div {...props}><span>Equipamento:</span>{['all', ...new Set(exercises.map(equipmentName))].map(value => <button key={value} type="button" aria-pressed={equipment === value} onClick={() => setEquipment(value)} style={{padding:'4px 8px',borderRadius:4,background:equipment === value ? '#3a2d27' : 'transparent'}}>{value === 'all' ? 'Todos' : value}</button>)}</div>;
    if (node.children.length === 0 && text === '⌘K') return null;
    if (node.localName === 'button' && text.includes('Mais Usados')) return null;
    if (node.localName === 'span' && text.includes('142 cadastrados')) return <span {...props}>{`(${exercises.length})`}</span>;
    if (node.localName === 'div' && node.classList.contains('shrink-0') && text.includes('PÁGINA 1 DE 15')) return null;
    if (node.children.length === 0 && ['REFERÊNCIA', 'USO', 'PADRÃO MOTOR'].includes(text)) return null;
    if (node.localName === 'select') return <select {...props} value={sort} onChange={event => setSort(event.target.value)}><option value="name">Ordem Alfabética (A-Z)</option><option value="muscles">Grupo Muscular</option></select>;
    if (node.id === 'globalExerciseSearch') { props.value = searchTerm; props.onChange = event => setSearchTerm(event.target.value); }
    const action = node.getAttribute('data-source-onclick') || '';
    const muscle = action.match(/filterByGroup\(this, '([^']+)'/);
    const equip = action.match(/filterByEquip\(this, '([^']+)'/);
    if (muscle) { props.onClick = () => setGroup(muscle[1]); props['aria-pressed'] = group === muscle[1]; }
    if (equip) { props.onClick = () => setEquipment(equip[1]); props['aria-pressed'] = equipment === equip[1]; }
    if (node.id === 'viewModeList') props.onClick = () => setView('list');
    if (node.id === 'viewModeCards') props.onClick = () => setView('cards');
    if (node.id === 'exerciseCountLabel') return <span {...props}>{`${filtered.length} exercícios encontrados`}</span>;
    if (node.id === 'exerciseListContainer') return <div {...props} style={view === 'cards' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', alignContent: 'start' } : undefined}>{error ? <p role="alert" className="p-6 text-text-muted">Não foi possível carregar a biblioteca. Tente novamente.</p> : loading ? <p className="p-6 text-text-muted">Carregando biblioteca…</p> : filtered.length ? filtered.map(ex => renderSource(row, (item, itemProps) => {
      if (item === row) { for (const key of Object.keys(itemProps)) if (key.startsWith('data-')) delete itemProps[key]; itemProps.tabIndex = 0; itemProps['aria-controls'] = 'exerciseDrawer'; itemProps['aria-expanded'] = open && active?.id === ex.id; itemProps.onClick = event => inspect(ex, event); itemProps.onKeyDown = event => { if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); inspect(ex, event); } }; itemProps.style = { borderLeftColor: active?.id === ex.id ? '#e06c43' : 'transparent' }; }
      const text = nodeText(item);
      if (item.localName === 'div' && item.classList.contains('mt-0.5')) return <div {...itemProps}>{ex.muscles.join(', ')}</div>;
      if (item.children.length === 0 && ['3-4 × 6-10', '94%', 'Composto / Joelho'].includes(text)) return null;
      const values = { 'EX-101': `EX-${ex.id}`, 'Agachamento Livre com Barra': ex.name, 'Quadríceps & Glúteos': ex.muscles.join(', '), 'Barra Olímpica': equipmentName(ex), 'Composto / Joelho': ex.type || '—', '3-4 × 6-10': 'Na ficha', '94%': '—' };
      if (item.children.length === 0 && values[text] !== undefined) return createElement(item.localName, itemProps, values[text]);
      if (item.localName === 'button' && item.title === 'Inserir na Ficha') itemProps.onClick = event => { event.stopPropagation(); add(ex); };
      if (view === 'cards' && item.classList.contains('exercise-item')) itemProps.style = { ...itemProps.style, flexWrap: 'wrap', padding: 20 };
    }, `exercise-${ex.id}`)) : <p className="p-6 text-text-muted">Nenhum exercício encontrado.</p>}</div>;
    if (drawer[node.id] !== undefined) return createElement(node.localName, props, drawer[node.id]);
    if (node.id === 'exerciseDrawer') { props.ref = panel; props['data-open'] = open; props.inert = !open; props['aria-hidden'] = !open; props['aria-labelledby'] = 'drawerTitle'; props.onKeyDown = event => { if (event.key === 'Escape') close(); }; }
    if (node.parentElement?.id === 'exerciseDrawer' && node.classList.contains('overflow-y-auto')) return <div {...props}>{active?.description && <p>{active.description}</p>}{active?.muscles?.length > 0 && <section><h4>Músculos</h4><p>{active.muscles.join(', ')}</p></section>}{active?.muscleDetails?.filter(muscle => typeof muscle === 'object' && Number.isFinite(muscle.activationPercent)).map(muscle => <p key={muscle.muscleGroup}>{muscle.muscleNamePt || muscle.muscleName}: {muscle.activationPercent}%</p>)}<section><h4>Diretrizes Técnicas de Execução</h4>{active?.steps?.length ? <ol style={{listStyle:'decimal',paddingLeft:20}}>{active.steps.map((step, index) => <li key={index} style={{marginTop:8}}>{typeof step === 'string' ? step : step.description}</li>)}</ol> : <p>Orientação não cadastrada.</p>}</section>{active?.videoUrl && /^https?:\/\//.test(active.videoUrl) && <a href={active.videoUrl} target="_blank" rel="noopener noreferrer">Vídeo do exercício</a>}</div>;
    if (action.includes('toggleDrawer(false)')) props.onClick = close;
    if (action.includes('addCurrentDrawerExercise')) props.onClick = () => add(active);
    if (action.includes('copyExerciseDetails')) props.onClick = async () => { try { await navigator.clipboard.writeText([active?.name, active?.descriptionPt || active?.description].filter(Boolean).join('\n')); setNotice('Detalhes copiados.'); } catch { setNotice('Não foi possível copiar os detalhes.'); } };
    if (action.includes('showToast')) props.onClick = () => setSuggesting(true);
    if (node.id === 'toastNotification') { props.hidden = !notice; props.className = props.className.replace(/opacity-0|translate-y-\d+/g, ''); }
    if (node.id === 'toastMessage') return <span {...props}>{notice}</span>;
  }} />{suggesting && <SuggestExerciseModal onClose={() => setSuggesting(false)} />}</>;
}



