import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { discountPct } from '@/lib/format';
import { localized, useLocale } from '@/lib/i18n';
import type { CourseDetail } from '@/lib/types';

/**
 * Full-bleed course hero: the thumbnail rising behind the status bar with a
 * bottom scrim and the academy kicker + localized title overlaid, plus a
 * discount flag.
 */
export function CourseHero({ c }: { c: CourseDetail }) {
  const { locale } = useLocale();
  const title = localized(c, 'title', locale);
  const off = discountPct(c.priceCents, c.compareAtPriceCents);

  return (
    <div className="relative h-[52vh] min-h-[320px] w-full overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-money/15">
      {c.thumbnailUrl ? (
        <motion.img
          src={fileUrl(c.thumbnailUrl)}
          alt=""
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="size-full object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center">
          <BookOpen className="size-16 text-primary/40" />
        </div>
      )}

      {/* Bottom scrim so the overlaid title reads in any theme. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      {/* Soft top vignette so the floating back button stays legible. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/60 to-transparent" />

      {/* Flags */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-end p-4 pt-[calc(var(--safe-top)+0.75rem)]">
        {off > 0 && (
          <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-extrabold text-white shadow-premium">
            −{off}%
          </span>
        )}
      </div>

      {/* Overlaid identity */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 bottom-0 space-y-2 p-4 pb-5"
      >
        <p className="truncate text-xs font-bold uppercase tracking-wide text-primary">
          {c.academyName}
        </p>
        <h1 className="text-2xl font-extrabold leading-tight text-foreground">{title}</h1>
      </motion.div>
    </div>
  );
}
