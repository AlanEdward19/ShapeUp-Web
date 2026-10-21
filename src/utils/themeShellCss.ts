/**
 * The shadow-DOM shells ship Tailwind output compiled against the dark palette (literal rgb values).
 * This rewrites those literals to design-system tokens so every shell follows the app theme
 * and one token file controls the whole product.
 */

type Channels = [number, number, number];

function hsl([r, g, b]: Channels): { h: number; s: number; l: number } {
  const [rr, gg, bb] = [r, g, b].map(value => value / 255);
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l: l * 100 };
}

const ACCENT = new Set(['background-color', 'background', 'border-color', 'outline-color', 'fill', 'stroke']);

/** Returns the token for a literal color on a property, or null to leave it untouched. */
export function tokenFor(property: string, channels: Channels): string | null {
  const { h, s, l } = hsl(channels);
  const isText = property === 'color' || property === 'caret-color' || property === 'text-decoration-color';
  const isBorder = property.startsWith('border') || property === 'outline-color' || property.startsWith('--tw-ring') || property.startsWith('--tw-divide');
  if (channels.every(value => value >= 250)) return null;
  const chromatic = s > 0.3 && l > 18 && l < 85;

  if (chromatic) {
    if (h >= 5 && h < 28) return isText ? '--link-color' : '--primary';
    if (h >= 28 && h < 60) return '--warning';
    if (h >= 70 && h < 170) return isText ? '--success' : '--accent';
    if (h >= 345 || h < 5) return '--error';
    return null;
  }
  if (s > 0.55) return null;
  if (isText) {
    if (l >= 70) return '--text-main';
    if (l >= 38) return '--text-muted';
    return null;
  }
  if (isBorder) {
    if (l < 30) return '--border-color';
    return null;
  }
  if (ACCENT.has(property) || property.startsWith('--tw-gradient')) {
    if (l >= 90) return null;
    if (l < 9) return '--bg-main';
    if (l < 14) return '--bg-card';
    if (l < 19) return '--bg-surface-high';
    if (l < 30) return '--bg-surface-highest';
    return null;
  }
  return null;
}

const DECLARATION = /(^|[;{\s])((?:--tw-(?:ring|divide|gradient-(?:from|to|via))[a-z-]*|color|background-color|background|border(?:-(?:top|right|bottom|left))?-color|outline-color|caret-color|text-decoration-color|fill|stroke)):\s*rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:\/\s*([^;()]*(?:\([^)]*\)[^;()]*)*))?\)/g;

const cache = new Map<string, string>();

export function themeShellCss(css: string): string {
  const hit = cache.get(css);
  if (hit !== undefined) return hit;
  const out = css.replace(DECLARATION, (match, lead: string, property: string, r: string, g: string, b: string, alpha?: string) => {
    const token = tokenFor(property, [Number(r), Number(g), Number(b)]);
    if (!token) return match;
    const a = (alpha ?? '1').trim();
    if (a === '1' || a === '1.0') return `${lead}${property}: var(${token})`;
    const percent = /^[\d.]+$/.test(a) ? `${Math.round(Number(a) * 1000) / 10}%` : `calc((${a}) * 100%)`;
    return `${lead}${property}: color-mix(in srgb, var(${token}) ${percent}, transparent)`;
  });
  cache.set(css, out);
  return out;
}
