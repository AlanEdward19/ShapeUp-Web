import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { useTourAnchor } from './tourAnchorContext';
import { findWorkspaceTarget } from './workspaceTour';

export default function TourShadowAnchor() {
  const { targetSelector } = useTourAnchor();
  const [style, setStyle] = useState<CSSProperties>({ display: 'none' });

  const sync = useCallback(() => {
    if (!targetSelector) {
      setStyle({ display: 'none' });
      return;
    }
    const el = findWorkspaceTarget(targetSelector);
    if (!el) {
      setStyle({ display: 'none' });
      return;
    }
    const rect = el.getBoundingClientRect();
    setStyle({
      display: 'block',
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      pointerEvents: 'none',
      zIndex: 9998,
    });
  }, [targetSelector]);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (!targetSelector) return undefined;
    const capture = { capture: true };
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, capture);
    const shell = document.querySelector('[data-shell]');
    const shadow = shell?.shadowRoot;
    shadow?.addEventListener('scroll', sync, capture);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, capture);
      shadow?.removeEventListener('scroll', sync, capture);
    };
  }, [targetSelector, sync]);

  return <div id="tour-anchor" aria-hidden="true" data-testid="tour-anchor" style={style} />;
}
