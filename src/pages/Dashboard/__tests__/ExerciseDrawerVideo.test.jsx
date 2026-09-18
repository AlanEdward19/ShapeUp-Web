import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ExerciseDrawerVideo } from '../markup/ExerciseDrawerVideo';

beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

describe('ExerciseDrawerVideo', () => {
  it('renders a 16:9 native player with play, progress, replay, timestamp, and fullscreen for file URLs', () => {
    const { container, getByTitle, getByRole } = render(
      <ExerciseDrawerVideo videoUrl="https://cdn.example.com/clip.mp4" title="Supino" />,
    );
    const wrap = container.querySelector('[data-video-player]');
    expect(wrap).toHaveClass('aspect-video');
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/clip.mp4');
    expect(getByTitle('Reproduzir')).toBeTruthy();
    expect(getByRole('slider', { name: 'Progresso do vídeo' })).toBeTruthy();
    expect(getByTitle('Replay')).toBeTruthy();
    expect(getByTitle('Tela cheia')).toBeTruthy();
    expect(container).toHaveTextContent('0:00');
  });

  it('shows a YouTube poster and loads the iframe only after play', () => {
    const { container, getByTitle, queryByTitle } = render(
      <ExerciseDrawerVideo videoUrl="https://www.youtube.com/watch?v=dQw4w9wgGcQ" title="Supino" />,
    );
    expect(container.querySelector('iframe')).toBeNull();
    const poster = container.querySelector('img');
    expect(poster).toHaveAttribute('src', 'https://img.youtube.com/vi/dQw4w9wgGcQ/hqdefault.jpg');
    fireEvent.click(getByTitle('Reproduzir'));
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      expect.stringContaining('youtube.com/embed/dQw4w9wgGcQ'),
    );
    expect(queryByTitle('Reproduzir')).toBeNull();
  });

  it('shows a Vimeo lite-embed and loads the iframe only after play', () => {
    const { container, getByTitle } = render(
      <ExerciseDrawerVideo videoUrl="https://vimeo.com/123456789" title="Supino" />,
    );
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(getByTitle('Reproduzir'));
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      expect.stringContaining('player.vimeo.com/video/123456789'),
    );
  });

  it('shows empty copy for missing, invalid, and unknown-host URLs instead of a player', () => {
    const empty = render(<ExerciseDrawerVideo title="Supino" />);
    expect(empty.container).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(empty.container.querySelector('video')).toBeNull();
    expect(empty.container.querySelector('iframe')).toBeNull();
    empty.unmount();

    const invalid = render(<ExerciseDrawerVideo videoUrl="not a url" title="Supino" />);
    expect(invalid.container).toHaveTextContent('Vídeo de execução não cadastrado');
    invalid.unmount();

    const unknown = render(
      <ExerciseDrawerVideo videoUrl="https://player.example.com/embed/abc" title="Supino" />,
    );
    expect(unknown.container).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(unknown.container.querySelector('iframe')).toBeNull();
  });

  it('resets to paused start when videoUrl changes', () => {
    const { container, getByTitle, rerender } = render(
      <ExerciseDrawerVideo videoUrl="https://www.youtube.com/watch?v=dQw4w9wgGcQ" title="A" />,
    );
    fireEvent.click(getByTitle('Reproduzir'));
    expect(container.querySelector('iframe')).toBeTruthy();
    rerender(<ExerciseDrawerVideo videoUrl="https://cdn.example.com/clip.mp4" title="B" />);
    expect(container.querySelector('iframe')).toBeNull();
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video.paused).toBe(true);
    expect(getByTitle('Reproduzir')).toBeTruthy();
  });
});
