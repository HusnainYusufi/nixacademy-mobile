import { cn } from '@/lib/utils';

/** Credential seal with a check — the Nix Academy brand mark ("proof of
 *  learning" in one glyph). Uses the primary token so it themes automatically. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn('size-9', className)} aria-hidden>
      <path
        d="M16 2.5l3.6 2.2 4.2-.3 1.5 3.9 3.2 2.7-1.4 4 1.4 4-3.2 2.7-1.5 3.9-4.2-.3L16 31.5l-3.6-2.2-4.2.3-1.5-3.9L3.5 23l1.4-4-1.4-4 3.2-2.7L8.2 4.4l4.2.3L16 2.5z"
        fill="var(--color-primary)"
        opacity="0.16"
      />
      <path
        d="M16 4.2l3 1.8 3.5-.2 1.2 3.3 2.7 2.2-1.2 3.4 1.2 3.3-2.7 2.2-1.2 3.3-3.5-.2-3 1.9-3-1.9-3.5.2-1.2-3.3L5.1 21l1.2-3.3L5.1 14.3 7.8 12l1.2-3.3 3.5.2 3-1.8z"
        stroke="var(--color-primary)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 16.2l3 3 6-6.4"
        stroke="var(--color-primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className, name = 'Nix Academy' }: { className?: string; name?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-heading', className)}>
      <LogoMark className="size-8" />
      <span className="text-xl font-extrabold tracking-tight">{name}</span>
    </span>
  );
}
