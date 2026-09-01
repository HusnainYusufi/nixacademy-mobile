import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, GraduationCap, ShoppingBag, User, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { useT } from '@/lib/i18n';
import { tapLight } from '@/lib/native';

const strings = {
  explore: { en: 'Explore', ar: 'استكشف' },
  learning: { en: 'My Courses', ar: 'دوراتي' },
  cart: { en: 'Cart', ar: 'السلة' },
  profile: { en: 'Profile', ar: 'حسابي' },
};

type Tab = { to: string; icon: LucideIcon; key: keyof typeof strings };
const TABS: Tab[] = [
  { to: '/app/explore', icon: Compass, key: 'explore' },
  { to: '/app/learning', icon: GraduationCap, key: 'learning' },
  { to: '/app/cart', icon: ShoppingBag, key: 'cart' },
  { to: '/app/profile', icon: User, key: 'profile' },
];

export function TabBar() {
  const t = useT(strings);
  const { count } = useCart();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(0.5rem+var(--safe-bottom))]">
      <div className="glass pointer-events-auto mx-3 flex w-full max-w-md items-stretch justify-around rounded-3xl border border-border/60 px-1.5 py-1.5 shadow-premium">
        {TABS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => void tapLight()}
            className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="tab-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-2xl bg-primary/12"
                  />
                )}
                <span className="relative">
                  <Icon
                    className={cn(
                      'size-[22px] transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {key === 'cart' && count > 0 && (
                    <span className="absolute -end-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-money px-1 text-[10px] font-extrabold leading-4 text-[oklch(0.2_0.03_80)]">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'relative text-[10px] font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {t(key)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
