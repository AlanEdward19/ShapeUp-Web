import type { ReactElement, ReactNode } from 'react';
import WorkspaceShellPage from './WorkspaceShellPage';
import { workspaceNavStyle } from '../../pages/shell-assets/workspaceNavStyle';
import type { DashboardShellPageName } from '../../pages/shell-assets/DashboardShellHost';

const routedPageCss = `
:host,.shell-body{
color-scheme:dark;
--primary:#e06c43;--primary-hover:#e87a53;--accent:#7d9b68;--text-on-primary:#181311;--link-color:#e06c43;
--bg-main:#18120f;--bg-card:#211a17;--bg-input:#1c1614;--bg-surface-lowest:#130d0a;--bg-surface-high:#302825;--bg-surface-highest:#3b3330;
--text-main:#f5ede6;--text-muted:#a89990;--text-inverse:#18120f;
--border-color:#3b322e;--border-input:#3b322e;--border-input-focus:#e06c43;--outline:#a58b83;
--success:#7d9b68;--warning:#d4a359;--error:#e5534a;--danger:#e5534a;--secondary-container:#334e23;--tertiary-container:#b68941;
--font-display:'Barlow Condensed','Arial Narrow',Impact,sans-serif;--font-sans:'Source Sans 3','Segoe UI',sans-serif;
--radius-sm:0.375rem;--radius-md:0.5rem
}
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
