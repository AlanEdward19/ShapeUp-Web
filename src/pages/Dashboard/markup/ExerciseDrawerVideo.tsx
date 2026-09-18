import { useEffect, useRef, useState, type ReactElement } from 'react';
import { detectVideoKind } from './exerciseVideo';

const EMPTY_COPY = 'Vídeo de execução não cadastrado';

function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'youtu.be') return parsed.pathname.replace(/^\//, '').split('/')[0] || null;
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop() || null;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : null;
  } catch {
    return null;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ExerciseDrawerVideo({
  videoUrl,
  title,
}: {
  videoUrl?: string;
  title: string;
}): ReactElement {
  const kind = detectVideoKind(videoUrl);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hostedOpen, setHostedOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setHostedOpen(false);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    const node = videoRef.current;
    if (node) {
      node.pause();
      node.currentTime = 0;
    }
  }, [videoUrl]);

  if (kind === 'invalid' || !videoUrl) {
    return (
      <div className="aspect-video rounded-md bg-surface-muted border border-border-subtle flex items-center justify-center px-4 text-center">
        <p className="text-text-secondary text-[11px]">{EMPTY_COPY}</p>
      </div>
    );
  }

  if (kind === 'youtube' || kind === 'vimeo') {
    const id = kind === 'youtube' ? youtubeId(videoUrl) : vimeoId(videoUrl);
    if (!id) {
      return (
        <div className="aspect-video rounded-md bg-surface-muted border border-border-subtle flex items-center justify-center px-4 text-center">
          <p className="text-text-secondary text-[11px]">{EMPTY_COPY}</p>
        </div>
      );
    }
    const embed =
      kind === 'youtube'
        ? `https://www.youtube.com/embed/${id}?autoplay=1`
        : `https://player.vimeo.com/video/${id}?autoplay=1`;
    const poster = kind === 'youtube' ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;

    return (
      <div data-video-player className="aspect-video relative rounded-md overflow-hidden bg-black">
        {hostedOpen ? (
          <iframe
            title={title}
            src={embed}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            {poster ? (
              <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-5xl">videocam</span>
              </div>
            )}
            <button
              type="button"
              title="Reproduzir"
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => setHostedOpen(true)}
            >
              <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
            </button>
          </>
        )}
      </div>
    );
  }

  const togglePlay = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      void node.play();
      setPlaying(true);
    } else {
      node.pause();
      setPlaying(false);
    }
  };

  return (
    <div data-video-player className="aspect-video relative rounded-md overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        title={playing ? 'Pausar' : 'Reproduzir'}
        className="absolute inset-x-0 top-0 bottom-10 flex items-center justify-center"
        onClick={togglePlay}
      >
        <span className="material-symbols-outlined text-white text-5xl">{playing ? 'pause' : 'play_arrow'}</span>
      </button>
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          aria-label="Progresso do vídeo"
          className="w-full"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = next;
            setCurrent(next);
          }}
        />
        <div className="flex items-center justify-between text-white text-[10px] font-mono">
          <button
            type="button"
            title="Replay"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                void videoRef.current.play();
              }
              setPlaying(true);
              setCurrent(0);
            }}
          >
            <span className="material-symbols-outlined text-[16px]">replay</span>
          </button>
          <span>
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            title="Tela cheia"
            onClick={() => {
              void videoRef.current?.requestFullscreen?.();
            }}
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
