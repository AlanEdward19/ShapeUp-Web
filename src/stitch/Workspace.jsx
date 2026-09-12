import Logo from '../components/Logo/Logo';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StitchTemplate from './StitchTemplate';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';

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
const navStyle = `
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:256px;background:#18120f;border-right:1px solid #3a2d27;z-index:60;display:flex;flex-direction:column;justify-content:space-between;font:14px/1.5 'Source Sans 3',sans-serif;color:#f3eae5;box-sizing:border-box}
[data-unified-sidebar] .sn-brand{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #3a2d27}
[data-unified-sidebar] .sn-brand strong{font:700 20px 'Barlow Condensed';letter-spacing:1px;text-transform:uppercase}
[data-unified-sidebar] .sn-brand small{font-size:10px;border:1px solid #3a2d27;background:#211a17;padding:2px 8px;border-radius:4px;color:#d4a359}
[data-unified-sidebar] nav{padding:16px 12px;flex:1;overflow:auto}
[data-unified-sidebar] nav p{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#85766f;padding:0 12px;margin:0 0 8px}
[data-unified-sidebar] a{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:6px;color:#b8aaa2;text-decoration:none;border-left:2px solid transparent;min-height:38px}
[data-unified-sidebar] a[aria-current=page]{background:#211a17;color:#f3eae5;border-left-color:#e06c43;font-weight:600}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{color:#e06c43}
[data-unified-sidebar] a:hover{background:#211a17;color:#f3eae5}
[data-unified-sidebar] .sn-profile{margin:12px;padding:8px;border:1px solid #3a2d27;border-radius:6px;background:#211a17;display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:12px}[data-unified-sidebar] .sn-profile small{font-size:11px;color:#85766f}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-100%)}[data-unified-sidebar][data-open=true]{transform:none}.sn-mobile{display:block;position:fixed;bottom:18px;left:18px;z-index:80;background:#e06c43;color:#171311;border-radius:8px;padding:12px;border:1px solid #3a2d27}.sn-space{display:none!important}.stitch-body [data-stitch-content]{margin-left:0!important;padding-left:0!important;width:100%!important}.stitch-body{overflow-x:hidden}.stitch-body header{flex-wrap:wrap;height:auto;min-height:64px}.stitch-body main{max-width:100%;padding-left:16px;padding-right:16px}.stitch-body table{min-width:650px}.stitch-body [data-table-scroll]{overflow:auto}}
`;

function Navigation({ flow, open, close }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const role = localStorage.getItem('shapeup_role');
  const pro = role === 'professional' || role === 'gym';
  const name = localStorage.getItem('shapeup_user_name') || 'Minha conta';
  useEffect(() => {
    const showMessages = () => navigate('/dashboard/messages');
    const escape = event => { if (open && event.key === 'Escape') close?.(); };
    window.addEventListener('open_client_chat', showMessages); window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('open_client_chat', showMessages); window.removeEventListener('keydown', escape); };
  }, [navigate, open, close]);
  const items = [
    ['dashboard', pro ? 'Painel do Treinador' : 'Meu Painel', '/dashboard'],
    ...(pro ? [['group', 'Meus Alunos', '/dashboard/clients']] : []),
    ['event_repeat', pro ? 'Criador & Periodização' : 'Meus Treinos', '/dashboard/training'],
    ['fitness_center', 'Biblioteca de Exercícios', '/dashboard/exercises'],
    ['nutrition', 'Painel Nutricional', '/dashboard/nutrition/diary'],
    ['chat_bubble', 'Mensagens & Consultoria', '/dashboard/messages'],
    ...(pro ? [['assessment', 'Relatórios', '/dashboard/reports'], ['monitoring', 'Análises', '/dashboard/analytics']] : [['target', 'Meus Objetivos', '/dashboard/objectives']]),
    ...(!pro ? [['location_on', 'Buscar Academias', '/dashboard/gyms']] : []),
    ...(role === 'gym' ? [['payments', 'Gestão Financeira', '/dashboard/financial']] : []),
    ...(role === 'gym' ? [['groups', 'Equipe', '/dashboard/staff'], ['sensor_door', 'Controle de Acesso', '/dashboard/turnstile']] : []),
    ['settings', 'Configurações', '/dashboard/settings'],
    ...(localStorage.getItem('shapeup_platform_admin') === 'true' ? [['verified_user', 'Moderação de Alimentos', '/dashboard/admin/food-moderation'], ['tune', 'Recursos da Plataforma', '/dashboard/admin/feature-flags']] : []),
  ];
  return <>{flow && <div className="sn-space" style={{ width: 256, flexShrink: 0 }} />}<aside data-unified-sidebar data-open={open}><div className="sn-brand"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><a href="/dashboard" aria-label="ShapeUp — Dashboard" onClick={close} style={{padding:0,border:0}}><Logo variant="lockup" width="142" height="34" /></a></div><small>{pro ? 'Coach Pro' : 'Atleta'}</small></div><nav><p>Gestão Atlética</p>{items.map(([icon, label, href], index) => <div key={href}>{index === 5 && <p style={{ marginTop: 24 }}>Atendimento & Sistema</p>}<a href={href} aria-current={pathname === href ? 'page' : undefined} onClick={close}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span><span>{label}</span></a></div>)}</nav><div className="sn-profile"><span style={{ background: '#29211d', borderRadius: 6, padding: 6, color: '#e06c43' }}>{name.slice(0, 2).toUpperCase()}</span><div style={{ flex: 1 }}><strong>{name}</strong><small>{pro ? 'Personal Trainer' : 'Atleta ShapeUp'}</small></div><button title="Encerrar sessão" onClick={async () => { await signOut(); navigate('/login'); }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span></button></div></aside></>;
}

export function WorkspaceNavigation({ isOpen, onClose }) {
  return <div style={{ position: 'fixed', inset: '0 auto 0 0', width: 256, zIndex: 60, pointerEvents: 'none' }}><StitchTemplate name="professional" bodyClass="" css={`${navStyle}[data-unified-sidebar]{pointer-events:auto}`}><Navigation flow={false} open={isOpen} close={onClose} /></StitchTemplate></div>;
}

export default function Workspace({ name, bind, onClick, after, css = '' }) {
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
    return bind?.(node, props, children, render);
  }} />;
}





