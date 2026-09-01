import { motion } from 'motion/react';
import { GraduationCap, Play, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { localized, useLocale, useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/misc';
import { tapMedium } from '@/lib/native';
import { pctOf, isDone, type EnrolledCourse } from './data';

const strings = {
  eyebrowContinue: { en: 'Continue learning', ar: 'تابع التعلّم' },
  eyebrowStart: { en: 'Ready to begin', ar: 'جاهز للبدء' },
  eyebrowReview: { en: 'Nicely done', ar: 'أحسنت' },
  continue: { en: 'Continue', ar: 'متابعة' },
  start: { en: 'Start learning', ar: 'ابدأ التعلّم' },
  review: { en: 'Review course', ar: 'مراجعة الدورة' },
  count: { en: '{done} / {total} lessons', ar: '{done} / {total} درس' },
  notStarted: { en: 'Not started yet', ar: 'لم تبدأ بعد' },
  completed: { en: 'Completed', ar: 'مكتملة' },
};

export function ContinueHero({
  course,
  onOpen,
}: {
  course: EnrolledCourse;
  onOpen: (id: string) => void;
}) {
  const { locale } = useLocale();
  const t = useT(strings);

  const title = localized(course, 'title', locale);
  const pct = pctOf(course);
  const done = isDone(course);
  const thumb = fileUrl(course.thumbnailUrl);
  const completed = course.progress?.completed ?? 0;
  const total = course.progress?.total ?? 0;

  const eyebrow = done
    ? t('eyebrowReview')
    : pct === 0
      ? t('eyebrowStart')
      : t('eyebrowContinue');
  const cta = done ? t('review') : pct === 0 ? t('start') : t('continue');

  function open() {
    void tapMedium();
    onOpen(course.id);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-extrabold tracking-tight text-muted-foreground">
          {eyebrow}
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-premium">
        {/* Media — tappable */}
        <button
          type="button"
          onClick={open}
          aria-label={`${cta}: ${title}`}
          className="press group relative block aspect-[16/10] w-full overflow-hidden text-start"
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-active:scale-[1.05]"
            />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-primary/25 to-money/10">
              <GraduationCap className="size-14 text-primary/40" />
            </div>
          )}

          {/* Legibility scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {done && (
            <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-card">
              <CheckCircle2 className="size-3.5" />
              {t('completed')}
            </span>
          )}

          {/* Play affordance */}
          <span className="absolute bottom-3 end-3 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
            {done ? <RotateCcw className="size-5" /> : <Play className="size-5 fill-current" />}
          </span>

          <h3 className="absolute inset-x-0 bottom-0 line-clamp-2 px-4 pb-4 pe-16 text-start text-xl font-extrabold leading-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
            {title}
          </h3>
        </button>

        {/* Progress + CTA */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold tabular-nums text-muted-foreground">
              {total > 0 ? t('count', { done: completed, total }) : t('notStarted')}
            </span>
            <span className="tabular-nums text-sm font-extrabold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="mb-4 h-2.5" />
          <Button variant="gold" size="lg" className="w-full" onClick={open}>
            {done ? <RotateCcw className="size-4" /> : <Play className="size-4 fill-current" />}
            {cta}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
