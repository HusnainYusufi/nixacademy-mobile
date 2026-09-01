import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Base surface: card background, hairline border, layered shadow. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card text-card-foreground shadow-card',
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}
