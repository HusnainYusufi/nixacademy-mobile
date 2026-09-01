import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Preferences } from '@capacitor/preferences';

export interface CartItem {
  courseId: string;
  title: string;
  academyName: string;
  thumbnailUrl?: string | null;
  priceCents: number;
  currency: string;
}

const KEY = 'nixacademy.cart';

interface CartCtx {
  items: CartItem[];
  ready: boolean;
  count: number;
  has: (courseId: string) => boolean;
  add: (item: CartItem) => void;
  remove: (courseId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Preferences.get({ key: KEY }).then(({ value }) => {
      if (value) {
        try {
          setItems(JSON.parse(value) as CartItem[]);
        } catch {
          /* corrupt cart — ignore */
        }
      }
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    void Preferences.set({ key: KEY, value: JSON.stringify(next) });
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      count: items.length,
      has: (id) => items.some((i) => i.courseId === id),
      add: (item) =>
        persist(items.some((i) => i.courseId === item.courseId) ? items : [...items, item]),
      remove: (id) => persist(items.filter((i) => i.courseId !== id)),
      clear: () => persist([]),
    }),
    [items, ready, persist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
