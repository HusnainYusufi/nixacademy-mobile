import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, type CartItem } from '@/lib/cart';
import { useLocale, useT } from '@/lib/i18n';
import { tapMedium } from '@/lib/native';
import { AppBar } from '@/components/layout/AppBar';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import type { Quote } from '@/lib/types';
import { CartLine } from './cart/CartLine';
import { CartSummary } from './cart/CartSummary';

const strings = {
  title: { en: 'Cart', ar: 'السلة' },
  count: { en: '{n} courses ready to enroll', ar: '{n} دورة جاهزة للتسجيل' },
  countOne: { en: '1 course ready to enroll', ar: 'دورة واحدة جاهزة للتسجيل' },
  emptyTitle: { en: 'Your cart is empty', ar: 'سلتك فارغة' },
  emptyHint: {
    en: 'Browse the catalog and add the courses you want to learn.',
    ar: 'تصفّح الكتالوج وأضف الدورات التي تريد تعلّمها.',
  },
  browse: { en: 'Explore courses', ar: 'استكشف الدورات' },
  removed: { en: 'Removed from cart', ar: 'تمت الإزالة من السلة' },
};

export function CartScreen() {
  const t = useT(strings);
  const navigate = useNavigate();
  const toast = useToast();
  const { dir } = useLocale();
  const { items, remove, ready } = useCart();

  // Stable key: re-price whenever the set of courses changes.
  const idKey = useMemo(
    () => items.map((i) => i.courseId).sort().join(','),
    [items],
  );

  const quoteQ = useQuery({
    queryKey: ['cart', 'quote', idKey],
    queryFn: () =>
      api.post<Quote>('/marketplace/orders/quote', {
        items: items.map((i) => ({ courseId: i.courseId })),
      }),
    enabled: ready && items.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 0,
    retry: 1,
  });

  const quote = quoteQ.data;
  const firstLoad = quoteQ.isLoading; // fetching with no data yet
  const repricing = quoteQ.isFetching && !quoteQ.isLoading;
  const lineFor = (id: string) => quote?.lines.find((l) => l.courseId === id);
  const hasUnavailable = quote?.lines.some((l) => l.unavailable) ?? false;
  const cachedSubtotalCents = items.reduce((s, i) => s + i.priceCents, 0);
  const currency = items[0]?.currency ?? 'SAR';

  const handleRemove = (item: CartItem) => {
    void tapMedium();
    remove(item.courseId);
    toast.show(t('removed'), 'info');
  };

  return (
    <>
      <AppBar title={t('title')} />
      <Screen className="pt-3">
        {!ready ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <EmptyState
              className="pt-20"
              icon={<ShoppingBag className="size-7" />}
              title={t('emptyTitle')}
              hint={t('emptyHint')}
              action={
                <Button variant="gold" size="lg" onClick={() => navigate('/app/explore')}>
                  {t('browse')}
                </Button>
              }
            />
          </motion.div>
        ) : (
          <>
            <p className="mb-3 px-1 text-sm text-muted-foreground">
              {items.length === 1 ? t('countOne') : t('count', { n: items.length })}
            </p>

            <motion.ul
              className="flex flex-col gap-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.li
                    key={item.courseId}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: dir === 'rtl' ? -28 : 28,
                      scale: 0.96,
                      transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                    }}
                  >
                    <CartLine
                      item={item}
                      line={lineFor(item.courseId)}
                      pricing={firstLoad}
                      onRemove={() => handleRemove(item)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <CartSummary
                className="mt-4"
                quote={quote}
                cachedSubtotalCents={cachedSubtotalCents}
                currency={currency}
                firstLoad={firstLoad}
                repricing={repricing}
                isError={quoteQ.isError}
                hasUnavailable={hasUnavailable}
                onRetry={() => void quoteQ.refetch()}
                onCheckout={() => navigate('/checkout')}
              />
            </motion.div>
          </>
        )}
      </Screen>
    </>
  );
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="mb-1 h-4 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
      <Skeleton className="mt-1 h-56 rounded-2xl" />
    </div>
  );
}
