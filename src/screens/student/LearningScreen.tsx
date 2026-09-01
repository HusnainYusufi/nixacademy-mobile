import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Compass, RefreshCw, Layers } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { AppBar } from '@/components/layout/AppBar';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { useEnrolledCourses, pickHero, isDone } from './learning/data';
import { ContinueHero } from './learning/ContinueHero';
import { CourseRow } from './learning/CourseRow';
import { LearningSkeleton } from './learning/LearningSkeleton';

const strings = {
  title: { en: 'My Courses', ar: 'دوراتي' },
  yourCourses: { en: 'Your courses', ar: 'دوراتك' },
  progressSummary: {
    en: '{done} completed · {active} in progress',
    ar: '{done} مكتملة · {active} قيد التقدّم',
  },
  emptyTitle: { en: "You're not enrolled in any course yet", ar: 'لم تسجّل في أي دورة بعد' },
  emptyHint: {
    en: 'Browse the catalog and start your first course today.',
    ar: 'تصفّح الكتالوج وابدأ دورتك الأولى اليوم.',
  },
  explore: { en: 'Explore courses', ar: 'استكشف الدورات' },
  errorTitle: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  errorHint: {
    en: "We couldn't load your courses. Please try again.",
    ar: 'تعذّر تحميل دوراتك. حاول مرة أخرى.',
  },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
};

export function LearningScreen() {
  const t = useT(strings);
  const navigate = useNavigate();
  const { data, isPending, isError, refetch, isFetching } = useEnrolledCourses();

  const open = (id: string) => navigate(`/learn/${id}`);

  const hero = useMemo(() => (data ? pickHero(data) : undefined), [data]);
  const rest = useMemo(
    () => (data && hero ? data.filter((c) => c.id !== hero.id) : []),
    [data, hero],
  );
  const doneCount = useMemo(() => (data ? data.filter(isDone).length : 0), [data]);

  return (
    <>
      <AppBar title={t('title')} />
      <Screen className="pt-2">
        {isPending ? (
          <LearningSkeleton />
        ) : isError ? (
          <EmptyState
            icon={<RefreshCw className="size-7" />}
            title={t('errorTitle')}
            hint={t('errorHint')}
            action={
              <Button variant="outline" onClick={() => void refetch()} loading={isFetching}>
                <RefreshCw className="size-4" />
                {t('retry')}
              </Button>
            }
          />
        ) : !hero ? (
          <EmptyState
            icon={<GraduationCap className="size-7" />}
            title={t('emptyTitle')}
            hint={t('emptyHint')}
            action={
              <Button variant="gold" size="lg" onClick={() => navigate('/app/explore')}>
                <Compass className="size-4" />
                {t('explore')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            <ContinueHero course={hero} onOpen={open} />

            {rest.length > 0 && (
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3 flex items-end justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <h2 className="text-sm font-extrabold tracking-tight">{t('yourCourses')}</h2>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {t('progressSummary', { done: doneCount, active: data!.length - doneCount })}
                  </span>
                </motion.div>

                <div className="space-y-3">
                  {rest.map((course, i) => (
                    <CourseRow key={course.id} course={course} index={i} onOpen={open} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Screen>
    </>
  );
}
