import { Lock, RefreshCw } from 'lucide-react';
import { localized, useLocale, useT } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/lib/types';
import { typeIcon, extractText } from './icons';
import { VideoPlayer } from './VideoPlayer';

const strings = {
  locked: { en: 'This lesson is locked', ar: 'هذا الدرس مقفل' },
  lockedHint: {
    en: 'Complete the earlier lessons to unlock it.',
    ar: 'أكمل الدروس السابقة لفتح هذا الدرس.',
  },
  noVideo: { en: 'No video for this lesson', ar: 'لا يوجد فيديو لهذا الدرس' },
  noVideoHint: {
    en: 'The instructor hasn’t uploaded a video yet.',
    ar: 'لم يقم المدرّب برفع فيديو بعد.',
  },
  errorTitle: { en: "Couldn't load this lesson", ar: 'تعذّر تحميل هذا الدرس' },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
  emptyBody: { en: 'No content to display yet.', ar: 'لا يوجد محتوى للعرض بعد.' },
  reading: { en: 'Reading', ar: 'مادة للقراءة' },
  quiz: { en: 'Quiz', ar: 'اختبار' },
  quizHint: {
    en: 'A short quiz for this lesson. Mark it complete below when you’re done.',
    ar: 'اختبار قصير لهذا الدرس. ضع علامة مكتمل بالأسفل عند الانتهاء.',
  },
  assignment: { en: 'Assignment', ar: 'مهمة' },
  assignmentHint: {
    en: 'Complete the task for this lesson, then mark it complete below.',
    ar: 'أنجز مهمة هذا الدرس، ثم ضع علامة مكتمل بالأسفل.',
  },
  download: { en: 'Downloadable resource', ar: 'مورد قابل للتنزيل' },
  downloadHint: {
    en: 'A resource for this lesson. Mark it complete below once reviewed.',
    ar: 'مورد لهذا الدرس. ضع علامة مكتمل بالأسفل بعد الاطلاع عليه.',
  },
  liveReplay: { en: 'Live replay', ar: 'إعادة بث مباشر' },
  liveReplayHint: {
    en: 'A recording of a live session for this lesson.',
    ar: 'تسجيل لجلسة مباشرة لهذا الدرس.',
  },
};

const aspect = 'aspect-video w-full';

/** The top media area: video, reading, a typed content panel, a locked gate,
 *  or the loading / error placeholders — always the same 16:9 footprint so the
 *  layout never shifts between lessons. */
export function Stage({
  lesson,
  loading,
  error,
  onRetry,
}: {
  lesson: Lesson | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const { locale } = useLocale();
  const t = useT(strings);

  if (error) {
    return (
      <div
        className={cn(
          aspect,
          'grid place-items-center rounded-2xl border border-border/70 bg-card text-center shadow-card',
        )}
      >
        <div className="flex flex-col items-center px-6">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <RefreshCw className="size-5" />
          </span>
          <p className="mt-3 text-sm font-bold">{t('errorTitle')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            <RefreshCw className="size-4" />
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !lesson) {
    return <Skeleton className={cn(aspect, 'rounded-2xl')} />;
  }

  const title = localized(lesson, 'title', locale);

  /* ── Locked gate ─────────────────────────────────────────────────────── */
  if (lesson.locked) {
    return (
      <div
        className={cn(
          aspect,
          'grid place-items-center rounded-2xl border border-dashed border-border/80 bg-muted/25 text-center',
        )}
      >
        <div className="flex flex-col items-center px-6">
          <span className="grid size-14 place-items-center rounded-2xl bg-background/60 text-muted-foreground">
            <Lock className="size-6" />
          </span>
          <p className="mt-3 text-sm font-bold">{t('locked')}</p>
          <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">{t('lockedHint')}</p>
        </div>
      </div>
    );
  }

  /* ── Video ───────────────────────────────────────────────────────────── */
  if (lesson.type === 'VIDEO') {
    if (lesson.videoAssetId) {
      return <VideoPlayer key={lesson.id} lessonId={lesson.id} title={title} />;
    }
    return <TypePanel type="VIDEO" label={t('noVideo')} hint={t('noVideoHint')} />;
  }

  /* ── Reading (rich text) ─────────────────────────────────────────────── */
  if (lesson.type === 'TEXT') {
    const body = extractText(lesson.body).trim();
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-primary">
          <TypeGlyph type="TEXT" />
          {t('reading')}
        </div>
        <div className="max-h-[46vh] overflow-y-auto no-scrollbar px-4 py-4">
          {body ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{body}</p>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('emptyBody')}</p>
          )}
        </div>
      </div>
    );
  }

  /* ── Other typed content (quiz / assignment / download / live replay) ──── */
  const panels: Partial<Record<Lesson['type'], { label: string; hint: string }>> = {
    QUIZ: { label: t('quiz'), hint: t('quizHint') },
    ASSIGNMENT: { label: t('assignment'), hint: t('assignmentHint') },
    DOWNLOAD: { label: t('download'), hint: t('downloadHint') },
    LIVE_REPLAY: { label: t('liveReplay'), hint: t('liveReplayHint') },
  };
  const panel = panels[lesson.type] ?? { label: title, hint: t('emptyBody') };

  return <TypePanel type={lesson.type} label={panel.label} hint={panel.hint} />;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function TypeGlyph({ type }: { type: Lesson['type'] }) {
  const Icon = typeIcon[type];
  return <Icon className="size-3.5" />;
}

function TypePanel({
  type,
  label,
  hint,
}: {
  type: Lesson['type'];
  label: string;
  hint: string;
}) {
  const Icon = typeIcon[type];
  return (
    <div
      className={cn(
        aspect,
        'grid place-items-center rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-card text-center shadow-card',
      )}
    >
      <div className="flex flex-col items-center px-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="size-6" />
        </span>
        <p className="mt-3 text-sm font-bold">{label}</p>
        <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
