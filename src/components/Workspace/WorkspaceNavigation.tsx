import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import ProfileAvatar from '../ProfileAvatar';
import { buildNavigation, roleLabel } from './navigationModel';
import { navigationStyles } from './navigationStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

export const navStyle = navigationStyles;

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
  const { language } = (useLanguage() ?? {}) as { language?: string };
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
  const groups = buildNavigation({ role, platformAdmin: localStorage.getItem('shapeup_platform_admin') === 'true', language });
  return (
    <>
      {flow && <div className="sn-space" style={{ width: 256, flexShrink: 0 }} />}
      <aside data-unified-sidebar data-open={open}>
        <div className="sn-brand">
          <Link to="/dashboard" aria-label="ShapeUp — Início" onClick={close}>
            <Logo width="32" height="32" />
            <span className="sn-wordmark">ShapeUp</span>
          </Link>
          <small>{roleLabel(role, language)}</small>
        </div>
        <nav aria-label="Navegação principal">
          {groups.map(group => (
            <div key={group.id}>
              <p>{group.label}</p>
              {group.items.map(({ icon, label, href }) => (
                <Link key={href} to={href} aria-current={pathname === href ? 'page' : undefined} onClick={close}>
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sn-profile">
          <ProfileAvatar name={profile.name} photo={profile.photo} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{name}</strong>
            <small>{roleLabel(role, language)}</small>
          </div>
          <button title="Encerrar sessão" aria-label="Encerrar sessão" type="button" data-testid="sidebar-logout" onClick={async () => { await signOut(); navigate('/login'); }}>
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
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
