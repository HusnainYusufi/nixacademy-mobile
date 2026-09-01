import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Play, RotateCw, VideoOff } from 'lucide-react';
import { api, apiBaseUrl } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { tapMedium } from '@/lib/native';

const strings = {
  unavailable: { en: 'Playback unavailable', ar: 'التشغيل غير متاح' },
  unavailableHint: {
    en: "We couldn't start this video. Tap to try again.",
    ar: 'تعذّر بدء هذا الفيديو. اضغط لإعادة المحاولة.',
  },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  play: { en: 'Play lesson', ar: 'تشغيل الدرس' },
};

/**
 * Self-hosted video for the enrolled player. Mirrors the web player's mechanism:
 * mints a per-user playback token (`GET /lessons/:id/playback-token`) then streams
 * from `…/video/:assetId/stream?token=…` — the token rides the query string so a
 * bare <video> works while keeping HTTP Range (seeking / progressive load) intact,
 * unlike a fetch→blob approach which would buffer the whole file into memory.
 * Any failure degrades to a clean poster with a Play/Retry affordance — never a
 * broken <video>.
 */
export function VideoPlayer({ lessonId, title }: { lessonId: string; title: string }) {
  const t = useT(strings);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playing, setPlaying] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setSrc(null);
    setPlaying(false);
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

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 bg-black shadow-card">
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
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onPlay={() => setPlaying(true)}
            onError={() => setStatus('error')}
            className="absolute inset-0 size-full bg-black object-contain"
          />
          {!playing && (
            <motion.button
              type="button"
              aria-label={t('play')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                void tapMedium();
                void videoRef.current?.play();
              }}
              className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/75 via-black/15 to-black/40"
            >
              <motion.span
                whileTap={{ scale: 0.92 }}
                className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
              >
                <Play className="size-7 translate-x-0.5" fill="currentColor" />
              </motion.span>
              <span className="absolute inset-x-0 bottom-0 p-3.5 text-start">
                <span className="line-clamp-2 text-sm font-bold text-white drop-shadow">{title}</span>
              </span>
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
