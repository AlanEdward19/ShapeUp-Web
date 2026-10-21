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
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:16rem;background:var(--bg-main);border-right:1px solid var(--border-color);z-index:60;display:flex;flex-direction:column;justify-content:space-between;font:15px/1.45 'Source Sans 3',sans-serif;color:var(--text-main);box-sizing:border-box}
[data-unified-sidebar] .sn-brand{height:4rem;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid var(--border-color)}
[data-unified-sidebar] .sn-brand strong{font:700 22px/1 'Barlow Condensed',sans-serif;letter-spacing:0;text-transform:none}
[data-unified-sidebar] .sn-brand small{font:600 12px/1.2 'Source Sans 3',sans-serif;letter-spacing:.02em;border:0;background:var(--bg-surface-high);padding:4px 8px;border-radius:8px;color:var(--warning)}
[data-unified-sidebar] nav{padding:12px;flex:1;overflow:auto}
[data-unified-sidebar] nav p{font:600 13px/1.35 'Source Sans 3',sans-serif;text-transform:none;letter-spacing:0;color:var(--text-muted);padding:12px 12px 6px;margin:0}
[data-unified-sidebar] a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;color:var(--text-muted);text-decoration:none;border:0;min-height:44px}
[data-unified-sidebar] a[aria-current=page]{background:var(--primary);color:var(--text-on-primary);font-weight:600}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{color:var(--text-on-primary)}
[data-unified-sidebar] a:hover{background:var(--bg-surface-high);color:var(--text-main)}
[data-unified-sidebar] a[aria-current=page]:hover{background:#e87a53;color:var(--text-on-primary)}
[data-unified-sidebar] a:focus-visible{outline:2px solid var(--link-color);outline-offset:2px}
[data-unified-sidebar] .sn-brand a{min-height:44px;padding:0;background:transparent;border-radius:8px}
[data-unified-sidebar] .sn-brand a:hover{background:transparent;color:inherit}
[data-unified-sidebar] .sn-profile{margin:12px;padding:12px;border:1px solid var(--border-color);border-radius:14px;background:var(--bg-card);display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:14px;font-weight:600}[data-unified-sidebar] .sn-profile small{font-size:12px;color:var(--text-muted)}
[data-unified-sidebar] .sn-profile button{min-width:44px;min-height:44px;border-radius:12px}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-110%)}[data-unified-sidebar][data-open=true]{transform:none}.sn-mobile{display:grid;place-items:center;position:fixed;bottom:16px;left:16px;z-index:80;width:52px;height:52px;background:var(--primary);color:var(--text-on-primary);border-radius:14px;padding:0;border:0}.sn-space{display:none!important}.shell-body [data-shell-content]{margin-left:0!important;padding-left:0!important;width:100%!important}.shell-body{overflow-x:hidden}.shell-body header{flex-wrap:wrap;height:auto;min-height:64px}.shell-body main{max-width:100%;padding-left:16px;padding-right:16px}.shell-body table{min-width:650px}.shell-body [data-table-scroll]{overflow:auto}}
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
    ['link', 'Vínculos', '/dashboard/links'],
    ['nutrition', 'Prática nutricional', '/dashboard/nutrition/practice'],
    ['mail', 'Convites', '/dashboard/training-invites'],
    ['badge', 'Credencial', '/dashboard/credential'],
    ['groups', 'Profissionais', '/dashboard/professionals'],
    ['notifications', 'Avisos', '/dashboard/notifications'],
    ...(pro ? [['sell', 'Planos de atendimento', '/dashboard/service-plans'] as NavItem] : []),
    ['settings', 'Configurações', '/dashboard/settings'],
    ...(localStorage.getItem('shapeup_platform_admin') === 'true' ? [['admin_panel_settings', 'Administração', '/dashboard/admin'] as NavItem, ['verified_user', 'Moderação de Alimentos', '/dashboard/admin/food-moderation'] as NavItem, ['tune', 'Recursos da Plataforma', '/dashboard/admin/feature-flags'] as NavItem] : []),
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
