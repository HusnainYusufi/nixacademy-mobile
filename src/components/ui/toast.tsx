import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Kind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: Kind;
  message: string;
}

const Ctx = createContext<{ show: (message: string, kind?: Kind) => void } | null>(null);

const icon = { success: CheckCircle2, error: XCircle, info: Info };
const tone = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-primary',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: Kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[calc(0.75rem+var(--safe-top))]">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = icon[t.kind];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="glass pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border border-border/60 px-4 py-3 shadow-premium"
                >
                  <Icon className={cn('size-5 shrink-0', tone[t.kind])} />
                  <span className="text-sm font-medium">{t.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
