import { cloneElement, createElement, isValidElement } from 'react';
const templates = import.meta.glob('./templates/*.html', { query: '?raw', import: 'default', eager: true });
const documents = new Map();
const attributes = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete', autofocus: 'autoFocus', spellcheck: 'spellCheck', crossorigin: 'crossOrigin' };
const booleans = new Set(['required', 'disabled', 'multiple', 'readOnly', 'autoFocus', 'hidden', 'open']);
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function sourceDocument(name) {
  if (!documents.has(name)) documents.set(name, new DOMParser().parseFromString(templates[`./templates/${name}.html`], 'text/html'));
  return documents.get(name);
}

// The exported HTML is the view. Bindings replace data/handlers, never rebuild its layout.
export function renderSource(node, bind, key = 'source') {
  if (node.nodeType === 3) return bind?.translateText?.(node.textContent, node) ?? node.textContent;
  if (node.nodeType !== 1 || ['script', 'style', 'link', 'meta'].includes(node.localName)) return null;
  const tag = node.localName;
  const props = {};
  Object.defineProperty(props, 'key', { value: key, enumerable: false });
  for (const attr of node.attributes) {
    if (/^on/i.test(attr.name)) continue;
    let name = attributes[attr.name] || attr.name;
    if (name === 'style') {
      props.style = Object.fromEntries([...node.style].map(property => [property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), node.style.getPropertyValue(property)]));
    } else if (name === 'checked') props.defaultChecked = true;
    else if (name === 'selected') continue;
    else if (name === 'value' && ['input', 'textarea', 'select'].includes(tag)) props.defaultValue = attr.value;
    else if (booleans.has(name)) props[name] = true;
    else {
      if (/^(stroke|fill|clip|font|stop|color)-/.test(name)) name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props[name] = attr.value;
    }
  }
  if (tag === 'button' && !props.type) props.type = 'button';
  if (tag === 'select') props.defaultValue = node.querySelector('option[selected]')?.getAttribute('value') || node.querySelector('option[selected]')?.textContent;
  if (tag === 'textarea') props.defaultValue = node.textContent;
  const render = (child, childBind = bind, childKey = `${key}-copy`) => renderSource(child, childBind, childKey);
  const children = [...node.childNodes].map((child, index) => renderSource(child, bind, `${key}-${index}`));
  const replacement = bind?.(node, props, children, render);
  if (replacement !== undefined) return isValidElement(replacement) ? cloneElement(replacement, { key: replacement.key ?? key }) : replacement;
  return createElement(tag, { ...props, key }, voidElements.has(tag) || tag === 'textarea' ? undefined : children);
}

export const nodeText = node => node.textContent.replace(/\s+/g, ' ').trim();


