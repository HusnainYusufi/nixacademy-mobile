import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { tapLight } from '@/lib/native';

const strings = {
  all: { en: 'All', ar: 'الكل' },
};

/**
 * Horizontal, scrollbar-less strip of category filters. Bleeds to the screen
 * edges (`-mx-4 px-4`) for the native "swipe the rail" feel, and mirrors
 * cleanly under RTL. `all` is always first; `value` of `'all'` clears the
 * filter.
 */
export function CategoryChips({
  categories,
  selected,
  onSelect,
  loading,
}: {
  categories: string[];
  selected: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}) {
  const t = useT(strings);

  if (loading) {
    return (
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  const chips = ['all', ...categories];

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5">
      {chips.map((value) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              void tapLight();
              onSelect(value);
            }}
            className={cn(
              'press h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] font-bold transition-colors',
              active
                ? 'border-transparent bg-primary text-primary-foreground shadow-glow'
                : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground',
            )}
          >
            {value === 'all' ? t('all') : value}
          </button>
        );
      })}
    </div>
  );
}
