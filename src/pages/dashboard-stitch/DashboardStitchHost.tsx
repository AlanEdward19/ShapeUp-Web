import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import manifest from '../../stitch/manifest.json';
import exercisesCss from '../../stitch/styles/exercises.css?inline';

const manifestEntries = manifest as Record<string, { bodyClass?: string; fonts: string[] }>;

const hostBaseCss = `:host{all:initial;display:block;color-scheme:dark}.stitch-body{min-height:100dvh;width:100%;box-sizing:border-box}.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased}button,a,input,select,textarea{touch-action:manipulation}[hidden]{display:none!important}button:disabled{opacity:.5;cursor:not-allowed} :focus-visible{outline:2px solid #e06c43;outline-offset:3px}`;

const inlineStyles: Record<string, string> = {
  exercises: exercisesCss,
};

type DashboardStitchHostProps = {
  name: 'exercises';
  children: ReactNode;
  css?: string;
  after?: ReactNode;
};

export default function DashboardStitchHost({ name, children, css = '', after }: DashboardStitchHostProps) {
  const navigate = useNavigate();
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const attach = useCallback((node: HTMLDivElement | null) => {
    if (node) setRoot(node.shadowRoot || node.attachShadow({ mode: 'open' }));
  }, []);

  const entry = manifestEntries[name];

  useEffect(() => {
    for (const href of entry.fonts) {
      if (
        [...window.document.querySelectorAll('link[rel=stylesheet]')].some(
          (link) => (link as HTMLLinkElement).href === href,
        )
      )
        continue;
      const link = window.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      window.document.head.appendChild(link);
    }
  }, [entry.fonts]);

  const click = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (href?.startsWith('/') && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      navigate(href);
    }
  };

  const portal = useMemo(
    () =>
      root
        ? createPortal(
            <>
              {entry.fonts.map((href) => (
                <link key={href} rel="stylesheet" href={href} />
              ))}
              <style>{inlineStyles[name] ?? ''}</style>
              <style>{`${hostBaseCss}${css}`}</style>
              <div className={`stitch-body dark ${entry.bodyClass ?? ''}`} onClick={click}>
                {children}
                {after}
              </div>
            </>,
            root,
          )
        : null,
    [root, entry, name, css, children, after, click],
  );

  return (
    <div ref={attach} data-stitch={name} style={{ display: 'block', width: '100%', minHeight: '100dvh' }}>
      {portal}
    </div>
  );
}
