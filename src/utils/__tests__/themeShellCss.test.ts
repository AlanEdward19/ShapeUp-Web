import { describe, expect, it } from 'vitest';
import { themeShellCss, tokenFor } from '../themeShellCss';

describe('themeShellCss', () => {
  it('maps dark surfaces to elevation tokens', () => {
    expect(tokenFor('background-color', [23, 19, 17])).toBe('--bg-main');
    expect(tokenFor('background-color', [33, 26, 23])).toBe('--bg-card');
    expect(tokenFor('background-color', [48, 40, 37])).toBe('--bg-surface-high');
  });

  it('maps oxide to primary for fills and to the accessible link color for text', () => {
    expect(tokenFor('background-color', [224, 108, 67])).toBe('--primary');
    expect(tokenFor('color', [224, 108, 67])).toBe('--link-color');
  });

  it('turns peach text into secondary ink instead of brand orange', () => {
    expect(tokenFor('color', [255, 181, 157])).toBe('--text-muted');
  });

  it('keeps alpha, including Tailwind opacity variables', () => {
    const css = '.a{background-color: rgb(33 26 23 / 0.5)}.b{color: rgb(245 237 230 / var(--tw-text-opacity, 1))}';
    const out = themeShellCss(css);
    expect(out).toContain('background-color: color-mix(in srgb, var(--bg-card) 50%, transparent)');
    expect(out).toContain('color: color-mix(in srgb, var(--text-main) calc((var(--tw-text-opacity, 1)) * 100%), transparent)');
  });

  it('leaves white and unknown colors alone', () => {
    const css = '.t{color: rgb(255 255 255 / 1)}.s{box-shadow: 0 0 0 rgb(0 0 0 / .4)}';
    expect(themeShellCss(css)).toBe(css);
  });
});
