import { Suspense, useRef, type ReactElement, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import WorkspaceShellPage from '../../../components/Workspace/WorkspaceShellPage';
import Skeleton from '../../../components/Skeleton';
import NutritionNav from './NutritionNav';
import nutritionCss from './Nutrition.css?inline';

const diaryLayoutCss =
  'article table{min-width:520px}article{overflow:auto}@media(max-width:767px){.shell-body .pl-64,.shell-body .su-nutrition-workspace{padding-left:0!important}}';

const shellCss = nutritionCss + diaryLayoutCss;

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
