import { Link } from 'react-router-dom';
import { BookOpen, Check, Layers, Plus, Flame } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { money, discountPct } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { tapMedium } from '@/lib/native';
import type { Listing } from '@/lib/types';

const strings = {
  free: { en: 'Free', ar: 'مجاني' },
  lessons: { en: '{n} lessons', ar: '{n} درس' },
  bundle: { en: '{n} courses', ar: '{n} دورات' },
  added: { en: 'Added to cart', ar: 'أُضيف إلى السلة' },
  inCart: { en: 'In cart', ar: 'في السلة' },
};

/** Marketplace course card — one component so every grid reads identically. */
export function CourseCard({ c }: { c: Listing }) {
  const { locale } = useLocale();
  const t = useT(strings);
  const { add, has } = useCart();
  const toast = useToast();
  const title = localized(c, 'title', locale);
  const off = discountPct(c.priceCents, c.compareAtPriceCents);
  const isBundle = (c.courseCount ?? 1) > 1;
  const inCart = has(c.courseId);

  return (
    <Link
      to={`/course/${c.courseId}`}
      className="press group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
    >
      {/* Media */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-money/10">
        {c.thumbnailUrl ? (
          <img
            src={fileUrl(c.thumbnailUrl)}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-active:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <BookOpen className="size-9 text-primary/40" />
          </div>
        )}
        {c.boosted && (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-money px-2 py-0.5 text-[10px] font-extrabold text-[oklch(0.2_0.03_80)]">
            <Flame className="size-3" />
          </span>
        )}
        {off > 0 && (
          <span className="absolute end-2.5 top-2.5 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-extrabold text-white">
            −{off}%
          </span>
        )}
        {isBundle && (
          <span className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">
            <Layers className="size-3" /> {t('bundle', { n: c.courseCount! })}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{title}</h3>
        {c.totalLessons > 0 && (
          <div className="mt-1.5">
            <Badge tone="muted">{t('lessons', { n: c.totalLessons })}</Badge>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-1.5">
            {off > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {money(c.compareAtPriceCents!, c.currency)}
              </span>
            )}
            <span
              className={cn(
                'font-heading text-base font-extrabold',
                c.priceCents === 0 ? 'text-success' : 'text-money',
              )}
            >
              {money(c.priceCents, c.currency, t('free'))}
            </span>
          </div>
          <button
            type="button"
            aria-label={inCart ? t('inCart') : 'Add to cart'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (inCart) return;
              void tapMedium();
              add({
                courseId: c.courseId,
                title,
                academyName: c.academyName,
                thumbnailUrl: c.thumbnailUrl,
                priceCents: c.priceCents,
                currency: c.currency,
              });
              toast.show(t('added'), 'success');
            }}
            className={cn(
              'press grid size-9 shrink-0 place-items-center rounded-xl border transition-colors',
              inCart
                ? 'border-success/40 bg-success/12 text-success'
                : 'border-border bg-card text-primary hover:bg-primary/10',
            )}
          >
            {inCart ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
