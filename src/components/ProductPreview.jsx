const exercises = [
  { name: 'Levantamento Terra Romeno (RDL)', detail: 'Barra olímpica', cadence: '3-0-1-0', rest: '2 min', sets: ['12 reps × 60 kg', '10 reps × 80 kg', '8 reps × 95 kg', '6 reps × 105 kg'] },
  { name: 'Mesa Flexora Unilateral', detail: 'Foco em pico de contração', cadence: '2-1-1-1', rest: '90 seg', sets: ['12 reps × 30 kg', '10 reps × 35 kg', '8+4 reps (Rest-pause)'] },
];
export default function ProductPreview() {
  return <div className="lp-prescription" aria-label="Exemplo de ficha de treino">
    <header><div className="lp-athlete"><span className="lp-initials">RP</span><div><div><strong>Rodrigo Prado</strong><small>Semana 3 • Bloco Hipertrofia</small></div><p>Objetivo: Força & Hipertrofia Inferiores • 4 treinos semanais</p></div></div><div className="lp-adherence"><div><small>Aderência recente</small><strong>12 de 12 sessões</strong></div><div><small>Última atualização</small><span>Hoje, 09:40</span></div></div></header>
    <div className="lp-prescription-body"><div className="lp-session-heading"><div><h3>Sessão A — Cadeia posterior & extensão de quadril</h3><p>Tempo total previsto: 55 min • Ênfase em controle excêntrico</p></div><span>Volume equalizado: 14 séries</span></div>
      {exercises.map((exercise, index) => <article className="lp-exercise" key={exercise.name}><header><div><span>0{index + 1}</span><h4>{exercise.name}</h4><small>• {exercise.detail}</small></div><p>Cadência: <b>{exercise.cadence}</b><span> | </span>Descanso: <b>{exercise.rest}</b></p></header><div className="lp-sets" style={{ '--set-count': exercise.sets.length }}>{exercise.sets.map((set, i) => <div className={index === 0 && i === 3 ? 'lp-top-set' : ''} key={set}><span>{index === 0 && i === 3 ? 'Top Set' : `${i + 1}ª série`}</span><strong>{set}</strong></div>)}</div></article>)}
      <p className="lp-coach-note"><strong>Orientação ao atleta:</strong> Manter escápulas ativadas e joelho destravado na fase excêntrica do RDL. Registrar carga e percepção de esforço imediatamente ao fim da sessão.</p>
    </div>
  </div>;
}
