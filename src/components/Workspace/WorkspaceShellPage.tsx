import { useState, type MouseEvent, type ReactNode } from 'react';
import DashboardShellHost, { type DashboardShellPageName } from '../../pages/shell-assets/DashboardShellHost';
import UnifiedNavigation from './UnifiedNavigation';
import { unifiedNavigationCss } from './unifiedNavigationStyles';

type WorkspaceShellPageProps = {
  name: DashboardShellPageName;
  css?: string;
  children: ReactNode;
  onBodyClick?: (event: MouseEvent<HTMLDivElement>) => void;
  adoptDocumentStyles?: boolean;
};

export default function WorkspaceShellPage({ name, css = '', children, onBodyClick, adoptDocumentStyles }: WorkspaceShellPageProps) {
  const [open, setOpen] = useState(false);

  return (
    <DashboardShellHost
      name={name}
      css={unifiedNavigationCss + css}
      adoptDocumentStyles={adoptDocumentStyles}
      onBodyClick={onBodyClick}
      after={
        <button
          type="button"
          className="sn-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      }
    >
      <UnifiedNavigation flow open={open} close={() => setOpen(false)} />
      {children}
    </DashboardShellHost>
  );
}
