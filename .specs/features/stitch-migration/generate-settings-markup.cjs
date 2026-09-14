/**
 * settings.html → static JSX (main column only, no prototype sidebar).
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const templatesDir = path.join(__dirname, '../../../src/stitch/templates');
const outDir = path.join(__dirname, '../../../src/pages/dashboard-stitch/markup');

const attrMap = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  spellcheck: 'spellCheck',
  crossorigin: 'crossOrigin',
};
const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
const boolAttrs = new Set(['required', 'disabled', 'multiple', 'readOnly', 'autoFocus', 'hidden', 'open', 'checked']);

function escapeJsxText(text) {
  if (!text) return '';
  const parts = text.split(/(\{|\})/);
  return parts
    .map((p) => {
      if (p === '{') return "{'{'}"; 
      if (p === '}') return "{'}'}";
      return p.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    })
    .join('');
}

function attrValue(name, value) {
  if (boolAttrs.has(name) && (value === '' || value === name)) return `{true}`;
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `"${escaped}"`;
}

function formatAttrs(props) {
  const lines = Object.entries(props).map(([k, v]) => `      ${k}=${attrValue(k, v)}`);
  return lines.length ? '\n' + lines.join('\n') + '\n' : '';
}

function nodeToJsx(node, indent = '    ') {
  if (node.nodeType === 3) {
    const t = node.textContent;
    if (!t.trim()) return t.includes('\n') ? '\n' : '';
    return escapeJsxText(t);
  }
  if (node.nodeType !== 1) return '';
  const tag = node.tagName.toLowerCase();
  if (['script', 'style', 'link', 'meta'].includes(tag)) return '';
  if (tag === 'aside') return '';

  const props = {};
  for (const attr of node.attributes) {
    if (/^on/i.test(attr.name)) continue;
    let name = attrMap[attr.name] || attr.name;
    if (name === 'checked') {
      props.defaultChecked = 'true';
      continue;
    }
    if (name === 'selected') continue;
    if (name === 'value' && ['input', 'textarea', 'select'].includes(tag)) {
      props.defaultValue = attr.value;
      continue;
    }
    if (boolAttrs.has(name)) {
      props[name] = 'true';
      continue;
    }
    if (/^(stroke|fill|clip|font|stop|color)-/.test(name)) {
      name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }
    props[name] = attr.value;
  }
  if (tag === 'button' && !props.type) props.type = 'button';

  const childParts = [...node.childNodes].map((c) => nodeToJsx(c, indent + '  ')).filter(Boolean);
  const children = childParts.join('');
  const attrs = formatAttrs(props);

  if (voidTags.has(tag)) {
    return `${indent}<${tag}${attrs ? attrs.trimEnd() + '\n' + indent : ' '}/>\n`;
  }

  if (!children.trim()) {
    return `${indent}<${tag}${attrs ? attrs.trimEnd() + '\n' + indent : ''}></${tag}>\n`;
  }

  const open = `${indent}<${tag}${attrs ? attrs.trimEnd() + '\n' + indent : ''}>`;
  const close = `</${tag}>\n`;
  if (children.includes('\n') || children.length > 80) {
    return `${open}\n${children}${indent}${close}`;
  }
  return `${open}${children}${close}`;
}

const html = fs.readFileSync(path.join(templatesDir, 'settings.html'), 'utf8');
const dom = new JSDOM(`<body>${html}</body>`);
const body = dom.window.document.body;
const jsx = [...body.childNodes].map((n) => nodeToJsx(n)).join('');
const file = `/* eslint-disable */\n/* Auto-generated from stitch/templates/settings.html — wire via SettingsPublicMarkup */\nimport type { ReactElement } from 'react';\n\nexport function SettingsStaticMarkup(): ReactElement {\n  return (\n    <>\n${jsx}    </>\n  );\n}\n`;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'SettingsStaticMarkup.tsx'), file);
console.log('wrote SettingsStaticMarkup.tsx');
