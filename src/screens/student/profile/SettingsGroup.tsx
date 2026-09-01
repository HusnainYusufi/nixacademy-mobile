import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * A titled group of settings rows on a single card, with hairline dividers
 * between rows. Rows carry their own padding, so the card sits flush.
 */
export function SettingsGroup({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {label && (
        <h2 className="mb-2 px-1 text-[0.72rem] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </h2>
      )}
      <Card className={cn('divide-y divide-border/60 overflow-hidden p-0')}>{children}</Card>
    </section>
  );
}
