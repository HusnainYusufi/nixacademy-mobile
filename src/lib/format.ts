/** Price formatting shared across every commerce surface. Free reads as free. */
export function money(cents: number, currency = 'SAR', free = 'Free'): string {
  if (cents === 0) return free;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

/** Whole-percent discount, or 0 when there's no meaningful "was" price. */
export function discountPct(priceCents: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= priceCents) return 0;
  return Math.round(((compareAt - priceCents) / compareAt) * 100);
}

/** "12:04" from seconds. */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
