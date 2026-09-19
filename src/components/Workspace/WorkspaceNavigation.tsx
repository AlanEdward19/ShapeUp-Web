import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const sidebarIconCss = `
[data-unified-sidebar] .material-symbols-outlined{font-family:'Material Symbols Outlined'!important;font-weight:400!important;font-style:normal!important;font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20!important;display:inline-block!important;line-height:1!important;letter-spacing:normal!important;text-transform:none!important;white-space:nowrap!important;direction:ltr;-webkit-font-feature-settings:'liga'!important;font-feature-settings:'liga'!important}
[data-unified-sidebar] .sn-profile button{background:none;border:0;padding:4px;cursor:pointer;color:inherit;text-transform:none;letter-spacing:normal;font:inherit}
`;

export const navStyle = `
${sidebarIconCss}
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:256px;background:var(--bg-main);border-right:1px solid var(--border-color);z-index:60;display:flex;flex-direction:column;justify-content:space-between;font:14px/1.5 'Source Sans 3',sans-serif;color:var(--text-main);box-sizing:border-box}
[data-unified-sidebar] .sn-brand{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid var(--border-color)}
[data-unified-sidebar] .sn-brand strong{font:700 20px 'Barlow Condensed';letter-spacing:1px;text-transform:uppercase}
[data-unified-sidebar] .sn-brand small{font-size:10px;border:1px solid var(--border-color);background:var(--bg-card);padding:2px 8px;border-radius:4px;color:var(--warning)}
[data-unified-sidebar] nav{padding:16px 12px;flex:1;overflow:auto}
[data-unified-sidebar] nav p{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#85766f;padding:0 12px;margin:0 0 8px}
[data-unified-sidebar] a{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:6px;color:var(--text-muted);text-decoration:none;border-left:2px solid transparent;min-height:38px}
[data-unified-sidebar] a[aria-current=page]{background:var(--bg-card);color:var(--text-main);border-left-color:var(--primary);font-weight:600}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{color:var(--primary)}
[data-unified-sidebar] a:hover{background:var(--bg-card);color:var(--text-main)}
[data-unified-sidebar] .sn-profile{margin:12px;padding:8px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-card);display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:12px}[data-unified-sidebar] .sn-profile small{font-size:11px;color:#85766f}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-100%)}[data-unified-sidebar][data-open=true]{transform:none}.sn-mobile{display:block;position:fixed;bottom:18px;left:18px;z-index:80;background:var(--primary);color:var(--text-on-primary);border-radius:8px;padding:12px;border:1px solid var(--border-color)}.sn-space{display:none!important}.shell-body [data-shell-content]{margin-left:0!important;padding-left:0!important;width:100%!important}.shell-body{overflow-x:hidden}.shell-body header{flex-wrap:wrap;height:auto;min-height:64px}.shell-body main{max-width:100%;padding-left:16px;padding-right:16px}.shell-body table{min-width:650px}.shell-body [data-table-scroll]{overflow:auto}}
`;

type UnifiedSidebarNavigationProps = {
  flow?: boolean;
  open?: boolean;
  close?: () => void;
};

export function UnifiedSidebarNavigation({ flow, open, close }: UnifiedSidebarNavigationProps): ReactElement {
  const { pathname } = useLocation();
  const { signOut } = useAuth() ?? { signOut: async () => {} };
  const navigate = useNavigate();
  const role = localStorage.getItem('shapeup_role');
  const pro = role === 'professional' || role === 'gym';
  const profile = useUserProfile();
  const name = profile.name || 'Minha conta';
  useEffect(() => {
    const showMessages = () => navigate('/dashboard/messages');
    const escape = (event: KeyboardEvent) => { if (open && event.key === 'Escape') close?.(); };
    window.addEventListener('open_client_chat', showMessages);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('open_client_chat', showMessages);
      window.removeEventListener('keydown', escape);
    };
  }, [navigate, open, close]);
  type NavItem = [string, string, string];
  const items: NavItem[] = [
    ['dashboard', pro ? 'Painel do Treinador' : 'Meu Painel', '/dashboard'],
    ...(pro ? [['group', 'Meus Alunos', '/dashboard/clients'] as NavItem] : []),
    ['event_repeat', pro ? 'Criador & Periodização' : 'Meus Treinos', '/dashboard/training'],
    ['fitness_center', 'Biblioteca de Exercícios', '/dashboard/exercises'],
    ['nutrition', 'Painel Nutricional', '/dashboard/nutrition/diary'],
    ['chat_bubble', 'Mensagens & Consultoria', '/dashboard/messages'],
    ...(pro ? [['assessment', 'Relatórios', '/dashboard/reports'] as NavItem, ['monitoring', 'Análises', '/dashboard/analytics'] as NavItem] : [['target', 'Meus Objetivos', '/dashboard/objectives'] as NavItem]),
    ...(!pro ? [['location_on', 'Buscar Academias', '/dashboard/gyms'] as NavItem] : []),
    ...(role === 'gym' ? [['payments', 'Gestão Financeira', '/dashboard/financial'] as NavItem] : []),
    ...(role === 'gym' ? [['groups', 'Equipe', '/dashboard/staff'] as NavItem, ['sensor_door', 'Controle de Acesso', '/dashboard/turnstile'] as NavItem] : []),
    ['settings', 'Configurações', '/dashboard/settings'],
    ...(localStorage.getItem('shapeup_platform_admin') === 'true' ? [['verified_user', 'Moderação de Alimentos', '/dashboard/admin/food-moderation'] as NavItem, ['tune', 'Recursos da Plataforma', '/dashboard/admin/feature-flags'] as NavItem] : []),
  ];
  return (
    <>
      {flow && <div className="sn-space" style={{ width: 256, flexShrink: 0 }} />}
      <aside data-unified-sidebar data-open={open}>
        <div className="sn-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/dashboard" aria-label="ShapeUp — Dashboard" onClick={close} style={{ padding: 0, border: 0 }}>
              <Logo variant="lockup" width="142" height="34" style={{}} />
            </Link>
          </div>
          <small>{role === 'gym' ? 'Academia' : pro ? 'Personal' : 'Atleta'}</small>
        </div>
        <nav>
          <p>Gestão Atlética</p>
          {items.map(([icon, label, href], index) => (
            <div key={href}>
              {index === 5 && <p style={{ marginTop: 24 }}>Atendimento & Sistema</p>}
              <Link to={href} aria-current={pathname === href ? 'page' : undefined} onClick={close}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                <span>{label}</span>
              </Link>
            </div>
          ))}
        </nav>
        <div className="sn-profile">
          <span style={{ background: '#29211d', borderRadius: 6, padding: 6, color: 'var(--primary)' }}>
            {profile.photo ? <img src={profile.photo} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} /> : profile.initials}
          </span>
          <div style={{ flex: 1 }}>
            <strong>{name}</strong>
            <small>{role === 'gym' ? 'Dono de academia' : pro ? 'Personal Trainer' : 'Atleta ShapeUp'}</small>
          </div>
          <button title="Encerrar sessão" type="button" data-testid="sidebar-logout" onClick={async () => { await signOut(); navigate('/login'); }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export type WorkspaceNavigationProps = {
  isOpen?: boolean;
  onClose?: () => void;
  isProfessional?: boolean;
  isIndependent?: boolean;
  isGym?: boolean;
  profile?: unknown;
};

export function WorkspaceNavigation({ isOpen, onClose }: WorkspaceNavigationProps): ReactElement {
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const attach = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    setRoot(node.shadowRoot ?? node.attachShadow({ mode: 'open' }));
  }, []);

  return (
    <div
      ref={attach}
      data-layout-sidebar
      style={{ position: 'fixed', inset: '0 auto 0 0', width: 256, zIndex: 60 }}
    >
      {root
        ? createPortal(
            <>
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
              />
              <style>{`${navStyle}[data-unified-sidebar]{position:relative;inset:auto;height:100%;width:100%;pointer-events:auto}`}</style>
              <UnifiedSidebarNavigation flow={false} open={isOpen} close={onClose} />
            </>,
            root,
          )
        : null}
    </div>
  );
}
