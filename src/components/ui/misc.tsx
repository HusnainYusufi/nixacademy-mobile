import type { HTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Badge / Pill ─────────────────────────────────────────────────────── */
type Tone = 'gold' | 'success' | 'muted' | 'destructive' | 'primary';
const tones: Record<Tone, string> = {
  gold: 'bg-primary/15 text-primary',
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  muted: 'bg-muted text-muted-foreground',
  destructive: 'bg-destructive/12 text-destructive',
};
export function Badge({
  tone = 'muted',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Skeleton (shimmer) ───────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-muted/70',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]',
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rtl:before:translate-x-full",
        className,
      )}
    />
  );
}

/* ── Spinner ──────────────────────────────────────────────────────────── */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-primary', className)} />;
}

/* ── Progress bar ─────────────────────────────────────────────────────── */
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-money transition-[width] duration-500 [transition-timing-function:var(--ease-spring)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ── Avatar ───────────────────────────────────────────────────────────── */
export function Avatar({
  name,
  src,
  className,
}: {
  name?: string;
  src?: string | null;
  className?: string;
}) {
  const initials = (name ?? 'N')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={cn(
        'grid size-10 shrink-0 place-items-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-bold text-primary ring-1 ring-border',
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-8 py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground/70">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold">{title}</h3>
      {hint && <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────────────────────────── */
export function Divider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px bg-border', className)} {...props} />;
}
