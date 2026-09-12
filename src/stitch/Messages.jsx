import { createElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatDrawer from '../components/ChatDrawer';
import Feedback from '../pages/Dashboard/Feedback';
import Workspace from './Workspace';
import { sourceDocument, nodeText } from './sourceRuntime';

function MessageView(state) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const document = sourceDocument('messages');
  const main = document.querySelector('main');
  const stream = [...main.children].find(node => node.className.includes('overflow-y-auto'));
  const left = main.previousElementSibling;
  const coach = state.inboxFeed?.find(item => item.clientId === state.selectedClientId)?.clientName || localStorage.getItem('shapeup_coach_name') || 'Seu treinador';
  const sender = state.inboxFeed ? 'coach' : 'client';
  return <Workspace name="messages" css="@media(max-width:1200px){main+aside{display:none}}@media(max-width:767px){.stitch-body>div{min-width:0}main{width:100%;min-width:0}main>header{padding:12px}main>div{padding:12px}.sn-conversations{display:block!important;width:100%!important;max-height:180px;overflow:auto;flex:none!important}.stitch-body>div{flex-wrap:wrap}}" bind={(node, props) => {
    if (node === main.nextElementSibling && node.localName === 'aside') return <aside {...props}><div className="p-4 space-y-5"><h3 className="font-headline text-lg font-bold">{coach}</h3><p className="text-xs text-text-muted">Prescrição e acompanhamento</p><h4 className="text-xs uppercase">Documentos & Diretrizes</h4>{state.messages.filter(message => message.attachment?.data).map(message => <a key={message.id} href={message.attachment.data} download={message.attachment.name} className="block p-3 text-xs border border-border-strong rounded">{message.attachment.name}</a>)}<button className="w-full py-2 rounded-md bg-primary-terracotta text-xs font-semibold text-white" onClick={() => navigate('/dashboard/training')}>Ver Treino do Dia</button></div></aside>;
    if (node.children.length === 0 && /^(Online agora|Prescrição: Hipertrofia Fase 2|• Head Coach \(CREF 089124\))$/.test(nodeText(node))) return null;
    if (node === stream) return <div {...props} role="log" aria-label="Mensagens">{state.messages.length ? state.messages.map(message => <div key={message.id} className={`flex flex-col ${message.sender === sender ? 'items-end self-end' : 'items-start'} max-w-xl`}><div className="flex items-center gap-2 mb-1 px-1"><span className="text-[11px] text-text-muted">{message.time}</span><span className="text-xs font-medium text-text-secondary">{message.sender === sender ? 'Você' : coach}</span></div><div className={`${message.sender === sender ? 'bg-primary-terracotta text-white rounded-tr-sm' : 'bg-surface-card border border-border-strong text-text-primary rounded-tl-sm'} rounded-2xl px-4 py-3 text-sm leading-relaxed`}>{message.text}{message.attachment?.data && <a href={message.attachment.data} download={message.attachment.name}>{message.attachment.name}</a>}</div>{message.sender === sender && state.handleDelete && <button className="text-xs text-text-muted mt-1" onClick={() => state.handleDelete(message.id)}>Excluir</button>}</div>) : <p className="text-sm text-text-muted">Nenhuma mensagem nesta conversa.</p>}</div>;
    if (node === left) return <div {...props} className={`${props.className} sn-conversations`}><div className="p-4 border-b border-border-strong"><h1 className="font-headline text-xl font-bold">Conversas</h1><input className="w-full mt-3 px-3 py-2 rounded bg-surface-base border border-border-strong text-sm" placeholder="Buscar conversa..." value={query} onChange={event => setQuery(event.target.value)} /></div>{(state.inboxFeed || [{ clientId: 'coach', clientName: coach }]).filter(item => item.clientName.toLowerCase().includes(query.toLowerCase())).map(item => <button key={item.clientId} className="w-full p-4 text-left border-b border-border-strong hover:bg-surface-elevated" style={{ borderLeft: `2px solid ${item.clientId === state.selectedClientId || !state.inboxFeed ? '#e06c43' : 'transparent'}` }} onClick={() => state.setSelectedClientId?.(item.clientId)}><strong className="text-sm text-text-primary">{item.clientName}</strong><p className="text-xs text-text-muted mt-1">{item.lastMsgText || 'Prescrição e acompanhamento'}</p></button>)}</div>;
    if (node.localName === 'textarea') { props.value = state.newMessage; delete props.defaultValue; props.placeholder = `Enviar mensagem para ${coach}...`; props.onChange = event => state.setNewMessage(event.target.value); props.onKeyDown = event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); state.handleSend(); } }; }
    if (node.localName === 'button' && nodeText(node).startsWith('Enviar')) { props.onClick = state.handleSend; props.disabled = !state.newMessage.trim() && !state.attachedFile; }
    if (node.localName === 'button' && /Anexar/.test(node.title)) props.onClick = state.triggerFileInput;
    if (node.localName === 'button' && node.title === 'Gravar áudio') return <span {...props}><input type="file" ref={state.fileInputRef} hidden accept="image/*,video/*,audio/*,.pdf" onChange={state.handleFileChange} /><button type="button" title="Anexar áudio" onClick={state.triggerFileInput}><span className="material-symbols-outlined">mic</span></button></span>;
    if (node.localName === 'button' && /Ficha|Treino do Dia/.test(nodeText(node))) props.onClick = () => navigate('/dashboard/training');
    if (node.children.length === 0 && nodeText(node) === 'Rodrigo Silva') return createElement(node.localName, props, coach);
  }} />;
}
export default function StitchMessages() {
  const role = localStorage.getItem('shapeup_role');
  return role === 'professional' || role === 'gym' ? <Feedback renderView={state => <MessageView {...state} />} /> : <ChatDrawer isOpen embedded renderView={state => <MessageView {...state} />} />;
}


