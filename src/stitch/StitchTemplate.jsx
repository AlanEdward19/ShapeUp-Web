import { sourceDocument, renderSource } from './sourceRuntime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import manifest from './manifest.json';
import useStitchLanguage from './useStitchLanguage';
import Logo from '../components/Logo/Logo';
import { useAuth } from '../contexts/AuthContext';

const styles = import.meta.glob('./styles/*.css', { query: '?inline', import: 'default', eager: true });
export default function StitchTemplate({ name, bind, onClick, onSubmit, children, after, css = '', bodyClass, reveal = false }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const showLanguagePicker = !auth?.currentUser && ['landing', 'login', 'register', 'invitation', 'recovery'].includes(name);
  const [root, setRoot] = useState(null);
  const language = useStitchLanguage(root);
  const attach = useCallback(node => { if (node) setRoot(node.shadowRoot || node.attachShadow({ mode: 'open' })); }, []);
  const document = useMemo(() => sourceDocument(name), [name]);
  useEffect(() => {
    if (!root || !reveal || !window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.dataset.reveal = 'visible'; observer.unobserve(entry.target); } }), { threshold: .08 });
    root.querySelectorAll('section').forEach(section => { section.dataset.reveal = 'pending'; observer.observe(section); });
    return () => observer.disconnect();
  }, [root, reveal]);
  useEffect(() => {
    // Font faces must be registered on the document, not inside a shadow tree.
    for (const href of manifest[name].fonts) {
      if ([...window.document.querySelectorAll('link[rel=stylesheet]')].some(link => link.href === href)) continue;
      const link = window.document.createElement('link'); link.rel = 'stylesheet'; link.href = href; window.document.head.appendChild(link);
    }
  }, [name]);
  const bindView = Object.assign((node, props, children, render) => {
    const replacement = bind?.(node, props, children, render);
    if (replacement !== undefined) return replacement;
    if (!bind) return;
    const brandedImage = element => element?.localName === 'img' && /shapeup/i.test(element.getAttribute('alt') || '');
    if (node.localName === 'a' && [...node.querySelectorAll('img')].some(brandedImage) && node.textContent.replace(/\s/g, '').toLowerCase() === 'shapeup') return <a {...props} href="/" aria-label="ShapeUp — Home"><Logo variant="lockup" width="148" height="36" /></a>;
    if (brandedImage(node)) return <Logo variant="mark" className={props.className} style={{width:32,height:28}} />;
  }, { translateText: bind?.translateText });
  const content = [...document.body.childNodes].map((node, index) => renderSource(node, bindView, `${name}-${index}`));
  const click = event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const anchor = event.target.closest('a');
    const href = anchor?.getAttribute('href');
    if (href?.startsWith('/') && !event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); navigate(href); }
    else if (href?.startsWith('#') && href.length > 1) { const target = root?.getElementById(href.slice(1)); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); } }
  };
  return <div ref={attach} data-stitch={name} style={{ display: 'block', width: '100%', minHeight: '100dvh' }}>{root && createPortal(<>
    {manifest[name].fonts.map(href => <link key={href} rel="stylesheet" href={href} />)}
    <style>{styles[`./styles/${name}.css`]}</style>
    <style>{`.st-language-picker select,.st-language-picker option{background-color:#211a17!important;color:#f3eae5!important;color-scheme:dark}.st-language-picker select{cursor:pointer}:host{all:initial;display:block;color-scheme:dark}.stitch-body{min-height:100dvh;width:100%;box-sizing:border-box}.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased}button,a,input,select,textarea{touch-action:manipulation}[hidden]{display:none!important}button:disabled{opacity:.5;cursor:not-allowed} :focus-visible{outline:2px solid #e06c43;outline-offset:3px}${css}`}</style>
    <div data-auth-register={name === 'register' ? '' : undefined} className={`stitch-body dark ${bodyClass ?? manifest[name].bodyClass}`} onClick={click} onSubmit={onSubmit}>{children ?? content}{after}{language && showLanguagePicker && !children && <label className="st-language-picker" style={{position:'fixed',right:12,bottom:name === 'login' ? 100 : 12,zIndex:95,background:'#211a17',color:'#f3eae5',border:'1px solid #3a2d27',borderRadius:6,padding:'4px 8px',fontSize:12}}><select aria-label="Language / Idioma" value={language.language} onChange={event => language.setLanguage(event.target.value)} style={{background:'transparent',color:'inherit',border:0,fontSize:12,padding:4,colorScheme:'dark'}}><option value="pt-BR">PT</option><option value="en">EN</option><option value="es">ES</option></select></label>}</div>
  </>, root)}</div>;
}


