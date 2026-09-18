import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import manifest from '../shell-assets/manifest.json';
import useShellLanguage from '../../hooks/useShellLanguage';
import { useAuth } from '../../contexts/AuthContext';

const styles = import.meta.glob('../shell-assets/styles/*.css', {
  query: '?inline',
  import: 'default',
  eager: true,
}) as Record<string, string>;

type ManifestEntry = { bodyClass?: string; fonts: string[] };
const manifestEntries = manifest as Record<string, ManifestEntry>;

const hostBaseCss = `.st-language-picker select,.st-language-picker option{background-color:var(--bg-card)!important;color:var(--text-main)!important;color-scheme:dark}.st-language-picker select{cursor:pointer}:host{all:initial;display:block;color-scheme:dark}.shell-body{min-height:100dvh;width:100%;box-sizing:border-box}.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased}button,a,input,select,textarea{touch-action:manipulation}[hidden]{display:none!important}button:disabled{opacity:.5;cursor:not-allowed} :focus-visible{outline:2px solid var(--primary);outline-offset:3px}`;

type PublicShellHostProps = {
  name: 'landing' | 'login' | 'recovery' | 'register' | 'invitation' | 'onboarding';
  children: ReactNode;
  css?: string;
  bodyClass?: string;
  reveal?: boolean;
  onBodyClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onBodySubmit?: (event: FormEvent<HTMLDivElement>) => void;
  onShadowRoot?: (root: ShadowRoot | null) => void;
  bindShadow?: (root: ShadowRoot) => void;
};

export default function PublicShellHost({
  name,
  children,
  css = '',
  bodyClass,
  reveal = false,
  onBodyClick,
  onBodySubmit,
  onShadowRoot,
  bindShadow,
}: PublicShellHostProps) {
  const navigate = useNavigate();
  const auth = useAuth() as unknown as { currentUser?: unknown } | undefined;
  const showLanguagePicker = !auth?.currentUser && ['landing', 'login', 'register', 'invitation', 'recovery'].includes(name);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const language = useShellLanguage(root);
  const attach = useCallback((node: HTMLDivElement | null) => {
    if (node) setRoot(node.shadowRoot || node.attachShadow({ mode: 'open' }));
  }, []);

  useEffect(() => {
    if (!root) return;
    onShadowRoot?.(root);
    bindShadow?.(root);
    return () => onShadowRoot?.(null);
  }, [root, onShadowRoot, bindShadow]);

  const entry = manifestEntries[name];

  useEffect(() => {
    if (!root || !reveal || !window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = 'visible';
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.querySelectorAll('section').forEach((section) => {
      (section as HTMLElement).dataset.reveal = 'pending';
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [root, reveal]);

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

  const inlineCss = styles[`../shell-assets/styles/${name}.css`] ?? '';

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
                data-auth-register={name === 'register' ? '' : undefined}
                onClick={click}
                onSubmit={onBodySubmit}
              >
                {children}
                {language && showLanguagePicker && (
                  <label
                    className="st-language-picker"
                    style={{
                      position: 'fixed',
                      right: 12,
                      bottom: name === 'login' ? 100 : 12,
                      zIndex: 95,
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                    }}
                  >
                    <select
                      aria-label="Language / Idioma"
                      value={language.language}
                      onChange={(event) => language.setLanguage(event.target.value)}
                      style={{
                        background: 'transparent',
                        color: 'inherit',
                        border: 0,
                        fontSize: 12,
                        padding: 4,
                        colorScheme: 'dark',
                      }}
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
    [root, entry, inlineCss, css, bodyClass, children, click, onBodySubmit, language, showLanguagePicker, name],
  );

  return (
    <div
      ref={attach}
      data-shell={name}
      style={{ display: 'block', width: '100%', minHeight: '100dvh' }}
    >
      {portal}
    </div>
  );
}
