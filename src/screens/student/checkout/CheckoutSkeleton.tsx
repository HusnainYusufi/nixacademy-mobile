import { Skeleton } from '@/components/ui/misc';

/** Designed first-load state: account, coupon, and summary card placeholders. */
export function CheckoutSkeleton() {
  return (
    <div aria-hidden className="space-y-5 pt-4">
      {/* Account */}
      <div>
        <Skeleton className="mb-2.5 h-3 w-24 rounded-full" />
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3 rounded-full" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Coupon */}
      <div>
        <Skeleton className="mb-2.5 h-3 w-28 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
      </div>

      {/* Summary */}
      <div>
        <Skeleton className="mb-2.5 h-3 w-32 rounded-full" />
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
          <Skeleton className="h-px w-full rounded-none" />
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
