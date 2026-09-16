import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import manifest from './manifest.json';
import useShellLanguage from '../../hooks/useShellLanguage';
import { useAuth } from '../../contexts/AuthContext';

const styles = import.meta.glob('./styles/*.css', {
  query: '?inline',
  import: 'default',
  eager: true,
}) as Record<string, string>;

type ManifestEntry = { bodyClass?: string; fonts: string[] };
const manifestEntries = manifest as Record<string, ManifestEntry>;

const hostBaseCss = `.st-language-picker select,.st-language-picker option{background-color:#211a17!important;color:#f3eae5!important;color-scheme:dark}.st-language-picker select{cursor:pointer}:host{all:initial;display:block;color-scheme:dark}.shell-body{min-height:100dvh;width:100%;box-sizing:border-box}.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased}button,a,input,select,textarea{touch-action:manipulation}[hidden]{display:none!important}button:disabled{opacity:.5;cursor:not-allowed} :focus-visible{outline:2px solid #e06c43;outline-offset:3px}`;

export type DashboardShellPageName =
  | 'gyms'
  | 'exercises'
  | 'messages'
  | 'settings'
  | 'nutrition'
  | 'moderation'
  | 'finance'
  | 'athlete'
  | 'professional'
  | 'builder'
  | 'onboarding';

type DashboardShellHostProps = {
  name: DashboardShellPageName;
  children: ReactNode;
  css?: string;
  bodyClass?: string;
  after?: ReactNode;
  onBodyClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onBodySubmit?: (event: FormEvent<HTMLDivElement>) => void;
};

export default function DashboardShellHost({
  name,
  children,
  css = '',
  bodyClass,
  after,
  onBodyClick,
  onBodySubmit,
}: DashboardShellHostProps) {
  const navigate = useNavigate();
  const auth = useAuth() as unknown as { currentUser?: unknown } | undefined;
  const showLanguagePicker = !auth?.currentUser && false;
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const language = useShellLanguage(root);
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
  }, [name, entry.fonts]);

  const click = (event: MouseEvent<HTMLDivElement>) => {
    onBodyClick?.(event);
    if (event.defaultPrevented) return;
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (href?.startsWith('/') && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      navigate(href);
    } else if (href?.startsWith('#') && href.length > 1) {
      const target = root?.getElementById(href.slice(1));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const inlineCss = styles[`./styles/${name}.css`] ?? '';

  const portal = useMemo(
    () =>
      root
        ? createPortal(
            <>
              {entry.fonts.map((href) => (
                <link key={href} rel="stylesheet" href={href} />
              ))}
              <style>{inlineCss}</style>
              <style>{`${hostBaseCss}${css}`}</style>
              <div
                className={`shell-body dark ${bodyClass ?? entry.bodyClass ?? ''}`}
                onClick={click}
                onSubmit={onBodySubmit}
              >
                {children}
                {after}
                {language && showLanguagePicker && (
                  <label className="st-language-picker" style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 95 }}>
                    <select
                      aria-label="Language / Idioma"
                      value={language.language}
                      onChange={(event) => language.setLanguage(event.target.value)}
                    >
                      <option value="pt-BR">PT</option>
                      <option value="en">EN</option>
                      <option value="es">ES</option>
                    </select>
                  </label>
                )}
              </div>
            </>,
            root,
          )
        : null,
    [root, entry, inlineCss, css, bodyClass, children, after, click, onBodySubmit, language, showLanguagePicker],
  );

  return (
    <div ref={attach} data-shell={name} style={{ display: 'block', width: '100%', minHeight: '100dvh' }}>
      {portal}
    </div>
  );
}
