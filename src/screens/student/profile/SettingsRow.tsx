import type { ReactNode } from 'react';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tapLight } from '@/lib/native';

export interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** Optional secondary line under the label. */
  hint?: string;
  /** Trailing value / control (e.g. current language, version). */
  value?: ReactNode;
  /** Show the drill-in chevron (RTL-aware). */
  chevron?: boolean;
  onClick?: () => void;
  tone?: 'default' | 'destructive';
}

/**
 * One tappable settings row: leading icon tile, label (+ hint), optional trailing
 * value and a reading-direction chevron. Renders as a real <button> when
 * interactive so the whole 44px+ row is a thumb target.
 */
export function SettingsRow({
  icon: Icon,
  label,
  hint,
  value,
  chevron,
  onClick,
  tone = 'default',
}: SettingsRowProps) {
  const interactive = !!onClick;
  const destructive = tone === 'destructive';

  const inner = (
    <>
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl ring-1',
          destructive
            ? 'bg-destructive/12 text-destructive ring-destructive/15'
            : 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-primary/10',
        )}
      >
        <Icon className="size-[18px]" strokeWidth={2.1} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[0.95rem] font-semibold',
            destructive && 'text-destructive',
          )}
        >
          {label}
        </span>
        {hint && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>

      {value != null && <span className="shrink-0 text-sm font-semibold">{value}</span>}

      {chevron && (
        <ChevronLeft
          className="size-4 shrink-0 text-muted-foreground/60 transition-transform ltr:rotate-180"
          aria-hidden
        />
      )}
    </>
  );

  const className = cn(
    'flex w-full items-center gap-3.5 px-4 py-3.5 text-start',
    interactive && 'press transition-colors active:bg-muted/50',
  );

  if (!interactive) return <div className={className}>{inner}</div>;

  return (
    <button
      type="button"
      onClick={() => {
        void tapLight();
        onClick?.();
      }}
      className={className}
    >
      {inner}
    </button>
  );
}
