import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronDown, Layers, Trash2 } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { money } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/lib/cart';
import type { QuoteLine } from '@/lib/types';

const strings = {
  free: { en: 'Free', ar: 'مجاني' },
  remove: { en: 'Remove', ar: 'إزالة' },
  bundleCount: { en: '{n} courses in bundle', ar: '{n} دورات ضمن الحزمة' },
  notForSale: { en: 'No longer available for purchase', ar: 'لم يعد متاحًا للشراء' },
  alreadyOwned: { en: 'You already own this course', ar: 'تمتلك هذه الدورة بالفعل' },
};

/**
 * One cart line. Renders from the local `item` immediately and layers the
 * server `line` (price, availability, bundle contents) on top once it arrives.
 * `pricing` = the first quote is still loading, so the cached price is shown.
 */
export function CartLine({
  item,
  line,
  pricing,
  onRemove,
}: {
  item: CartItem;
  line?: QuoteLine;
  pricing: boolean;
  onRemove: () => void;
}) {
  const t = useT(strings);
  const [open, setOpen] = useState(false);

  const unavailable = line?.unavailable ?? null;
  const hasDiscount = !!line && line.discountCents > 0 && !unavailable;
  const currency = line?.currency ?? item.currency;
  const displayCents = unavailable
    ? line?.unitPriceCents ?? item.priceCents
    : line?.lineTotalCents ?? item.priceCents;
  const bundled = line?.bundledCourses ?? [];
  const isBundle = (line?.courseCount ?? 1) > 1 && bundled.length > 0;
  const thumb = fileUrl(item.thumbnailUrl);

  return (
    <Card className={cn('overflow-hidden', unavailable && 'opacity-70')}>
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-money/10">
          {thumb ? (
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center">
              <BookOpen className="size-7 text-primary/40" />
            </div>
          )}
          {isBundle && (
            <span className="absolute bottom-1 start-1 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold text-primary-foreground">
              <Layers className="size-2.5" />
              {line!.courseCount}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug">{item.title}</h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.academyName}</p>
            </div>
            <button
              type="button"
              aria-label={t('remove')}
              onClick={onRemove}
              className="press -me-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div className="flex items-baseline gap-1.5">
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {money(line!.unitPriceCents, currency)}
                </span>
              )}
              <span
                className={cn(
                  'font-heading text-base font-extrabold tabular-nums transition-opacity',
                  unavailable
                    ? 'text-muted-foreground line-through'
                    : displayCents === 0
                      ? 'text-success'
                      : 'text-money',
                  pricing && 'opacity-50',
                )}
              >
                {money(displayCents, currency, t('free'))}
              </span>
            </div>

            {isBundle && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="press inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
              >
                {t('bundleCount', { n: line!.courseCount })}
                <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unavailable notice — owning a course is informational (amber), only a
          not-for-sale line is a real error (red). */}
      {unavailable && (
        <div
          className={cn(
            'flex items-center gap-2 border-t px-3 py-2 text-xs font-semibold',
            unavailable === 'ALREADY_OWNED'
              ? 'border-warning/25 bg-warning/10 text-warning'
              : 'border-destructive/20 bg-destructive/5 text-destructive',
          )}
        >
          {unavailable === 'ALREADY_OWNED' ? (
            <CheckCircle2 className="size-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="size-3.5 shrink-0" />
          )}
          <span>{unavailable === 'ALREADY_OWNED' ? t('alreadyOwned') : t('notForSale')}</span>
        </div>
      )}

      {/* Bundle disclosure */}
      {isBundle && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="bundle"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 border-t border-border/60 bg-muted/25 p-3">
                {bundled.map((b) => {
                  const bThumb = fileUrl(b.thumbnailUrl);
                  return (
                    <li key={b.courseId} className="flex items-center gap-2.5">
                      <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-money/10">
                        {bThumb ? (
                          <img src={bThumb} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <BookOpen className="size-4 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-1 min-w-0 flex-1 text-xs font-medium text-foreground/90">
                        {b.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Card>
  );
}
