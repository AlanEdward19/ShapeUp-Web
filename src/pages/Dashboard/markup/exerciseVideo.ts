export type VideoKind = 'file' | 'youtube' | 'vimeo' | 'invalid';

const FILE_EXT = /\.(mp4|webm|mov|ogg)(?:[?#].*)?$/i;

export function detectVideoKind(url?: string): VideoKind {
  const value = String(url ?? '').trim();
  if (!value) return 'invalid';

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return 'invalid';
  }

  if (!/^https?:$/.test(parsed.protocol)) return 'invalid';

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) {
    return 'youtube';
  }
  if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
    return 'vimeo';
  }

  const path = parsed.pathname.toLowerCase();
  if (FILE_EXT.test(path)) return 'file';

  return 'invalid';
}
