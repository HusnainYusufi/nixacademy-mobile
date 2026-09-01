import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, ChevronLeft } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { localized, useLocale, useT } from '@/lib/i18n';
import { Progress } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { tapMedium } from '@/lib/native';
import { pctOf, isDone, type EnrolledCourse } from './data';

const strings = {
  completed: { en: 'Completed', ar: 'مكتملة' },
  notStarted: { en: 'Not started', ar: 'لم تبدأ' },
  count: { en: '{done}/{total}', ar: '{done}/{total}' },
};

export function CourseRow({
  course,
  index,
  onOpen,
}: {
  course: EnrolledCourse;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { locale, dir } = useLocale();
  const t = useT(strings);

  const title = localized(course, 'title', locale);
  const pct = pctOf(course);
  const done = isDone(course);
  const thumb = fileUrl(course.thumbnailUrl);
  const completed = course.progress?.completed ?? 0;
  const total = course.progress?.total ?? 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.04 * index, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => {
        void tapMedium();
        onOpen(course.id);
      }}
      className="press group flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-border/70 bg-card p-2.5 text-start shadow-card"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-[84px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-money/10">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-active:scale-[1.06]"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <BookOpen className="size-7 text-primary/40" />
          </div>
        )}
        {done && (
          <span className="absolute inset-0 grid place-items-center bg-success/25 backdrop-blur-[1px]">
            <CheckCircle2 className="size-7 text-white drop-shadow" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{title}</h3>

        <div className="flex items-center gap-2">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span
            className={cn(
              'tabular-nums text-xs font-extrabold',
              done ? 'text-success' : 'text-primary',
            )}
          >
            {pct}%
          </span>
        </div>

        <span className="text-[11px] font-semibold text-muted-foreground">
          {done
            ? t('completed')
            : total > 0
              ? t('count', { done: completed, total })
              : t('notStarted')}
        </span>
      </div>

      <ChevronLeft
        className={cn(
          'size-5 shrink-0 text-muted-foreground/60',
          dir === 'ltr' && 'rotate-180',
        )}
      />
    </motion.button>
  );
}
