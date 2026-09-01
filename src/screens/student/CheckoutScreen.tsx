import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import {
  AtSign,
  BadgeCheck,
  Lock,
  RefreshCw,
  ShieldCheck,
  Tag,
  Ticket,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { tapLight } from '@/lib/native';
import { AppBar } from '@/components/layout/AppBar';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, Divider, EmptyState, Spinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { Quote } from '@/lib/types';
import { CheckoutSkeleton } from './checkout/CheckoutSkeleton';
import { SuccessPanel } from './checkout/SuccessPanel';

const strings = {
  title: { en: 'Checkout', ar: 'إتمام الشراء' },
  confirmed: { en: 'Confirmed', ar: 'تم الشراء' },
  secureBadge: { en: 'Secure checkout', ar: 'دفع آمن' },
  itemsCount: { en: '{n} in your order', ar: '{n} في طلبك' },
  // Account
  account: { en: 'Account', ar: 'الحساب' },
  buyingAs: { en: 'Buying as your account', ar: 'الشراء بحسابك' },
  emailLabel: { en: 'Email for your receipt', ar: 'البريد لاستلام الإيصال' },
  emailPh: { en: 'you@example.com', ar: 'you@example.com' },
  emailHint: { en: "We'll send access and the receipt here.", ar: 'سنرسل الوصول والإيصال إلى هنا.' },
  emailBad: { en: 'Enter a valid email address.', ar: 'أدخل بريدًا إلكترونيًا صحيحًا.' },
  // Coupon
  coupon: { en: 'Coupon', ar: 'قسيمة' },
  couponPh: { en: 'Enter code', ar: 'أدخل الرمز' },
  apply: { en: 'Apply', ar: 'تطبيق' },
  couponApplied: { en: 'Coupon applied', ar: 'تم تطبيق القسيمة' },
  couponInvalid: { en: "That code doesn't apply to your order.", ar: 'هذا الرمز لا ينطبق على طلبك.' },
  remove: { en: 'Remove coupon', ar: 'إزالة القسيمة' },
  // Summary
  summary: { en: 'Order summary', ar: 'ملخص الطلب' },
  discounts: { en: 'Discounts', ar: 'الخصومات' },
  total: { en: 'Total', ar: 'الإجمالي' },
  free: { en: 'Free', ar: 'مجانًا' },
  owned: { en: 'Already owned', ar: 'تملكها بالفعل' },
  unavailable: { en: 'Unavailable', ar: 'غير متاحة' },
  // CTA
  paySecurely: { en: 'Pay securely', ar: 'ادفع بأمان' },
  getAccess: { en: 'Get instant access', ar: 'احصل على وصول فوري' },
  secureNote: {
    en: 'Encrypted payment · instant access on success',
    ar: 'دفع مشفّر · وصول فوري عند النجاح',
  },
  payError: { en: "We couldn't start your payment. Try again.", ar: 'تعذّر بدء الدفع. حاول مجددًا.' },
  // Error
  errorTitle: { en: "Couldn't price your order", ar: 'تعذّر تسعير طلبك' },
  errorHint: { en: 'Check your connection and try again.', ar: 'تحقّق من اتصالك وحاول مجددًا.' },
  retry: { en: 'Try again', ar: 'إعادة المحاولة' },
};

const EMAIL_RE = /\S+@\S+\.\S+/;

export function CheckoutScreen() {
  const t = useT(strings);
  const { locale } = useLocale();
  const { user } = useAuth();
  const { items, clear, ready } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  // ── Email (prefill from session, else profile; read-only when we know it) ──
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailLocked, setEmailLocked] = useState(!!user?.email);
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (user?.email) return;
    let alive = true;
    api
      .get<{ email?: string }>('/me/profile')
      .catch(() => null)
      .then((p) => {
        if (alive && p?.email) {
          setEmail(p.email);
          setEmailLocked(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [user?.email]);

  // ── Coupons: courseId → applied code ──
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect out if the cart is empty (but never once the order succeeded).
  useEffect(() => {
    if (ready && items.length === 0 && !success) navigate('/app/cart', { replace: true });
  }, [ready, items.length, success, navigate]);

  const itemIds = items.map((i) => i.courseId).join(',');
  const codesKey = JSON.stringify(codes);

  // ── Live server-priced quote — recomputes whenever coupons change ──
  const quoteQuery = useQuery({
    queryKey: ['checkout', 'quote', itemIds, codesKey],
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      api.post<Quote>('/marketplace/orders/quote', {
        items: items.map((i) => ({
          courseId: i.courseId,
          ...(codes[i.courseId] ? { couponCode: codes[i.courseId] } : {}),
        })),
      }),
  });

  const quote = quoteQuery.data;
  const currency = quote?.currency ?? items[0]?.currency ?? 'SAR';
  const freeLabel = t('free');
  const firstLoading = quoteQuery.isPending;
  const recomputing = quoteQuery.isFetching && !quoteQuery.isPending;
  const emailOk = EMAIL_RE.test(email.trim());

  // Applied coupons as { code, discountCents } derived from the live quote.
  const appliedCoupons = useMemo(() => {
    const map = new Map<string, number>();
    for (const [courseId, code] of Object.entries(codes)) {
      const line = quote?.lines.find((l) => l.courseId === courseId);
      map.set(code, (map.get(code) ?? 0) + (line?.discountCents ?? 0));
    }
    return [...map.entries()].map(([code, discountCents]) => ({ code, discountCents }));
  }, [codes, quote]);

  // ── Apply a coupon: price the cart with the code, keep it on every line that
  //    accepts it, toast if none do. ──
  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code || applying) return;
    setApplying(true);
    try {
      const q = await api.post<Quote>('/marketplace/orders/quote', {
        items: items.map((i) => ({ courseId: i.courseId, couponCode: code })),
      });
      const accepted = q.lines.filter((l) => l.couponCode === code && !l.couponError);
      if (accepted.length === 0) {
        toast.show(t('couponInvalid'), 'error');
      } else {
        setCodes((prev) => {
          const next = { ...prev };
          for (const l of accepted) next[l.courseId] = code;
          return next;
        });
        setCouponInput('');
        toast.show(t('couponApplied'), 'success');
      }
    } catch {
      toast.show(t('couponInvalid'), 'error');
    } finally {
      setApplying(false);
    }
  }

  function removeCoupon(code: string) {
    void tapLight();
    setCodes((prev) => {
      const next: Record<string, string> = {};
      for (const [courseId, c] of Object.entries(prev)) if (c !== code) next[courseId] = c;
      return next;
    });
  }

  // ── Pay ──
  async function pay() {
    const em = email.trim();
    if (!em || !emailOk || paying || firstLoading || recomputing) return;
    setPaying(true);
    try {
      const res = await api.post<{ ref: string; redirectUrl: string | null; totalCents: number }>(
        '/marketplace/orders',
        {
          email: em,
          locale,
          items: items.map((i) => ({
            courseId: i.courseId,
            ...(codes[i.courseId] ? { couponCode: codes[i.courseId] } : {}),
          })),
        },
      );
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return; // navigating away — keep the button in its busy state
      }
      clear();
      setSuccess(true);
    } catch {
      toast.show(t('payError'), 'error');
      setPaying(false);
    }
  }

  /* ── Success state ─────────────────────────────────────────────────────── */
  if (success) {
    return (
      <>
        <AppBar title={t('confirmed')} />
        <Screen padded={false} bottomGap={false}>
          <SuccessPanel />
        </Screen>
      </>
    );
  }

  const payDisabled = firstLoading || recomputing || paying || !emailOk;
  const payLabel = quote?.free ? t('getAccess') : t('paySecurely');
  const totalDisplay = quote?.free ? freeLabel : money(quote?.totalCents ?? 0, currency, freeLabel);

  return (
    <>
      <AppBar
        title={t('title')}
        back
        actions={
          <Badge tone="success">
            <ShieldCheck className="size-3" />
            {t('secureBadge')}
          </Badge>
        }
      />

      <Screen bottomGap={false} className="pt-3">
        {quoteQuery.isError ? (
          <EmptyState
            icon={<RefreshCw className="size-7" />}
            title={t('errorTitle')}
            hint={t('errorHint')}
            action={
              <Button
                variant="outline"
                loading={quoteQuery.isFetching}
                onClick={() => void quoteQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                {t('retry')}
              </Button>
            }
          />
        ) : firstLoading ? (
          <CheckoutSkeleton />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-5 pb-6"
          >
            {items.length > 0 && (
              <Section>
                <p className="px-1 text-xs font-semibold text-muted-foreground">
                  {t('itemsCount', { n: items.length })}
                </p>
              </Section>
            )}

            {/* Account */}
            <Section>
              <Label icon={<BadgeCheck className="size-3.5" />}>{t('account')}</Label>
              {emailLocked ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <BadgeCheck className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold" dir="ltr">
                      {email}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{t('buyingAs')}</p>
                  </div>
                </div>
              ) : (
                <Input
                  label={t('emailLabel')}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  leading={<AtSign className="size-4" />}
                  placeholder={t('emailPh')}
                  hint={t('emailHint')}
                  error={emailTouched && !emailOk ? t('emailBad') : undefined}
                />
              )}
            </Section>

            {/* Coupon */}
            <Section>
              <Label icon={<Ticket className="size-3.5" />}>{t('coupon')}</Label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void applyCoupon();
                }}
                className="flex items-start gap-2"
              >
                <div className="flex-1">
                  <Input
                    name="coupon"
                    dir="ltr"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    leading={<Tag className="size-4" />}
                    placeholder={t('couponPh')}
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="h-12 shrink-0"
                  loading={applying}
                  disabled={applying || !couponInput.trim()}
                >
                  {t('apply')}
                </Button>
              </form>

              {appliedCoupons.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <AnimatePresence initial={false}>
                    {appliedCoupons.map((c) => (
                      <motion.button
                        key={c.code}
                        type="button"
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                        onClick={() => removeCoupon(c.code)}
                        aria-label={t('remove')}
                        className="press inline-flex max-w-full items-center gap-1.5 rounded-full border border-success/30 bg-success/12 py-1 ps-3 pe-2 text-xs font-bold text-success"
                      >
                        <Tag className="size-3 shrink-0" />
                        <span className="truncate" dir="ltr">
                          {c.code}
                        </span>
                        {c.discountCents > 0 && (
                          <span className="tabular-nums opacity-80">
                            −{money(c.discountCents, currency, freeLabel)}
                          </span>
                        )}
                        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-success/20">
                          <X className="size-3" />
                        </span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Section>

            {/* Order summary */}
            <Section>
              <div className="mb-2 flex items-center gap-2 px-1">
                <Label className="mb-0">{t('summary')}</Label>
                {recomputing && <Spinner className="size-3.5" />}
              </div>
              <div
                className={cn(
                  'rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-opacity',
                  recomputing && 'opacity-60',
                )}
              >
                <ul className="space-y-3.5">
                  {quote?.lines.map((line) => (
                    <li key={line.courseId} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-snug">
                          {items.find((i) => i.courseId === line.courseId)?.title ?? line.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {line.academyName}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {line.unavailable === 'ALREADY_OWNED' && (
                            <Badge tone="muted">{t('owned')}</Badge>
                          )}
                          {line.unavailable === 'NOT_FOR_SALE' && (
                            <Badge tone="destructive">{t('unavailable')}</Badge>
                          )}
                          {line.couponCode && !line.couponError && (
                            <Badge tone="success">
                              <Tag className="size-2.5" />
                              <span dir="ltr">{line.couponCode}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-end">
                        {line.discountCents > 0 && (
                          <p className="text-[11px] font-medium text-muted-foreground line-through tabular-nums">
                            {money(line.unitPriceCents, currency, freeLabel)}
                          </p>
                        )}
                        <p className="text-sm font-bold tabular-nums">
                          {money(line.lineTotalCents, currency, freeLabel)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {!!quote && quote.discountCents > 0 && (
                  <>
                    <Divider className="my-3.5" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-success">{t('discounts')}</span>
                      <span className="font-bold text-success tabular-nums">
                        −{money(quote.discountCents, currency, freeLabel)}
                      </span>
                    </div>
                  </>
                )}

                <Divider className="my-3.5" />
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold">{t('total')}</span>
                  <span
                    className={cn(
                      'text-xl font-extrabold tabular-nums',
                      quote?.free ? 'text-success' : 'text-gold',
                    )}
                  >
                    {totalDisplay}
                  </span>
                </div>
              </div>
            </Section>
          </motion.div>
        )}
      </Screen>

      {/* Sticky pay bar */}
      {quote && !quoteQuery.isError && (
        <motion.footer
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass border-t border-border/60 px-4 pt-3 pb-[calc(0.85rem+var(--safe-bottom))]"
        >
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{t('total')}</span>
              <span
                className={cn(
                  'text-lg font-extrabold tabular-nums',
                  quote.free ? 'text-success' : 'text-gold',
                )}
              >
                {totalDisplay}
              </span>
            </div>
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              loading={paying}
              disabled={payDisabled}
              onClick={() => void pay()}
            >
              {!paying && <Lock className="size-4" />}
              {payLabel}
            </Button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" />
              {t('secureNote')}
            </p>
          </div>
        </motion.footer>
      )}
    </>
  );
}

/* ── Local layout helpers ─────────────────────────────────────────────────── */
function Section({ children }: { children: ReactNode }) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.section>
  );
}

function Label({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-primary',
        className,
      )}
    >
      {icon}
      {children}
    </p>
  );
}
