import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, FieldProps>(function Input(
  { className, label, hint, error, leading, trailing, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-foreground/90">
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-12 w-full rounded-xl border border-input bg-card/60 px-4 text-[0.95rem] text-foreground',
            'placeholder:text-muted-foreground/70 transition-shadow',
            'focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15',
            leading && 'ps-10',
            trailing && 'pe-10',
            error && 'border-destructive/70 focus:ring-destructive/15',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 end-3 flex items-center text-muted-foreground">
            {trailing}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});
