import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { copy } from './copy';

export default function useStitchLanguage(root) {
  const context = useLanguage();
  const language = context?.language || 'pt-BR';
  const originals = useRef(new WeakMap());
  useEffect(() => {
    if (!root) return;
    const translate = value => {
      const clean = value.replace(/\s+/g, ' ').trim();
      const column = language === 'es' ? 1 : 0;
      let translated = language === 'pt-BR' ? clean : copy[clean]?.[column] || context?.translateCopy?.(clean) || clean;
      if (language !== 'pt-BR' && translated === clean) {
        const counted = clean.match(/^(\d+) (exercícios encontrados|exercícios|séries|sessões|refeições registradas|alunos|dias registrados|concluídos|fichas|pendentes)$/);
        if (counted) {
          const terms = { 'exercícios encontrados':['exercises found','ejercicios encontrados'], 'exercícios':['exercises','ejercicios'], 'séries':['sets','series'], 'sessões':['sessions','sesiones'], 'refeições registradas':['meals logged','comidas registradas'], 'alunos':['athletes','alumnos'], 'dias registrados':['days logged','días registrados'], 'concluídos':['completed','completados'], 'fichas':['programs','rutinas'], 'pendentes':['pending','pendientes'] };
          translated = counted[1] + ' ' + terms[counted[2]][column];
        }
        translated = translated.replace(/^Enviar mensagem para (.+)\.\.\.$/, language === 'es' ? 'Enviar mensaje a $1...' : 'Send a message to $1...');
      }
      return value.replace(value.trim(), translated);
    };
    const visit = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.parentElement || node.parentElement.closest('style,script,.material-symbols-outlined,[translate=no],textarea')) continue;
        const saved = originals.current.get(node);
        const source = saved && node.data === saved.output ? saved.source : node.data;
        const output = translate(source);
        originals.current.set(node, { source, output });
        if (node.data !== output) node.data = output;
      }
      root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(node => {
        for (const attr of ['placeholder', 'title', 'aria-label']) {
          if (!node.hasAttribute(attr)) continue;
          const cache = originals.current.get(node) || {};
          const current = node.getAttribute(attr);
          const source = cache[attr]?.output === current ? cache[attr].source : current;
          const output = translate(source);
          cache[attr] = { source, output }; originals.current.set(node, cache);
          if (current !== output) node.setAttribute(attr, output);
        }
      });
    };
    const observer = new MutationObserver(() => { observer.disconnect(); visit(); observer.observe(root, { childList: true, characterData: true, subtree: true }); });
    visit(); observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [root, language, context]);
  return context;
}
