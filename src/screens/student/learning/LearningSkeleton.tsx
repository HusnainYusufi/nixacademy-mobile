import { Skeleton } from '@/components/ui/misc';

/** Designed loading state: a hero placeholder over a few row placeholders. */
export function LearningSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      {/* Hero */}
      <div>
        <Skeleton className="mb-3 h-4 w-40 rounded-full" />
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-13 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-2.5 shadow-card"
          >
            <Skeleton className="aspect-square w-[84px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-4/5 rounded-full" />
              <Skeleton className="h-4 w-3/5 rounded-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
