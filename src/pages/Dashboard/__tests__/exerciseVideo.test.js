import { describe, expect, it } from 'vitest';
import { detectVideoKind } from '../markup/exerciseVideo';

describe('detectVideoKind', () => {
  it('classifies direct file URLs by video extension', () => {
    expect(detectVideoKind('https://cdn.example.com/clip.mp4')).toBe('file');
    expect(detectVideoKind('https://cdn.example.com/clip.webm')).toBe('file');
    expect(detectVideoKind('https://cdn.example.com/clip.mov')).toBe('file');
    expect(detectVideoKind('https://cdn.example.com/clip.ogg')).toBe('file');
  });

  it('classifies YouTube hosts as youtube', () => {
    expect(detectVideoKind('https://www.youtube.com/watch?v=dQw4w9wgGcQ')).toBe('youtube');
    expect(detectVideoKind('https://youtu.be/dQw4w9wgGcQ')).toBe('youtube');
  });

  it('classifies Vimeo hosts as vimeo', () => {
    expect(detectVideoKind('https://vimeo.com/123456789')).toBe('vimeo');
  });

  it('classifies empty or missing URLs as invalid', () => {
    expect(detectVideoKind()).toBe('invalid');
    expect(detectVideoKind('')).toBe('invalid');
    expect(detectVideoKind('   ')).toBe('invalid');
  });

  it('classifies malformed strings as invalid', () => {
    expect(detectVideoKind('not a url')).toBe('invalid');
    expect(detectVideoKind('http://')).toBe('invalid');
  });

  it('classifies unknown hosts as invalid, never a generic iframe provider', () => {
    expect(detectVideoKind('https://player.example.com/embed/abc')).toBe('invalid');
    expect(detectVideoKind('https://dailymotion.com/video/x123')).toBe('invalid');
  });
});
