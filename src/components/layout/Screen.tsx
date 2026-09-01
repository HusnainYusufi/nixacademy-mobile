import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scrollable screen body. Honours the top safe-area (unless an AppBar already
 * did) and always pads the bottom for the tab bar + gesture inset.
 */
export function Screen({
  children,
  className,
  padded = true,
  bottomGap = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  bottomGap?: boolean;
}) {
  return (
    <main
      className={cn(
        'no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden',
        padded && 'px-4',
        bottomGap && 'pb-[calc(5.5rem+var(--safe-bottom))]',
        className,
      )}
    >
      {children}
    </main>
  );
}
