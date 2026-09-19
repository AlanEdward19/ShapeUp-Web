import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { ExerciseDrawerVideo } from '../markup/ExerciseDrawerVideo';

beforeEach(() => {
  localStorage.setItem('shapeup_language', 'pt-BR');
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

function renderVideo(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('ExerciseDrawerVideo', () => {
  it('renders a square native player with play, progress, replay, timestamp, and fullscreen for file URLs', () => {
    const { container, getByTitle, getByRole } = renderVideo(
      <ExerciseDrawerVideo videoUrl="https://cdn.example.com/clip.mp4" title="Supino" />,
    );
    const wrap = container.querySelector('[data-video-player]');
    expect(wrap).toHaveClass('aspect-square');
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/clip.mp4');
    expect(getByTitle('Reproduzir')).toBeTruthy();
    expect(getByRole('slider', { name: 'Progresso do vídeo' })).toBeTruthy();
    expect(getByTitle('Replay')).toBeTruthy();
    expect(getByTitle('Tela cheia')).toBeTruthy();
    expect(container).toHaveTextContent('0:00');
  });

  it('shows a YouTube poster and loads the iframe only after play', () => {
    const { container, getByTitle, queryByTitle } = renderVideo(
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
    const { container, getByTitle } = renderVideo(
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
    const empty = renderVideo(<ExerciseDrawerVideo title="Supino" />);
    expect(empty.container).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(empty.container.querySelector('video')).toBeNull();
    expect(empty.container.querySelector('iframe')).toBeNull();
    empty.unmount();

    const invalid = renderVideo(<ExerciseDrawerVideo videoUrl="not a url" title="Supino" />);
    expect(invalid.container).toHaveTextContent('Vídeo de execução não cadastrado');
    invalid.unmount();

    const unknown = renderVideo(
      <ExerciseDrawerVideo videoUrl="https://player.example.com/embed/abc" title="Supino" />,
    );
    expect(unknown.container).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(unknown.container.querySelector('iframe')).toBeNull();
    unknown.unmount();

    const whitespace = renderVideo(<ExerciseDrawerVideo videoUrl="   " title="Supino" />);
    expect(whitespace.container).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(whitespace.container.querySelector('video')).toBeNull();
    expect(whitespace.container.querySelector('iframe')).toBeNull();
    expect(whitespace.container.querySelector('.aspect-square')).toBeTruthy();
  });

  it('resets to paused start when videoUrl changes', () => {
    const { container, getByTitle, rerender } = renderVideo(
      <ExerciseDrawerVideo videoUrl="https://www.youtube.com/watch?v=dQw4w9wgGcQ" title="A" />,
    );
    fireEvent.click(getByTitle('Reproduzir'));
    expect(container.querySelector('iframe')).toBeTruthy();
    rerender(
      <LanguageProvider>
        <ExerciseDrawerVideo videoUrl="https://cdn.example.com/clip.mp4" title="B" />
      </LanguageProvider>,
    );
    expect(container.querySelector('iframe')).toBeNull();
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video.paused).toBe(true);
    expect(getByTitle('Reproduzir')).toBeTruthy();
  });
});
