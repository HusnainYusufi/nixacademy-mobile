import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { tapMedium } from '@/lib/native';

const strings = {
  title: { en: "You're in!", ar: 'تم تفعيل وصولك!' },
  sub: {
    en: 'Your courses are unlocked and ready. Time to start learning.',
    ar: 'تم فتح دوراتك وهي جاهزة الآن. حان وقت بدء التعلّم.',
  },
  cta: { en: 'Start learning', ar: 'ابدأ التعلّم' },
  note: { en: 'A receipt is on its way to your inbox.', ar: 'سيصلك الإيصال إلى بريدك قريبًا.' },
};

const spark = [
  { x: -68, y: -34, d: 0.18, s: 0.9 },
  { x: 72, y: -20, d: 0.26, s: 1.1 },
  { x: -52, y: 40, d: 0.34, s: 0.8 },
  { x: 60, y: 46, d: 0.22, s: 1 },
  { x: 0, y: -72, d: 0.3, s: 0.85 },
];

/** Celebratory in-screen confirmation shown after a completed (non-redirect) order. */
export function SuccessPanel() {
  const t = useT(strings);
  const navigate = useNavigate();

  useEffect(() => {
    void tapMedium();
  }, []);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6 pb-10 pt-6 text-center">
      {/* Ambient celebration glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-1/4 mx-auto size-72 rounded-full bg-success/20 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 mx-auto size-56 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
        className="relative mb-7"
      >
        {/* Pulsing rings */}
        <motion.span
          className="absolute inset-0 -z-10 rounded-full bg-success/25"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="grid size-24 place-items-center rounded-full border border-success/30 bg-success/12 shadow-glow">
          <CheckCircle2 className="size-14 text-success" />
        </div>

        {/* Floating sparkles */}
        {spark.map((p, i) => (
          <motion.span
            key={i}
            className="absolute start-1/2 top-1/2 text-primary"
            style={{ x: p.x, y: p.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, p.s, 0.4] }}
            transition={{ duration: 1.4, delay: 0.3 + p.d, repeat: Infinity, repeatDelay: 1.1 }}
          >
            <Sparkles className="size-4" />
          </motion.span>
        ))}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-gold text-2xl font-extrabold tracking-tight"
      >
        {t('title')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2.5 max-w-xs text-sm font-medium leading-relaxed text-muted-foreground"
      >
        {t('sub')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 w-full max-w-sm"
      >
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={() => {
            void tapMedium();
            navigate('/app/learning');
          }}
        >
          <GraduationCap className="size-5" />
          {t('cta')}
        </Button>
        <p className="mt-3 text-xs font-medium text-muted-foreground">{t('note')}</p>
      </motion.div>
    </div>
  );
}
