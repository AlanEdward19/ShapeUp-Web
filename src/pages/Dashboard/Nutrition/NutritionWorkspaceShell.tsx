import { Suspense, useRef, type ReactElement, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import WorkspaceShellPage from '../../../components/Workspace/WorkspaceShellPage';
import Skeleton from '../../../components/Skeleton';
import NutritionNav from './NutritionNav';
import nutritionCss from './Nutrition.css?inline';
import diaryCss from './diary.css?inline';

const diaryLayoutCss =
  '@media(max-width:767px){.shell-body .pl-64,.shell-body .su-nutrition-workspace{padding-left:0!important}}';

const shellCss = nutritionCss + diaryCss + diaryLayoutCss;

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
    <WorkspaceShellPage name="nutrition" css={shellCss} adoptDocumentStyles>
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
