import { AlertTriangle, Loader2, RefreshCw, ShieldCheck, Tag } from 'lucide-react';
import { money } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import type { Quote } from '@/lib/types';

const strings = {
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  discount: { en: 'Discounts', ar: 'الخصومات' },
  total: { en: 'Total', ar: 'الإجمالي' },
  free: { en: 'Free', ar: 'مجاني' },
  checkout: { en: 'Checkout', ar: 'إتمام الشراء' },
  couponsNote: { en: 'Coupons applied at checkout', ar: 'تُطبّق الأكواد عند الدفع' },
  unavailableNote: {
    en: 'Remove the unavailable items to continue.',
    ar: 'أزل العناصر غير المتاحة للمتابعة.',
  },
  errorNote: {
    en: "Couldn't refresh prices. Showing your last total.",
    ar: 'تعذّر تحديث الأسعار. نعرض آخر إجمالي.',
  },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  updating: { en: 'Updating prices…', ar: 'جارٍ تحديث الأسعار…' },
};

export function CartSummary({
  quote,
  cachedSubtotalCents,
  currency,
  firstLoad,
  repricing,
  isError,
  hasUnavailable,
  onRetry,
  onCheckout,
  className,
}: {
  quote?: Quote;
  cachedSubtotalCents: number;
  currency: string;
  firstLoad: boolean;
  repricing: boolean;
  isError: boolean;
  hasUnavailable: boolean;
  onRetry: () => void;
  onCheckout: () => void;
  className?: string;
}) {
  const t = useT(strings);

  const cur = quote?.currency ?? currency;
  const subtotalCents = quote?.subtotalCents ?? cachedSubtotalCents;
  const discountCents = quote?.discountCents ?? 0;
  const totalCents = quote?.totalCents ?? cachedSubtotalCents;
  const free = quote?.free ?? false;

  const checkoutDisabled = firstLoad || repricing || isError || hasUnavailable;

  return (
    <Card className={cn('relative overflow-hidden shadow-premium', className)}>
      {/* soft gold wash at the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/8 to-transparent" />
      <CardBody className="relative space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          {firstLoad ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="font-semibold tabular-nums text-foreground">
              {money(subtotalCents, cur)}
            </span>
          )}
        </div>

        {discountCents > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-success">
              <Tag className="size-3.5" />
              {t('discount')}
            </span>
            <span className="font-semibold tabular-nums text-success">
              {`− ${money(discountCents, cur)}`}
            </span>
          </div>
        )}

        <div className="h-px bg-border" />

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{t('total')}</span>
            {repricing && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                {t('updating')}
              </span>
            )}
          </div>
          {firstLoad ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <span
              className={cn(
                'font-heading text-2xl font-extrabold tabular-nums',
                free ? 'text-success' : 'text-gold',
              )}
            >
              {free ? t('free') : money(totalCents, cur)}
            </span>
          )}
        </div>

        {/* Blocking notes */}
        {hasUnavailable && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/8 px-3 py-2 text-xs font-semibold text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>{t('unavailableNote')}</span>
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs">
            <span className="min-w-0 text-muted-foreground">{t('errorNote')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 shrink-0 px-2.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              {t('retry')}
            </Button>
          </div>
        )}

        <Button
          variant="gold"
          size="lg"
          className="mt-1 w-full"
          disabled={checkoutDisabled}
          onClick={onCheckout}
        >
          {t('checkout')}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {t('couponsNote')}
        </p>
      </CardBody>
    </Card>
  );
}
