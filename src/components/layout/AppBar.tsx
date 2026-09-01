import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';
import { tapLight } from '@/lib/native';

/**
 * Sticky top bar. `back` shows a chevron that pops the history stack (mirrored
 * for RTL). `large` renders a big title block underneath for feed screens.
 */
export function AppBar({
  title,
  back,
  actions,
  className,
  transparent,
}: {
  title?: ReactNode;
  back?: boolean;
  actions?: ReactNode;
  className?: string;
  transparent?: boolean;
}) {
  const navigate = useNavigate();
  const { dir } = useLocale();
  return (
    <header
      className={cn(
        'sticky top-0 z-30 pt-safe',
        transparent ? 'bg-transparent' : 'glass border-b border-border/60',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        {back ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              void tapLight();
              navigate(-1);
            }}
            className="press grid size-10 place-items-center rounded-full text-foreground hover:bg-muted"
          >
            <ChevronRight className={cn('size-5', dir === 'ltr' && 'rotate-180')} />
          </button>
        ) : (
          <span className="w-1" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold">{title}</h1>
        <div className="flex min-w-10 items-center justify-end gap-1">{actions}</div>
      </div>
    </header>
  );
}
