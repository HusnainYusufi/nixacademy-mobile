import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Flame, Sparkles } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { money, discountPct } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Listing } from '@/lib/types';

const strings = {
  featured: { en: 'Featured', ar: 'مميّز' },
  view: { en: 'View', ar: 'عرض' },
  free: { en: 'Free', ar: 'مجاني' },
};

/**
 * Large spotlight card for the boosted (or first) listing. Full-bleed media
 * with a bottom scrim, brand/title over the image, and a "View" affordance
 * that routes to the public course page.
 */
export function FeaturedHero({ c }: { c: Listing }) {
  const { locale } = useLocale();
  const t = useT(strings);
  const title = localized(c, 'title', locale);
  const off = discountPct(c.priceCents, c.compareAtPriceCents);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/course/${c.courseId}`}
        className="press group relative block overflow-hidden rounded-3xl border border-border/60 shadow-premium"
        aria-label={title}
      >
        {/* Media */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-money/15">
          {c.thumbnailUrl ? (
            <img
              src={fileUrl(c.thumbnailUrl)}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-active:scale-[1.05]"
            />
          ) : (
            <div className="grid size-full place-items-center">
              <BookOpen className="size-12 text-primary/40" />
            </div>
          )}
          {/* Bottom scrim so overlaid text stays legible in both themes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-money px-2.5 py-1 text-[11px] font-extrabold text-[oklch(0.2_0.03_80)] shadow-glow">
            {c.boosted ? <Flame className="size-3.5" /> : <Sparkles className="size-3.5" />}
            {t('featured')}
          </span>
          {off > 0 && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-extrabold text-white">
              −{off}%
            </span>
          )}
        </div>

        {/* Overlaid content */}
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
          <p className="truncate text-[11px] font-bold uppercase tracking-wide text-primary">
            {c.academyName}
          </p>
          <h2 className="line-clamp-2 text-lg font-extrabold leading-snug text-foreground">
            {title}
          </h2>
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-baseline gap-1.5">
              {off > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {money(c.compareAtPriceCents!, c.currency)}
                </span>
              )}
              <span
                className={cn(
                  'font-heading text-xl font-extrabold',
                  c.priceCents === 0 ? 'text-success' : 'text-money',
                )}
              >
                {money(c.priceCents, c.currency, t('free'))}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow">
              {t('view')}
              <ArrowLeft className="size-4 ltr:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
