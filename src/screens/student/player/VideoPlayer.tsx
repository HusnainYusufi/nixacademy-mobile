import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Maximize, Minimize, Pause, Play, RotateCw, VideoOff } from 'lucide-react';
import { api, apiBaseUrl } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { clock } from '@/lib/format';
import { tapMedium } from '@/lib/native';
import { cn } from '@/lib/utils';

const strings = {
  unavailable: { en: 'Playback unavailable', ar: 'التشغيل غير متاح' },
  unavailableHint: {
    en: "We couldn't start this video. Tap to try again.",
    ar: 'تعذّر بدء هذا الفيديو. اضغط لإعادة المحاولة.',
  },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  play: { en: 'Play', ar: 'تشغيل' },
  pause: { en: 'Pause', ar: 'إيقاف مؤقت' },
  fullscreen: { en: 'Fullscreen', ar: 'ملء الشاشة' },
  seek: { en: 'Seek', ar: 'تقديم' },
};

/**
 * Self-hosted video with a fully custom, brand-themed control layer (no native
 * chrome). Mints a per-user playback token (`GET /lessons/:id/playback-token`)
 * then streams from `…/video/:assetId/stream?token=…` — the token rides the query
 * string so a bare <video> plays while keeping HTTP Range (seeking) intact.
 * Any failure degrades to a clean poster with a Retry affordance.
 */
export function VideoPlayer({ lessonId, title }: { lessonId: string; title: string }) {
  const t = useT(strings);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controls, setControls] = useState(true);

  // Mint a playback token → stream URL.
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setSrc(null);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    api
      .get<{ token: string; assetId: string }>(`/lessons/${lessonId}/playback-token`)
      .then((r) => {
        if (!alive) return;
        setSrc(`${apiBaseUrl}/video/${r.assetId}/stream?token=${encodeURIComponent(r.token)}`);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [lessonId, reloadKey]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Auto-hide the controls while playing; always show when paused.
  const nudge = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControls(false);
    }, 2600);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    void tapMedium();
    if (v.paused) void v.play();
    else v.pause();
    nudge();
  }, [nudge]);

  const seek = (value: number) => {
    const v = videoRef.current;
    if (!v || !isFinite(value)) return;
    v.currentTime = value;
    setCurrent(value);
    nudge();
  };

  const toggleFullscreen = () => {
    void tapMedium();
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void boxRef.current?.requestFullscreen?.();
  };

  const playedPct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={boxRef}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 bg-black shadow-card',
        fullscreen && 'aspect-auto h-full rounded-none border-0',
      )}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <Loader2 className="size-7 animate-spin text-white/70" />
        </div>
      )}

      {status === 'error' && (
        <button
          type="button"
          onClick={() => {
            void tapMedium();
            setReloadKey((k) => k + 1);
          }}
          className="press absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/15 via-black to-black text-center"
        >
          <div className="flex flex-col items-center px-6">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-white/80">
              <VideoOff className="size-6" />
            </span>
            <p className="mt-3 text-sm font-bold text-white">{t('unavailable')}</p>
            <p className="mt-1 max-w-[16rem] text-xs text-white/60">{t('unavailableHint')}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white">
              <RotateCw className="size-3.5" />
              {t('retry')}
            </span>
          </div>
          <span className="absolute inset-x-0 bottom-0 p-3 text-start">
            <span className="line-clamp-1 text-xs font-semibold text-white/80">{title}</span>
          </span>
        </button>
      )}

      {status === 'ready' && src && (
        <>
          <video
            ref={videoRef}
            key={src}
            src={src}
            playsInline
            preload="metadata"
            onContextMenu={(e) => e.preventDefault()}
            onClick={toggle}
            onPlay={() => {
              setPlaying(true);
              nudge();
            }}
            onPause={() => {
              setPlaying(false);
              setControls(true);
            }}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              setCurrent(v.currentTime);
              if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
            }}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onEnded={() => {
              setPlaying(false);
              setControls(true);
            }}
            onError={() => setStatus('error')}
            className="absolute inset-0 size-full bg-black object-contain"
          />

          {/* Buffering spinner */}
          {waiting && playing && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <Loader2 className="size-9 animate-spin text-white/80" />
            </div>
          )}

          {/* Center play / pause — big affordance when paused or controls shown */}
          <AnimatePresence>
            {(!playing || controls) && !waiting && (
              <motion.button
                type="button"
                aria-label={playing ? t('pause') : t('play')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggle}
                className="absolute inset-0 grid place-items-center"
              >
                {!playing && (
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                )}
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'relative grid place-items-center rounded-full text-primary-foreground shadow-glow',
                    playing ? 'size-14 bg-white/15 text-white backdrop-blur' : 'size-16 bg-primary',
                  )}
                >
                  {playing ? (
                    <Pause className="size-7" fill="currentColor" />
                  ) : (
                    <Play className="size-7 translate-x-0.5" fill="currentColor" />
                  )}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Bottom control bar — video timelines read LTR by convention. */}
          <AnimatePresence>
            {controls && (
              <motion.div
                dir="ltr"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8"
              >
                <button
                  type="button"
                  aria-label={playing ? t('pause') : t('play')}
                  onClick={toggle}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-white"
                >
                  {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
                </button>

                {/* Scrub bar: buffered + played tracks, invisible range on top. */}
                <div className="relative flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                    <div className="absolute h-1.5 rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
                    <div className="absolute h-1.5 rounded-full bg-primary" style={{ width: `${playedPct}%` }} />
                  </div>
                  <span
                    className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-primary shadow ring-2 ring-black/30"
                    style={{ left: `calc(${playedPct}% - 6px)` }}
                  />
                  <input
                    type="range"
                    aria-label={t('seek')}
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={current}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0"
                  />
                </div>

                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-white/90">
                  {clock(current)} / {clock(duration)}
                </span>

                <button
                  type="button"
                  aria-label={t('fullscreen')}
                  onClick={toggleFullscreen}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-white"
                >
                  {fullscreen ? <Minimize className="size-4.5" /> : <Maximize className="size-4.5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
