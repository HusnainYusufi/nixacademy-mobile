import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { clock } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { tapMedium } from '@/lib/native';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { EmptyState, Progress, Skeleton } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import type { CourseProgress, CourseTree, Lesson } from '@/lib/types';
import { Stage } from './player/Stage';
import { Curriculum } from './player/Curriculum';
import { typeIcon } from './player/icons';

const strings = {
  fallback: { en: 'Course', ar: 'الدورة' },
  courseProgress: { en: 'Course progress', ar: 'تقدّم الدورة' },
  lessonsDone: {
    en: '{done} of {total} lessons complete',
    ar: 'اكتمل {done} من {total} درسًا',
  },
  completeContinue: { en: 'Complete & continue', ar: 'إكمال ومتابعة' },
  markComplete: { en: 'Mark complete', ar: 'وضع علامة مكتمل' },
  nextLesson: { en: 'Next lesson', ar: 'الدرس التالي' },
  lessonDone: { en: 'Lesson completed', ar: 'اكتمل الدرس' },
  finished: { en: 'Course complete — great work!', ar: 'اكتملت الدورة — عمل رائع!' },
  courseDone: { en: 'Course complete — great work!', ar: 'اكتملت الدورة — عمل رائع!' },
  completeErr: { en: "Couldn't save your progress", ar: 'تعذّر حفظ تقدّمك' },
  locked: { en: 'Locked lesson', ar: 'درس مقفل' },
  VIDEO: { en: 'Video', ar: 'فيديو' },
  TEXT: { en: 'Reading', ar: 'قراءة' },
  QUIZ: { en: 'Quiz', ar: 'اختبار' },
  ASSIGNMENT: { en: 'Assignment', ar: 'مهمة' },
  DOWNLOAD: { en: 'Resource', ar: 'مورد' },
  LIVE_REPLAY: { en: 'Live replay', ar: 'إعادة بث' },
  errorTitle: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  errorHint: { en: "We couldn't load this course.", ar: 'تعذّر تحميل هذه الدورة.' },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
  emptyTitle: { en: 'No lessons yet', ar: 'لا توجد دروس بعد' },
  emptyHint: {
    en: 'This course has no published lessons.',
    ar: 'لا تحتوي هذه الدورة على دروس منشورة.',
  },
};

export function PlayerScreen() {
  const { courseId } = useParams();
  const t = useT(strings);
  const { locale } = useLocale();
  const toast = useToast();
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLElement>(null);

  const [selected, setSelected] = useState<string | null>(null);

  const course = useQuery({
    queryKey: ['course-tree', courseId],
    queryFn: () => api.get<CourseTree>(`/courses/${courseId}`),
    enabled: !!courseId,
  });
  const progress = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => api.get<CourseProgress>(`/courses/${courseId}/progress`),
    enabled: !!courseId,
  });
  const statusesQ = useQuery({
    queryKey: ['lesson-statuses', courseId],
    queryFn: () => api.get<Record<string, string>>(`/courses/${courseId}/lesson-progress`),
    enabled: !!courseId,
  });
  const lessonQ = useQuery({
    queryKey: ['lesson', selected],
    queryFn: () => api.get<Lesson>(`/lessons/${selected}`),
    enabled: !!selected,
  });

  const statuses = useMemo(() => statusesQ.data ?? {}, [statusesQ.data]);

  const ordered = useMemo(
    () => course.data?.modules.flatMap((m) => m.lessons) ?? [],
    [course.data],
  );
  const orderedIds = useMemo(() => ordered.map((l) => l.id), [ordered]);

  // Resume: first unlocked, not-yet-completed lesson; else first unlocked; else first.
  useEffect(() => {
    if (selected || ordered.length === 0) return;
    const resume =
      ordered.find((l) => !l.locked && statuses[l.id] !== 'COMPLETED') ??
      ordered.find((l) => !l.locked) ??
      ordered[0];
    if (resume) setSelected(resume.id);
  }, [ordered, statuses, selected]);

  const scrollToTop = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));

  const select = (id: string) => {
    void tapMedium();
    setSelected(id);
    scrollToTop();
  };

  const idx = selected ? orderedIds.indexOf(selected) : -1;
  const nextId = idx >= 0 ? orderedIds[idx + 1] ?? null : null;
  const isCompleted = selected ? statuses[selected] === 'COMPLETED' : false;

  const completeMut = useMutation({
    mutationFn: (id: string) => api.post(`/lessons/${id}/complete`),
    onSuccess: async (_data, id) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['course-progress', courseId] }),
        qc.invalidateQueries({ queryKey: ['lesson-statuses', courseId] }),
        qc.invalidateQueries({ queryKey: ['course-tree', courseId] }),
      ]);
      const advanceTo = orderedIds[orderedIds.indexOf(id) + 1] ?? null;
      if (advanceTo) {
        setSelected(advanceTo);
        scrollToTop();
      } else {
        toast.show(t('courseDone'), 'success');
      }
    },
    onError: () => toast.show(t('completeErr'), 'error'),
  });

  const onPrimary = () => {
    if (!selected || !lessonQ.data || lessonQ.data.locked) return;
    if (isCompleted) {
      if (nextId) select(nextId);
      return;
    }
    completeMut.mutate(selected);
  };

  const courseTitle = course.data ? localized(course.data, 'title', locale) : t('fallback');

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (course.isPending) {
    return (
      <>
        <AppBar back title={t('fallback')} />
        <main className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden px-4 pt-3">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="mt-4 h-6 w-3/4 rounded-lg" />
          <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (course.isError || !course.data) {
    return (
      <>
        <AppBar back title={t('fallback')} />
        <main className="no-scrollbar flex flex-1 items-center overflow-y-auto">
          <EmptyState
            icon={<RefreshCw className="size-7" />}
            title={t('errorTitle')}
            hint={t('errorHint')}
            action={
              <Button
                variant="outline"
                loading={course.isFetching}
                onClick={() => void course.refetch()}
              >
                <RefreshCw className="size-4" />
                {t('retry')}
              </Button>
            }
          />
        </main>
      </>
    );
  }

  /* ── Empty ────────────────────────────────────────────────────────────── */
  if (ordered.length === 0) {
    return (
      <>
        <AppBar back title={courseTitle} />
        <main className="no-scrollbar flex flex-1 items-center overflow-y-auto">
          <EmptyState
            icon={<BookOpen className="size-7" />}
            title={t('emptyTitle')}
            hint={t('emptyHint')}
          />
        </main>
      </>
    );
  }

  /* ── Loaded ───────────────────────────────────────────────────────────── */
  const lesson = lessonQ.data;
  const lessonLoading = lessonQ.isPending || (lessonQ.isFetching && !lessonQ.data);
  const activeModuleId =
    course.data.modules.find((m) => m.lessons.some((l) => l.id === selected))?.id ?? null;

  const completed = progress.data?.completed ?? Object.values(statuses).filter((s) => s === 'COMPLETED').length;
  const total = progress.data?.total ?? ordered.length;
  const percent = progress.data?.percent ?? (total ? Math.round((completed / total) * 100) : 0);

  const lessonTitle = lesson ? localized(lesson, 'title', locale) : '';
  const LessonTypeIcon = lesson ? typeIcon[lesson.type] : null;
  const duration = lesson?.durationSec ?? 0;
  const locked = !!lesson?.locked;

  return (
    <>
      <AppBar back title={courseTitle} />

      <main
        ref={scrollRef}
        className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden px-4 pt-3 pb-[calc(6rem+var(--safe-bottom))]"
      >
        {/* Stage + lesson meta — remounts per lesson for a clean cross-fade. */}
        <motion.div
          key={selected ?? 'none'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Stage
            lesson={lesson}
            loading={lessonLoading}
            error={lessonQ.isError}
            onRetry={() => void lessonQ.refetch()}
          />

          {/* Lesson title + type + duration */}
          <div className="mt-4">
            {lesson ? (
              <>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-primary">
                  {LessonTypeIcon && <LessonTypeIcon className="size-3.5" />}
                  <span>{t(lesson.type)}</span>
                  {duration > 0 && (
                    <span className="tabular-nums normal-case text-muted-foreground">
                      · {clock(duration)}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-xl font-extrabold leading-tight">{lessonTitle}</h1>
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="mt-2 h-6 w-2/3 rounded-lg" />
              </>
            )}
          </div>
        </motion.div>

        {/* Course progress */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-card">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('courseProgress')}
            </span>
            <span className="flex items-center gap-1 text-xs font-extrabold tabular-nums text-primary">
              {percent === 100 && <Award className="size-3.5" />}
              {percent}%
            </span>
          </div>
          <Progress value={percent} />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {t('lessonsDone', { done: completed, total })}
          </p>
        </div>

        {/* Curriculum */}
        <Curriculum
          modules={course.data.modules}
          statuses={statuses}
          selectedId={selected}
          activeModuleId={activeModuleId}
          onSelect={select}
        />
      </main>

      {/* Sticky action bar */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass absolute inset-x-0 bottom-0 z-40 border-t border-border/60 pb-safe"
      >
        <div className="px-4 py-3">
          {locked ? (
            <div className="flex h-13 items-center justify-center gap-2 rounded-xl bg-muted/70 text-sm font-bold text-muted-foreground">
              <Lock className="size-4" />
              {t('locked')}
            </div>
          ) : isCompleted && !nextId ? (
            <div className="flex h-13 items-center justify-center gap-2 rounded-xl bg-success/12 text-sm font-bold text-success">
              <CheckCircle2 className="size-5" />
              {percent === 100 ? t('finished') : t('lessonDone')}
            </div>
          ) : (
            <Button
              variant={isCompleted ? 'secondary' : 'gold'}
              size="lg"
              className="w-full"
              loading={completeMut.isPending}
              disabled={!lesson}
              onClick={onPrimary}
            >
              {!isCompleted && !completeMut.isPending && <CheckCircle2 className="size-5" />}
              <span className="truncate">
                {isCompleted
                  ? t('nextLesson')
                  : nextId
                    ? t('completeContinue')
                    : t('markComplete')}
              </span>
              {(isCompleted || nextId) && <ArrowRight className="size-4 shrink-0 rtl:rotate-180" />}
            </Button>
          )}
        </div>
      </motion.div>
    </>
  );
}
