import { createElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Workspace from './Workspace';
import { nodeText, sourceDocument, renderSource } from './sourceRuntime';
import DashboardClient from '../pages/Dashboard/DashboardClient';
import useHydration from './useHydration';
import { useNutritionApi } from '../hooks/api/useNutritionApi';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';
import { useAuthorizationApi } from '../hooks/api/useAuthorizationApi';
import { useTrainingApi } from '../hooks/api/useTrainingApi';
import HistoryChart from './HistoryChart';
import { useLanguage } from '../contexts/LanguageContext';
import { copy } from './copy';
import { normalizePlan } from '../utils/trainingNormalization';

function useDashboardCopy() {
  const { language, translateCopy } = useLanguage();
  return { language, tr: text => language === 'pt-BR' ? text : copy[text]?.[language === 'es' ? 1 : 0] || translateCopy(text) };
}

function read(key, fallback = []) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }

export function StitchProfessional() {
  const { language, tr } = useDashboardCopy();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [clients, setClients] = useState([]);
  const [loadError, setLoadError] = useState('');
  const { getTrainerClients } = useGymManagementApi();
  const { getMe } = useAuthorizationApi();
  useEffect(() => {
    let active = true;
    getMe().then(me => getTrainerClients(me.id || me.userId)).then(result => {
      if (active) setClients((result.items || result || []).map(item => ({ ...item, id: item.clientId || item.id, name: item.clientName || item.name, activePlan: item.planName || '', compliance: item.adherencePercentage ?? 0 })));
    }).catch(() => { if (active) setLoadError('Não foi possível carregar os alunos. Tente novamente.'); });
    return () => { active = false; };
  }, [getMe, getTrainerClients]);
  const filtered = clients.filter(client => (client.name || '').toLowerCase().includes(query.toLowerCase()) && (filter === 'Todos' || (filter.includes('Atras') ? Number(client.compliance) < 50 : !client.activePlan || client.activePlan === '-')));
  const navigate = useNavigate();
  const row = sourceDocument('professional').querySelector('tbody tr');
  const history = clients.flatMap(client => read(`shapeup_client_plans_${client.id}`).flatMap(plan => plan.history || []));
  const today = history.filter(session => new Date(session.date).toDateString() === new Date().toDateString());
  const pending = clients.filter(client => !client.activePlan || client.activePlan === '-').length;
  const adherence = clients.length ? Math.round(clients.reduce((sum, client) => sum + Number(client.compliance || 0), 0) / clients.length) : 0;
  const feedback = read('shapeup_messages').filter(message => message.sender === 'client' && message.status !== 'read');
  const appointments = clients.filter(client => client.nextSessionAt && new Date(client.nextSessionAt).toDateString() === new Date().toDateString());
  const agenda = [...sourceDocument('professional').querySelectorAll('section')].find(section => section.querySelector('h3')?.textContent === 'Agenda de Hoje');
  const feedbackSection = [...sourceDocument('professional').querySelectorAll('section')].find(section => section.querySelector('h3')?.textContent === 'Feedbacks em Aberto');
  return <Workspace name="professional" after={loadError && <p role="alert">{loadError}</p>} bind={(node, props) => {
    const text = nodeText(node);
    const metricText = { '8 alunos': `${today.length} alunos`, '6 concluídos': `${today.length} concluídos`, '2 sessões ainda em andamento': 'Sessões registradas hoje', '3 fichas': `${pending} fichas`, '94%': `${adherence}%`, '09:00': appointments[0] ? new Date(appointments[0].nextSessionAt).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) : '—', 'Juliana M.': appointments[0]?.name || 'Sem agendamento', 'Presencial • Treino de Hipertrofia': 'Próximo atendimento', '3 Sessões': `${appointments.length} sessões`, 'Sexta-feira • 3 sessões agendadas': new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' }), '2 Pendentes': `${feedback.length} pendentes`, 'Acima da meta mínima estabelecida (85%)': 'Aderência registrada pelos alunos' };
    if (node.children.length === 0 && metricText[text] !== undefined) return createElement(node.localName, props, metricText[text]);
    if (node.localName === 'p' && node.previousElementSibling?.localName === 'h1') return <p {...props}>{clients.length} alunos ativos • {pending} revisões pendentes • {feedback.length} feedbacks aguardando revisão</p>;
    if (node.parentElement === agenda && node.className.includes('divide-y')) return <div {...props}>{appointments.length ? appointments.map(client => <div key={client.id} className="p-4 border-b border-brand-border"><strong className="text-xs text-brand-text">{client.name}</strong><p className="text-xs text-brand-secondary">{new Date(client.nextSessionAt).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })} • {client.activePlan}</p></div>) : <p className="p-4 text-xs text-brand-muted">Nenhum atendimento agendado para hoje.</p>}</div>;
    if (node.parentElement === feedbackSection && node.className.includes('divide-y')) return <div {...props}>{feedback.length ? feedback.slice(-2).map(message => <div key={message.id} className="p-4 space-y-2.5"><strong className="text-xs text-brand-text">{message.clientName}</strong><p className="bg-brand-bg border border-brand-border rounded p-2.5 text-xs text-brand-secondary">{message.text}</p><button className="text-xs font-semibold text-brand-terracotta" onClick={() => navigate('/dashboard/messages')}>Responder Aluno</button></div>) : <p className="p-4 text-xs text-brand-muted">Nenhum feedback pendente.</p>}</div>;
    if (node.localName === 'input') { props.value = query; props.onChange = event => setQuery(event.target.value); }
    if (node.localName === 'button' && /^(Todos|Atrasados|Revisão)/.test(text)) { const label = text.split(' (')[0]; const count = label === 'Todos' ? clients.length : label === 'Atrasados' ? clients.filter(client => Number(client.compliance) < 50).length : pending; props.onClick = () => setFilter(label); props['aria-pressed'] = filter === label; return createElement('button', props, `${tr(label)} (${count})`); }
    if (node.children.length === 0 && text.startsWith('Exibindo 4 de 14')) return createElement(node.localName, props, `${tr('Exibindo')} ${Math.min(4, filtered.length)} / ${filtered.length} ${tr('alunos em acompanhamento contínuo')}`);
    if (node.localName === 'tbody') return <tbody {...props}>{filtered.length ? filtered.slice(0, 4).map(client => renderSource(row, (item, itemProps) => {
      const value = nodeText(item);
      const replacements = { 'Juliana Mendes': client.name, 'Hipertrofia Glúteos & Posteriores': client.goal || client.objective || 'Objetivo não informado', 'Hoje, 08:30': client.lastCheckin || 'Sem registro', 'Treino A concluído': client.activePlan || 'Sem ficha', '4/4': `${client.compliance || 0}%`, 'Semana 5 de 12': client.activePlan || 'Sem periodização', 'Fase Acúmulo de Volume': client.phase || '—' };
      if (item.children.length === 0 && replacements[value] !== undefined) return createElement(item.localName, itemProps, replacements[value]);
      if (item.localName === 'img') return <span {...{ className: itemProps.className }} style={{ display: 'grid', placeItems: 'center', background: '#29211d' }}>{(client.name || '?').slice(0, 2)}</span>;
      if (item.style.width) itemProps.style = { width: `${Math.min(100, client.compliance || 0)}%` };
      if (item.localName === 'button') itemProps.onClick = () => navigate(`/dashboard/clients/${client.id}`);
    }, client.id)) : <tr><td colSpan={5} className="py-8 px-4 text-brand-muted">Nenhum aluno encontrado.</td></tr>}</tbody>;
    if (node.children.length === 0 && text === 'Rodrigo Silva') return createElement(node.localName, props, localStorage.getItem('shapeup_user_name') || 'Meu workspace');
    if (node.localName === 'button' && /Responder|feedback/i.test(text)) props.onClick = () => navigate('/dashboard/messages');
  }} />;
}

function AthleteView(state) {
  const { language, tr } = useDashboardCopy();
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString('en-CA');
  const { water, addWater } = useHydration(date);
  const { getDiaryDay, getNutritionProfile } = useNutritionApi();
  const { getDashboardMe, getWorkoutsByUser, getWorkoutPlansByUser } = useTrainingApi();
  const { getMe } = useAuthorizationApi();
  const [chartData, setChartData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainingError, setTrainingError] = useState('');
  useEffect(() => {
    let active = true;
    getMe().then(me => Promise.all([getWorkoutsByUser(me.id || me.userId, undefined, 50), getWorkoutPlansByUser(me.id || me.userId)])).then(([sessions, result]) => {
      if (!active) return;
      setPlans((result.items || result || []).map(normalizePlan));
      setChartData((sessions.items || sessions || []).filter(item => item.isCompleted).sort((a, b) => new Date(a.startedAtUtc) - new Date(b.startedAtUtc)).map((item, index) => ({ session: index + 1, date: new Date(item.startedAtUtc).toLocaleDateString(), volume: (item.exercises || []).flatMap(ex => ex.sets || []).reduce((sum, set) => sum + Number(set.volume ?? Number(set.load) * Number(set.repetitions)), 0) })));
    }).catch(() => { if (active) setTrainingError('Não foi possível carregar seu histórico de treinamento.'); });
    return () => { active = false; };
  }, [getMe, getWorkoutsByUser, getWorkoutPlansByUser]);
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { let active = true; getDashboardMe(5).then(data => { if (active) setDashboard(data); }).catch(() => {}); return () => { active = false; }; }, [getDashboardMe]);
  const [nutrition, setNutrition] = useState({});
  useEffect(() => { let active = true; Promise.all([getDiaryDay(date), getNutritionProfile()]).then(([diary, profile]) => { if (active) setNutrition({ ...diary, goal: profile?.activeGoal }); }).catch(() => {}); return () => { active = false; }; }, [date, getDiaryDay, getNutritionProfile]);
  const plan = plans[0];
  const exercises = plan?.blocks?.flatMap(block => block.exercises || []) || plan?.exercises || [];
  const prototype = sourceDocument('athlete').querySelector('#tabela-exercicios h3').closest('.group');
  const chartPanel = sourceDocument('athlete').querySelector('svg').parentElement.parentElement.parentElement;
  const messages = read('shapeup_messages').filter(message => String(message.clientId) === String(localStorage.getItem('shapeup_client_id') || 1) && message.sender === 'coach');
  return <Workspace name="athlete" after={trainingError && <p role="alert">{trainingError}</p>} bind={(node, props) => {
    const text = nodeText(node);
    const weekday = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado (Hoje)', 'Domingo'].indexOf(node.title);
    if (weekday >= 0) { const day = new Date(2024, 0, weekday + 1); props.title = day.toLocaleDateString(language, { weekday: 'long' }); return createElement(node.localName, props, text === '—' ? text : day.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase()); }
    if (text === 'Sábado, 24 de Maio') return createElement(node.localName, props, new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' }));
    if (node === chartPanel) return <div {...props}><h3 className="font-headline text-lg font-bold uppercase">Histórico de Volume</h3><HistoryChart data={chartData} /></div>;
    if (node.localName === 'div' && node.classList.contains('pb-5') && text.includes('Refeição Programada')) return <div {...props}><h3 className="text-xs font-bold uppercase">Diário de Nutrição</h3><p className="text-sm py-3">{nutrition.meals?.length || 0} refeições registradas</p><button className="text-xs text-[#e06c43]" onClick={() => navigate('/dashboard/nutrition/diary')}>Abrir diário</button></div>;
    if (node.localName === 'div' && node.classList.contains('p-3') && text.includes('Cuidado com a Articulação do Ombro')) return null;
    if (node.children.length === 0 && text === '24.800' && dashboard) return createElement(node.localName, props, Number(dashboard.weeklyVolume || 0).toLocaleString(language));
    if (node.children.length === 0 && text === '4 de 5 dias' && dashboard) return createElement(node.localName, props, `${dashboard.sessionsCompletedThisWeek ?? 0} / ${dashboard.sessionsTargetPerWeek ?? '—'}`);
    if (node.localName === 'h1') return <h1 {...props}>{plan?.name || 'Seu Plano de Treinamento'}</h1>;
    if (node.localName === 'p' && node.previousElementSibling?.localName === 'h1') return <p {...props}>{exercises.length} exercícios programados • {plan?.notes || tr('Siga as orientações da sua ficha.')}</p>;
    if (node === prototype.parentElement) return <div {...props}>{exercises.length ? exercises.map((exercise, index) => renderSource(prototype, (item, itemProps) => {
      const value = nodeText(item);
      if (item.localName === 'h3') return <h3 {...itemProps}>{exercise.name}</h3>;
      if (item.children.length === 0 && value === '01') return <span {...itemProps}>{String(index + 1).padStart(2, '0')}</span>;
      if (item.children.length === 0 && value === '+2.5kg sugerido') return null;
      if (item.localName === 'p' && value.startsWith('Pegada aberta')) return <p {...itemProps}>{exercise.notes || exercise.muscles?.join(', ')}</p>;
      if (item.localName === 'p' && value.includes('séries ×')) return <p {...itemProps}>{`${exercise.sets?.length || 0} ${tr('séries ×')} ${exercise.sets?.[0]?.reps || '—'} reps`}</p>;
      if (item.localName === 'p' && value.startsWith('Carga:')) return <p {...itemProps}>{`${tr('Carga:')} ${exercise.sets?.[0]?.load || '—'} kg`}</p>;
      if (item.localName === 'input') { itemProps.onChange = () => navigate('/dashboard/training'); itemProps.title = 'Abrir sessão para registrar a execução'; }
    }, exercise.id || index)) : <p className="py-4 text-xs text-[#82736b]">Seu treino aparecerá aqui após a prescrição.</p>}</div>;
    if (node.id === 'waterDisplay') return <span {...props}>{(water / 1000).toLocaleString(language)}</span>;
    if (node.id === 'waterPct') return <span {...props}>Registro diário</span>;
    if (node.id === 'addWaterQuickBtn') props.onClick = addWater;
    const values = { '24.800': state.weeklyVolumeFormatted, '4 de 5 dias': `${state.streakDays} dias registrados`, '145g': `${nutrition.totals?.proteinG || 0}g`, '/ 210g': `/ ${nutrition.goal?.proteinG || '—'}g`, '/ 2.600 kcal': `/ ${nutrition.goal?.kcal || '—'} kcal`, '/ 3.5 Litros': 'litros registrados', 'Restam 1.3L até o encerramento do dia': 'Registro diário neste dispositivo', '5 de 5 pendentes': `${exercises.length} exercícios`, 'Sessão 18 • Fase de Sobrecarga': plan?.phase || 'Plano de treinamento' };
    if (node.children.length === 0 && values[text] !== undefined) return createElement(node.localName, props, values[text]);
    if (node.localName === 'p' && text.includes('Execução do terra na terça')) return <p {...props}>{messages.at(-1)?.text || 'Nenhuma orientação nova do treinador.'}</p>;
    if (node.localName === 'button' && /Responder|Confirmar Ingestão/.test(text)) props.onClick = () => navigate(text.includes('Responder') ? '/dashboard/messages' : '/dashboard/nutrition/foods');
    if (node.children.length === 0 && /^(Lucas Vianna|Lucas|Rodrigo Silva)$/.test(nodeText(node))) return createElement(node.localName, props, localStorage.getItem('shapeup_user_name') || 'Atleta');
    if (node.localName === 'button' && /iniciar|treino|sessão/i.test(nodeText(node))) props.onClick = () => navigate('/dashboard/training');
    if (node.localName === 'button' && /mensagem|coach/i.test(nodeText(node))) props.onClick = () => navigate('/dashboard/messages');
    if (node.localName === 'button' && /alimento|refeição/i.test(nodeText(node))) props.onClick = () => navigate('/dashboard/nutrition/foods');
  }} />;
}

export function StitchAthlete() { return <DashboardClient renderView={state => <AthleteView {...state} />} />; }

export function StitchFinance() {
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('');
  return <Workspace name="finance" after={payment && <p role="status" style={{position:'fixed',bottom:60,right:20,padding:16,background:'#211a17',border:'1px solid #3a2d27',color:'#f3eae5',zIndex:80}}>{payment}</p>} css="[data-stitch-content]{min-width:0}@media(max-width:767px){.stitch-body{max-width:100vw;overflow-x:clip}header>*{min-width:0;max-width:100%}#finance-tabs{max-width:100%;gap:16px}main{overflow-x:clip}.stitch-body .flex.items-center{flex-wrap:wrap}.stitch-body .relative{max-width:100%}.stitch-body input{max-width:100%}.finance-tab-btn{flex:0 0 auto}}[role=button][aria-pressed=true]{outline:2px solid #e06c43;outline-offset:2px}" bind={(node, props) => {
    if (node.title && node.style.width && node.parentElement.classList.contains('h-3')) { props.role = 'button'; props.tabIndex = 0; props['aria-label'] = node.title; props['aria-pressed'] = payment === node.title; props.onClick = () => setPayment(node.title); props.onKeyDown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPayment(node.title); } }; }
    if (node.localName === 'span' && nodeText(node) === 'Gateway de pagamento conectado e operando normalmente') return <span {...props}>Prévia demonstrativa • Sem cobranças reais</span>;
    const action = node.getAttribute('data-source-onclick') || '';
    const target = action.match(/switchFinanceTab\('([^']+)'/);
    if (target) { props.onClick = () => setTab(target[1]); props['aria-pressed'] = tab === target[1]; }
    if (node.classList.contains('finance-tab-panel')) { props.className = props.className.replace('hidden', ''); props.hidden = node.id !== 'tab-panel-' + tab; }
    if (node.localName === 'input' && ['text', 'search'].includes(props.type)) { props.value = query; props.onChange = event => setQuery(event.target.value); }
    if (node.localName === 'tr' && node.parentElement.localName === 'tbody') props.hidden = !nodeText(node).toLowerCase().includes(query.toLowerCase());
    if (node.localName === 'button' && /exportar/i.test(nodeText(node))) props.onClick = event => {
      const rows = [...event.currentTarget.getRootNode().querySelectorAll('tr')].filter(row => !row.closest('[hidden]')).map(row => [...row.children].map(cell => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(';'));
      const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })); const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = 'financeiro.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }} />;
}






