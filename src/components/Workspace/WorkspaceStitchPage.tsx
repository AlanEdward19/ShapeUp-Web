import { useState, type MouseEvent, type ReactNode } from 'react';
import DashboardStitchHost, { type DashboardStitchPageName } from '../../pages/dashboard-stitch/DashboardStitchHost';
import UnifiedNavigation from './UnifiedNavigation';
import { unifiedNavigationCss } from './unifiedNavigationStyles';

type WorkspaceStitchPageProps = {
  name: DashboardStitchPageName;
  css?: string;
  children: ReactNode;
  onBodyClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function WorkspaceStitchPage({ name, css = '', children, onBodyClick }: WorkspaceStitchPageProps) {
  const [open, setOpen] = useState(false);

  return (
    <DashboardStitchHost
      name={name}
      css={unifiedNavigationCss + css}
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
    </DashboardStitchHost>
  );
}
