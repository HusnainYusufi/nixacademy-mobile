import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Search, Compass, RefreshCw, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Screen } from '@/components/layout/Screen';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { LogoMark } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import type { Listing } from '@/lib/types';
import { CategoryChips } from './explore/CategoryChips';
import { FeaturedHero } from './explore/FeaturedHero';

const strings = {
  hi: { en: 'Discover', ar: 'اكتشف' },
  headline: { en: 'What will you master today?', ar: 'ماذا ستتقن اليوم؟' },
  searchPh: { en: 'Search courses…', ar: 'ابحث عن الدورات…' },
  results: { en: '{n} courses', ar: '{n} دورة' },
  sectionTitle: { en: 'All courses', ar: 'كل الدورات' },
  emptyTitle: { en: 'No courses found', ar: 'لا توجد دورات' },
  emptyHint: { en: 'Try a different search or category.', ar: 'جرّب بحثًا أو فئة مختلفة.' },
  clear: { en: 'Clear filters', ar: 'مسح عوامل التصفية' },
  errorTitle: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  errorHint: { en: "We couldn't load the catalog.", ar: 'تعذّر تحميل الكتالوج.' },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
};

export function ExploreScreen() {
  const t = useT(strings);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ['marketplace', 'courses'],
    queryFn: () => api.get<Listing[]>('/marketplace/courses'),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((c) => c.category && set.add(c.category));
    return [...set];
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (cat !== 'all') list = list.filter((c) => c.category === cat);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (c) =>
          (c.title ?? '').toLowerCase().includes(term) ||
          (c.description ?? '').toLowerCase().includes(term) ||
          (c.titleI18n?.ar ?? '').toLowerCase().includes(term),
      );
    }
    return list;
  }, [data, cat, q]);

  const hero = useMemo(() => {
    const base = data ?? [];
    if (q.trim() || cat !== 'all') return undefined;
    return base.find((c) => c.boosted) ?? base[0];
  }, [data, q, cat]);

  const grid = hero ? filtered.filter((c) => c.courseId !== hero.courseId) : filtered;

  return (
    <>
      {/* Custom header (no AppBar — Explore gets a richer top) */}
      <header className="glass sticky top-0 z-30 border-b border-border/60 pt-safe">
        <div className="px-4 pb-3 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{t('hi')}</p>
              <h1 className="text-2xl font-extrabold leading-[1.15]">{t('headline')}</h1>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card/70 ring-1 ring-primary/30 shadow-glow">
              <LogoMark className="size-6" />
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPh')}
              className="h-11 w-full rounded-xl border border-input bg-card/60 ps-10 pe-10 text-sm placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label={t('clear')}
                className="absolute inset-y-0 end-2 my-auto grid size-7 place-items-center rounded-lg text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <Screen className="pt-3">
        {/* Category chips */}
        <CategoryChips
          categories={categories}
          selected={cat}
          onSelect={setCat}
          loading={isPending}
        />

        {isPending ? (
          <div className="mt-4">
            <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <EmptyState
            icon={<RefreshCw className="size-7" />}
            title={t('errorTitle')}
            hint={t('errorHint')}
            action={
              <Button variant="outline" loading={isFetching} onClick={() => void refetch()}>
                <RefreshCw className="size-4" />
                {t('retry')}
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Compass className="size-7" />}
            title={t('emptyTitle')}
            hint={t('emptyHint')}
            action={
              (q || cat !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ('');
                    setCat('all');
                  }}
                >
                  {t('clear')}
                </Button>
              )
            }
          />
        ) : (
          <div className="mt-4 space-y-4">
            {hero && <FeaturedHero c={hero} />}
            {grid.length > 0 && (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-base font-extrabold">
                    {cat === 'all' ? t('sectionTitle') : cat}
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t('results', { n: filtered.length })}
                  </span>
                </div>
                <motion.div
                  className={cn('grid grid-cols-2 gap-3')}
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                >
                  {grid.map((c) => (
                    <motion.div
                      key={c.courseId}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                      }}
                    >
                      <CourseCard c={c} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        )}
      </Screen>
    </>
  );
}
