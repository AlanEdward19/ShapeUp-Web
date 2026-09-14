import { useUserProfile } from '../contexts/UserProfileContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchTemplate from './StitchTemplate';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';
import { WorkspaceNavigation, navStyle, UnifiedSidebarNavigation as Navigation } from '../components/Workspace/WorkspaceNavigation';

export { WorkspaceNavigation };

const paths = [
  [/painel do treinador|dashboard|visão geral|meu painel|início|painel do aluno/i, '/dashboard'],
  [/meus alunos|gestão de alunos|carteira|clientes/i, '/dashboard/clients'],
  [/criador|periodização|meus treinos|fichas|treinos/i, '/dashboard/training'],
  [/biblioteca|exercícios/i, '/dashboard/exercises'],
  [/nutricional|nutrição|alimentar|diário/i, '/dashboard/nutrition/diary'],
  [/mensagens|consultoria|conversas/i, '/dashboard/messages'],
  [/configurações|preferências|minha conta/i, '/dashboard/settings'],
  [/academias|explorar/i, '/dashboard/gyms'],
  [/financeir|fluxo de caixa|cobranças/i, '/dashboard/financial'],
  [/moderação|catálogo de alimentos/i, '/dashboard/admin/food-moderation'],
  [/relatórios/i, '/dashboard/reports'],
];
const routeForLabel = text => paths.find(([pattern]) => pattern.test(text))?.[1];

export default function Workspace({ name, bind, onClick, after, css = '' }) {
  const profile = useUserProfile();
  const [open, setOpen] = useState(false);
  const document = sourceDocument(name);
  const sidebar = document.querySelector('aside');
  const flow = sidebar && !sidebar.className.includes('fixed');
  const navigate = useNavigate();
  return <StitchTemplate name={name} css={navStyle + css} after={<>{after}<button className="sn-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}><span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span></button></>} onClick={onClick} bind={(node, props, children, render) => {
    if (node === sidebar) return <Navigation key="shared-navigation" flow={flow} open={open} close={() => setOpen(false)} />;
    if (String(node.className || '').split(/\s+/).some(token => /^[mp]l-(64|60|\[260px\])$/.test(token))) { props['data-stitch-content'] = true; props.style = { ...props.style, ...(String(node.className).includes('pl-') ? { paddingLeft: 256 } : { marginLeft: 256 }) }; }
    if (node.localName === 'table' && !node.parentElement.className.includes('overflow')) return <div key={props.key} data-table-scroll>{renderSource(node, (inner, innerProps, innerChildren, innerRender) => inner === node ? bind?.(inner, innerProps, innerChildren, innerRender) : bind?.(inner, innerProps, innerChildren, innerRender))}</div>;
    if (node.localName === 'a' && ['#', ''].includes(props.href || '')) props.href = routeForLabel(nodeText(node)) || props.href;
    if (node.localName === 'button') {
      const text = nodeText(node);
      if (/novo treino|criar treino/i.test(text)) props.onClick = () => navigate('/dashboard/training', { state: { create: true } });
      else if (/matricular|novo aluno|convidar aluno/i.test(text)) props.onClick = () => navigate('/dashboard/clients');
    }
    const result = bind?.(node, props, children, render);
    if (result !== undefined) return result;
    if (node.localName === 'img' && /perfil|profile|avatar|Rodrigo Silva|Lucas Vianna/i.test(node.alt || '')) return profile.photo ? <img {...props} src={profile.photo} alt={profile.name} /> : <span className={props.className} style={{display:'inline-grid',placeItems:'center',background:'#29211d',color:'#f3eae5'}}>{profile.initials}</span>;
    if (node.children.length === 0 && /^(Rodrigo Silva|Rodrigo Silva de Albuquerque|Lucas Vianna|Lucas)$/.test(nodeText(node))) return <span {...props}>{profile.name || 'Minha conta'}</span>;
  }} />;
}
