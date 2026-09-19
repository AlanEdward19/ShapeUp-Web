import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { useTourAnchor } from './tourAnchorContext';
import { findWorkspaceTarget } from './workspaceTour';

function hiddenStyle(): CSSProperties {
  return { display: 'none' };
}

function boxStyle(el: Element): CSSProperties {
  const rect = el.getBoundingClientRect();
  return {
    display: 'block',
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    pointerEvents: 'none',
    zIndex: 9998,
  };
}

export default function TourShadowAnchor() {
  const { anchors } = useTourAnchor();
  const [styles, setStyles] = useState<CSSProperties[]>([]);

  const sync = useCallback(() => {
    setStyles(
      anchors.map(anchor => {
        const el = findWorkspaceTarget(anchor.selector);
        return el ? boxStyle(el) : hiddenStyle();
      }),
    );
  }, [anchors]);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (anchors.length === 0) return undefined;
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
  }, [anchors, sync]);

  return (
    <>
      {anchors.map((anchor, index) => (
        <div
          key={anchor.id}
          id={anchor.id}
          aria-hidden="true"
          data-testid="tour-anchor"
          style={styles[index] ?? hiddenStyle()}
        />
      ))}
    </>
  );
}
