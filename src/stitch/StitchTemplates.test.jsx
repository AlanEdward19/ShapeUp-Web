import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import StitchTemplate from './StitchTemplate';
import { sourceDocument } from './sourceRuntime';
/** HTML templates still consumed by `sourceDocument` / `Workspace` in production shells + Builder (T19). */
const engineTemplateNames = [
  'builder',
  'settings',
  'messages',
  'moderation',
  'nutrition',
  'professional',
  'athlete',
  'onboarding',
];

describe('Original Stitch markup', () => {
  for (const name of engineTemplateNames) {
    it(`preserves the element hierarchy and classes of ${name}`, () => {
      const { container } = render(<MemoryRouter><StitchTemplate name={name} /></MemoryRouter>);
      const actual = container.querySelector('[data-stitch]').shadowRoot.querySelector('.stitch-body');
      const signature = root => [...root.querySelectorAll('*')].filter(node => !['script', 'style', 'link', 'meta'].includes(node.localName)).map(node => [node.localName, node.getAttribute('class') || '']);
      expect(signature(actual)).toEqual(signature(sourceDocument(name).body));
      expect(actual.querySelector('script')).toBeNull();
      expect(actual.querySelector('[onclick],[onsubmit]')).toBeNull();
    });
  }
});
