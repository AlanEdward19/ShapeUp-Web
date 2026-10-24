import type { ReactElement, ReactNode } from 'react';
import WorkspaceShellPage from './WorkspaceShellPage';
import { workspaceNavStyle } from '../../pages/shell-assets/workspaceNavStyle';
import type { DashboardShellPageName } from '../../pages/shell-assets/DashboardShellHost';

const routedPageCss = `
.shell-body{font-family:var(--font-sans);background:var(--bg-main);color:var(--text-main)}
.su-workspace-routed{margin-left:256px;min-height:100dvh;min-width:0;box-sizing:border-box;padding:1.75rem 2rem 2.5rem}
.su-workspace-routed .su-page-title{font-size:clamp(1.75rem,2.6vw,2.25rem);line-height:1.1;font-weight:700;margin:0}
@media(max-width:767px){.su-workspace-routed{margin-left:0;padding:1rem}}
`;

type WorkspaceRoutedPageProps = {
  children: ReactNode;
};

export default function WorkspaceRoutedPage({ children }: WorkspaceRoutedPageProps): ReactElement {
  const role = localStorage.getItem('shapeup_role');
  const name: DashboardShellPageName =
    role === 'professional' || role === 'gym' ? 'professional' : 'athlete';

  return (
    <WorkspaceShellPage name={name} css={workspaceNavStyle + routedPageCss} adoptDocumentStyles>
      <div className="su-workspace-routed" data-shell-content data-testid="workspace-routed-page">
        {children}
      </div>
    </WorkspaceShellPage>
  );
}
