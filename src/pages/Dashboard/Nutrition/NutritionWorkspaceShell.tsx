import { Suspense, useRef, type ReactElement, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import WorkspaceShellPage from '../../../components/Workspace/WorkspaceShellPage';
import Skeleton from '../../../components/Skeleton';
import NutritionNav from './NutritionNav';
import nutritionCss from './Nutrition.css?inline';

const diaryLayoutCss =
  'article table{min-width:520px}article{overflow:auto}@media(max-width:767px){.shell-body .pl-64,.shell-body .su-nutrition-workspace{padding-left:0!important}}';

const tokenBridgeCss = `:host,.shell-body{
color-scheme:dark;
--primary:#e06c43;
--primary-hover:#e87a53;
--accent:#7d9b68;
--text-on-primary:#181311;
--link-color:#e06c43;
--bg-main:#18120f;
--bg-card:#211a17;
--bg-input:#1c1614;
--bg-surface-lowest:#130d0a;
--bg-surface-high:#302825;
--bg-surface-highest:#3b3330;
--text-main:#f5ede6;
--text-muted:#a89990;
--text-inverse:#18120f;
--border-color:#3b322e;
--border-input:#3b322e;
--border-input-focus:#e06c43;
--outline:#a58b83;
--success:#7d9b68;
--warning:#d4a359;
--error:#e5534a;
--danger:#e5534a;
--secondary-container:#334e23;
--tertiary-container:#b68941;
}`;

const shellCss = tokenBridgeCss + nutritionCss + diaryLayoutCss;

function CachedOutlet(): ReactElement {
  const location = useLocation();
  const outlet = useOutlet();
  const cacheRef = useRef<Record<string, ReactNode>>({});

  if (outlet) {
    cacheRef.current[location.pathname] = outlet;
  }

  return (
    <>
      {Object.entries(cacheRef.current).map(([path, node]) => (
        <div key={path} hidden={path !== location.pathname}>
          {node}
        </div>
      ))}
    </>
  );
}

export default function NutritionWorkspaceShell(): ReactElement {
  return (
    <WorkspaceShellPage name="nutrition" css={shellCss}>
      <div className="su-nutrition-workspace" data-testid="nutrition-workspace">
        <div className="su-nutrition-workspace-inner">
          <NutritionNav />
          <Suspense fallback={<Skeleton variant="card" rows={2} />}>
            <CachedOutlet />
          </Suspense>
        </div>
      </div>
    </WorkspaceShellPage>
  );
}
