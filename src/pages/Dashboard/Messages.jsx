import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, Dumbbell } from 'lucide-react';
import ChatDrawer from '../../components/ChatDrawer';
import Feedback from './Feedback';
export default function Messages() {
  const [query, setQuery] = useState('');
  const role = localStorage.getItem('shapeup_role');
  if (role === 'professional' || role === 'gym') return <Feedback />;
  const coach = localStorage.getItem('shapeup_coach_name') || 'Seu treinador';
  let plan;
  try { plan = JSON.parse(localStorage.getItem(`shapeup_client_plans_${localStorage.getItem('shapeup_client_id') || 1}`) || '[]')[0]; } catch { /* No cached plan yet. */ }
  return <div className="su-messages-workspace">
    <aside className="su-conversation-list"><header><h1>Conversas</h1><label><Search size={15} /><input aria-label="Buscar conversa" placeholder="Buscar treinador..." value={query} onChange={event=>setQuery(event.target.value)} /></label><span>Treinador</span></header>{coach.toLowerCase().includes(query.toLowerCase()) ? <button type="button" className="is-active"><span className="su-avatar"><MessageSquare size={18} /></span><div><strong>{coach}</strong><p>Prescrição e acompanhamento</p><small>Conversa do seu plano de treino</small></div></button> : <p className="su-conversation-empty">Nenhuma conversa encontrada.</p>}</aside>
    <div className="su-messages-page"><ChatDrawer isOpen embedded coachName={coach} /></div>
    <aside className="su-conversation-context"><h2>Seu treinador</h2><div className="su-conversation-coach"><span className="su-avatar"><MessageSquare size={20} /></span><div><strong>{coach}</strong><p>Acompanhamento de treino</p></div></div><section><h3>Sua ficha vigente</h3><div className="su-conversation-detail"><strong>{plan?.name || 'Nenhum plano disponível'}</strong><p>{plan ? `${plan.weeks || plan.durationInWeeks || '—'} semanas · ${plan.phase || 'Plano de treinamento'}` : 'Seu plano aparecerá aqui após a prescrição.'}</p></div></section><section><h3>Instruções do coach</h3><div className="su-conversation-detail"><p>{plan?.notes || 'As orientações específicas ficam disponíveis na sua ficha e nas mensagens do treinador.'}</p></div></section><footer><Link className="su-btn su-btn-primary" to="/dashboard/training"><Dumbbell size={16} />Ver treino do dia</Link><Link className="su-btn su-btn-secondary" to="/dashboard/nutrition/diary">Consultar diário alimentar</Link></footer></aside>
  </div>;
}
