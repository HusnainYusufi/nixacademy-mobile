import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tapLight } from '@/lib/native';

type Variant = 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold ' +
  'transition-[transform,box-shadow,background-color,opacity] duration-150 press ' +
  'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-glow hover:brightness-105 active:brightness-95',
  gold:
    'text-primary-foreground shadow-glow [background:linear-gradient(120deg,color-mix(in_oklab,var(--color-primary)_80%,white)_0%,var(--color-primary)_45%,color-mix(in_oklab,var(--color-money)_92%,black)_100%)]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-white shadow-premium hover:brightness-105',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
  icon: 'size-11 rounded-full',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  haptic?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, haptic = true, children, onClick, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={(e) => {
        if (haptic) void tapLight();
        onClick?.(e);
      }}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
});
