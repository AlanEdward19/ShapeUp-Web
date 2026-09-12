import { createElement, useState } from 'react';
import { createPortal } from 'react-dom';
import Workspace from './Workspace';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';

export default function StitchBuilder({ state }) {
  const [preview, setPreview] = useState(false);
  const [replacement, setReplacement] = useState(null);
  const document = sourceDocument('builder');
  const prototype = document.querySelector('article');
  const list = prototype.parentElement;
  const rows = state.currentBlocks.flatMap((block, blockIndex) => block.exercises.map((exercise, exerciseIndex) => ({ exercise, blockIndex, exerciseIndex })));
  const update = (row, transform) => state.setCurrentBlocks(blocks => blocks.map((block, bi) => bi !== row.blockIndex ? block : { ...block, exercises: block.exercises.map((exercise, ei) => ei !== row.exerciseIndex ? exercise : transform(exercise)) }));
  const save = () => state.onSave({ ...state.plan, name: state.name, phase: state.phase, difficulty: state.difficulty, weeks: state.weeks, notes: state.planNotes, blocks: state.currentBlocks });
  const inputClass = 'bg-espresso border border-border-subtle rounded-md px-3 py-1.5 text-xs text-text-primary font-medium focus:border-terracota focus:outline-none text-center shadow-inner';
  const bindRow = (row, index) => (node, props) => {
    const ex = row.exercise;
    if (node.localName === 'h3') return <h3 {...props}>{ex.name}</h3>;
    if (node.children.length === 0 && nodeText(node) === '01') return <span {...props}>{String(index + 1).padStart(2, '0')}</span>;
    if (node.children.length === 0 && nodeText(node) === 'Quadríceps & Glúteo Máximo') return <strong {...props}>{ex.muscles?.join(', ') || ex.tags || '—'}</strong>;
    if (node.localName === 'tbody') return <tbody {...props}>{ex.sets.map((set, setIndex) => <tr key={set.id || setIndex} className="hover:bg-surface-elevated/40 transition-colors"><td className="py-3.5 text-center font-bold text-text-secondary">{setIndex + 1}</td><td className="py-3.5"><select aria-label={`Tipo da série ${setIndex + 1}`} className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated text-text-secondary border border-border-subtle" disabled={preview} value={set.type} onChange={event => update(row, current => ({ ...current, sets: current.sets.map((item, si) => si === setIndex ? { ...item, type: event.target.value } : item) }))}>{[['warmup', 'Aquecimento'], ['feeder', 'Preparação'], ['working', 'Carga Efetiva'], ['topset', 'Top Set'], ['backoff', 'Back-off']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>{[['load', 'Carga', 'w-20'], ['reps', 'Repetições alvo', 'w-32'], ['intensityValue', 'RPE alvo', 'w-20'], ['rest', 'Descanso', 'w-20']].map(([field, label, width]) => <td key={field} className="py-3.5"><input aria-label={`${label}, série ${setIndex + 1}, ${ex.name}`} readOnly={preview} className={`${inputClass} ${width}`} value={set[field] || ''} onChange={event => update(row, current => ({ ...current, sets: current.sets.map((item, si) => si === setIndex ? { ...item, [field]: event.target.value } : item) }))} /></td>)}<td className="py-3.5 text-right pr-3"><button type="button" disabled={preview} title="Remover série" className="text-text-muted p-1.5" onClick={() => update(row, current => ({ ...current, sets: current.sets.filter((_, si) => si !== setIndex) }))}><span className="material-symbols-outlined text-[18px]">close</span></button></td></tr>)}</tbody>;
    if (node.localName === 'input') { delete props.defaultValue; props.value = ex.notes || ''; props.readOnly = preview; props.onChange = event => update(row, current => ({ ...current, notes: event.target.value })); }
    if (node.localName === 'button' && /Adicionar Série/i.test(nodeText(node))) props.onClick = () => update(row, current => ({ ...current, sets: [...current.sets, { type: 'working', technique: 'Straight', reps: '8-10', load: '', intensityType: 'rpe', intensityValue: '8', rest: '90' }] }));
    if (node.localName === 'button' && node.title === 'Substituir Exercício') props.onClick = () => { setReplacement(row); state.setShowExerciseLibrary(true); };
    if (node.localName === 'button' && node.title === 'Mais opções') { props.title = 'Remover exercício'; props.onClick = () => state.setCurrentBlocks(blocks => blocks.map((block, bi) => bi === row.blockIndex ? { ...block, exercises: block.exercises.filter((_, ei) => ei !== row.exerciseIndex) } : block).filter(block => block.exercises.length)); }
  };
  return createPortal(<div style={{ position: 'fixed', inset: 0, overflow: 'auto', zIndex: 100, background: '#171311' }}><Workspace name="builder" bind={(node, props) => {
    if (node === list) return <div {...props}>{rows.length ? rows.map((row, index) => renderSource(prototype, bindRow(row, index), `exercise-${row.exercise.id || index}`)) : <article className="bg-surface border border-border-subtle rounded-xl p-7"><p className="text-text-secondary">Adicione o primeiro exercício para montar a ficha.</p></article>}</div>;
    if (node.localName === 'h1') return <h1 {...props}><input aria-label="Nome da periodização" value={state.name} onChange={event => state.setName(event.target.value)} style={{ background: 'transparent', border: 0, color: 'inherit', font: 'inherit', padding: 0, width: '100%' }} /></h1>;
    const text = nodeText(node);
    if (node.children.length === 0 && text === '84') return createElement(node.localName, props, state.totalSets);
    if (node.children.length === 0 && text === '8.5') return createElement(node.localName, props, state.avgRpe);
    if (node.localName === 'button' && /Salvar Rascunho/.test(text)) props.onClick = save;
    if (node.localName === 'button' && /Publicar Treino/.test(text)) props.onClick = () => state.onAssign ? state.onAssign({ ...state.plan, name: state.name, phase: state.phase, difficulty: state.difficulty, weeks: state.weeks, notes: state.planNotes, blocks: state.currentBlocks }) : save();
    if (node.localName === 'button' && /Modo Aluno/.test(text)) { props.onClick = () => setPreview(!preview); props['aria-pressed'] = preview; }
    if (node.localName === 'button' && /Adicionar Exercício|Biblioteca|Inserir Exercício/i.test(text)) props.onClick = state.addExercise;
    if (node.localName === 'a' && /Treinos|Fichas/.test(text)) { props.href = '#'; props.onClick = event => { event.preventDefault(); state.onCancel(); }; }
  }} after={<button onClick={state.onCancel} style={{ position: 'fixed', bottom: 20, right: 24, border: '1px solid #3a2d27', background: '#211a17', color: '#f3eae5', borderRadius: 6, padding: '8px 16px', zIndex: 70 }}>Voltar à biblioteca</button>} />{state.showExerciseLibrary && <ExerciseLibraryModal onClose={() => state.setShowExerciseLibrary(false)} onSelect={exercise => { if (replacement) { update(replacement, current => ({ ...current, exerciseId: exercise.id, name: exercise.name, muscles: exercise.muscles || [], tags: exercise.type || '', notes: '' })); setReplacement(null); state.setShowExerciseLibrary(false); } else state.handleSelectExercise(exercise); }} />}{state.alertModal.visible && <div className="su-modal-overlay"><div className="su-modal-box"><h2>{state.alertModal.title}</h2><p>{state.alertModal.message}</p><button className="su-btn su-btn-primary" onClick={() => state.setAlertModal({ ...state.alertModal, visible: false })}>Entendi</button></div></div>}</div>, window.document.body);
}


