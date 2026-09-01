import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Award,
  Check,
  ChevronRight,
  Compass,
  Infinity,
  ListVideo,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Unlock,
  Users,
  Zap,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { money, discountPct } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { tapMedium } from '@/lib/native';
import { cn } from '@/lib/utils';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import type { CourseDetail } from '@/lib/types';
import { CourseHero } from './detail/CourseHero';
import { CurriculumAccordion } from './detail/CurriculumAccordion';

const strings = {
  back: { en: 'Back', ar: 'رجوع' },
  free: { en: 'Free', ar: 'مجاني' },
  statLessons: { en: 'Lessons', ar: 'الدروس' },
  statPreview: { en: 'Free preview', ar: 'معاينة مجانية' },
  statLearners: { en: 'Learners', ar: 'المتعلمون' },
  about: { en: 'About this course', ar: 'عن هذه الدورة' },
  lifetime: { en: 'Lifetime access', ar: 'وصول مدى الحياة' },
  certificate: { en: 'Certificate', ar: 'شهادة إتمام' },
  lessonsChip: { en: '{n} lessons', ar: '{n} درسًا' },
  readMore: { en: 'Read more', ar: 'اقرأ المزيد' },
  readLess: { en: 'Show less', ar: 'عرض أقل' },
  addToCart: { en: 'Add to cart', ar: 'أضف إلى السلة' },
  inCart: { en: 'In cart', ar: 'في السلة' },
  buyNow: { en: 'Buy now', ar: 'اشترِ الآن' },
  enrollFree: { en: 'Enroll free', ar: 'سجّل مجانًا' },
  added: { en: 'Added to cart', ar: 'أُضيف إلى السلة' },
  errorTitle: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  errorHint: { en: "We couldn't load this course.", ar: 'تعذّر تحميل هذه الدورة.' },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
  notFoundTitle: { en: 'Course not found', ar: 'الدورة غير موجودة' },
  notFoundHint: {
    en: 'This course may have been removed or is no longer for sale.',
    ar: 'ربما تمت إزالة هذه الدورة أو لم تعد معروضة للبيع.',
  },
  browse: { en: 'Browse courses', ar: 'تصفّح الدورات' },
};

/* ── Stat pill ────────────────────────────────────────────────────────── */
function StatPill({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── Floating glass back button ───────────────────────────────────────── */
function FloatingBack() {
  const navigate = useNavigate();
  const t = useT(strings);
  const { dir } = useLocale();
  return (
    <button
      type="button"
      aria-label={t('back')}
      onClick={() => {
        void tapMedium();
        navigate(-1);
      }}
      className="press glass absolute start-3 top-[calc(var(--safe-top)+0.75rem)] z-50 grid size-10 place-items-center rounded-full border border-border/60 text-foreground shadow-premium"
    >
      <ChevronRight className={cn('size-5', dir === 'ltr' && 'rotate-180')} />
    </button>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <main className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden">
      <Skeleton className="h-[52vh] min-h-[320px] w-full rounded-none" />
      <div className="space-y-6 px-4 py-5">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-2/3 rounded" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </main>
  );
}

/* ── Screen ───────────────────────────────────────────────────────────── */
export function CourseDetailScreen() {
  const { id } = useParams();
  const t = useT(strings);
  const { locale } = useLocale();
  const navigate = useNavigate();
  const toast = useToast();
  const { add, has } = useCart();
  const [expanded, setExpanded] = useState(false);

  const { data: c, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get<CourseDetail>(`/marketplace/courses/${id}`),
    enabled: !!id,
  });

  /* ---- Loading ---- */
  if (isPending) {
    return (
      <>
        <FloatingBack />
        <DetailSkeleton />
      </>
    );
  }

  /* ---- Not found (404) ---- */
  if (isError && error instanceof ApiError && error.status === 404) {
    return (
      <>
        <AppBar back />
        <main className="no-scrollbar flex flex-1 items-center overflow-y-auto">
          <EmptyState
            icon={<Compass className="size-7" />}
            title={t('notFoundTitle')}
            hint={t('notFoundHint')}
            action={
              <Button variant="outline" onClick={() => navigate('/app/explore')}>
                {t('browse')}
              </Button>
            }
          />
        </main>
      </>
    );
  }

  /* ---- Error ---- */
  if (isError || !c) {
    return (
      <>
        <AppBar back />
        <main className="no-scrollbar flex flex-1 items-center overflow-y-auto">
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
        </main>
      </>
    );
  }

  /* ---- Loaded ---- */
  const title = localized(c, 'title', locale);
  const description = localized(c, 'description', locale)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"');
  const off = discountPct(c.priceCents, c.compareAtPriceCents);
  const isFree = c.priceCents === 0;
  const inCart = has(c.courseId);
  const canExpand = description.trim().length > 220;

  const cartItem = {
    courseId: c.courseId,
    title,
    academyName: c.academyName,
    thumbnailUrl: c.thumbnailUrl,
    priceCents: c.priceCents,
    currency: c.currency,
  };

  const onAdd = () => {
    if (inCart) return;
    void tapMedium();
    add(cartItem);
    toast.show(t('added'), 'success');
  };

  const onBuy = () => {
    void tapMedium();
    if (!inCart) add(cartItem);
    navigate('/checkout');
  };

  const section = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <>
      <FloatingBack />

      <main className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden pb-[calc(6rem+var(--safe-bottom))]">
        <CourseHero c={c} />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
          className="space-y-6 px-4 py-5"
        >
          {/* Stats strip */}
          <motion.div variants={section} className="flex flex-wrap gap-2">
            {c.totalLessons > 0 && (
              <StatPill
                icon={<ListVideo className="size-4" />}
                value={String(c.totalLessons)}
                label={t('statLessons')}
              />
            )}
            {c.freeLessons > 0 && (
              <StatPill
                icon={<Unlock className="size-4" />}
                value={String(c.freeLessons)}
                label={t('statPreview')}
              />
            )}
            {c.salesCount > 0 && (
              <StatPill
                icon={<Users className="size-4" />}
                value={c.salesCount.toLocaleString('en-US')}
                label={t('statLearners')}
              />
            )}
          </motion.div>

          {/* Price block — price + the value it unlocks (chips) so the card
              carries weight instead of framing a lone number. */}
          <motion.div
            variants={section}
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-card"
          >
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'font-heading text-3xl font-extrabold',
                  isFree ? 'text-success' : 'text-money',
                )}
              >
                {money(c.priceCents, c.currency, t('free'))}
              </span>
              {off > 0 && (
                <span className="text-base text-muted-foreground line-through">
                  {money(c.compareAtPriceCents!, c.currency)}
                </span>
              )}
              {off > 0 && (
                <span className="ms-auto shrink-0 rounded-full bg-destructive px-3 py-1.5 text-sm font-extrabold text-white">
                  −{off}%
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Infinity className="size-4 text-primary" /> {t('lifetime')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Award className="size-4 text-primary" /> {t('certificate')}
              </span>
              {c.totalLessons > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <ListVideo className="size-4 text-primary" /> {t('lessonsChip', { n: c.totalLessons })}
                </span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          {description.trim() && (
            <motion.section variants={section} className="space-y-2.5">
              <h2 className="text-lg font-extrabold">{t('about')}</h2>
              <p
                className={cn(
                  'whitespace-pre-line text-sm leading-relaxed text-muted-foreground',
                  !expanded && canExpand && 'line-clamp-6',
                )}
              >
                {description}
              </p>
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="press text-sm font-bold text-primary"
                >
                  {expanded ? t('readLess') : t('readMore')}
                </button>
              )}
            </motion.section>
          )}

          {/* Curriculum */}
          <motion.div variants={section}>
            <CurriculumAccordion modules={c.curriculum} />
          </motion.div>
        </motion.div>
      </main>

      {/* Sticky action bar */}
      <div className="glass absolute inset-x-0 bottom-0 z-40 border-t border-border/60 pb-safe">
        <div className="px-4 py-3">
          {/* Price on top so the CTAs get the full width (no truncation). */}
          <div className="mb-2.5 flex items-baseline gap-2">
            <span
              className={cn(
                'font-heading text-2xl font-extrabold leading-none',
                isFree ? 'text-success' : 'text-money',
              )}
            >
              {money(c.priceCents, c.currency, t('free'))}
            </span>
            {off > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {money(c.compareAtPriceCents!, c.currency)}
              </span>
            )}
            {off > 0 && (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-extrabold text-white">
                −{off}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!isFree && (
              <Button
                variant="secondary"
                onClick={onAdd}
                aria-label={inCart ? t('inCart') : t('addToCart')}
                className={cn(
                  'min-w-0 flex-1',
                  inCart && 'border border-success/40 bg-success/12 text-success',
                )}
              >
                {inCart ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  <ShoppingCart className="size-4 shrink-0" />
                )}
                <span className="truncate">{inCart ? t('inCart') : t('addToCart')}</span>
              </Button>
            )}

            <Button variant="gold" onClick={onBuy} className="min-w-0 flex-1">
              {isFree ? <Sparkles className="size-4 shrink-0" /> : <Zap className="size-4 shrink-0" />}
              <span className="truncate">{isFree ? t('enrollFree') : t('buyNow')}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
