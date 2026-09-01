import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AtSign, Eye, EyeOff, Lock, Languages, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useLocale, useT } from '@/lib/i18n';
import { ApiError } from '@/lib/api';
import { LogoMark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const strings = {
  welcome: { en: 'Welcome back', ar: 'مرحبًا بعودتك' },
  sub: { en: 'Sign in to keep learning.', ar: 'سجّل الدخول لمواصلة التعلّم.' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  emailPh: { en: 'you@example.com', ar: 'you@example.com' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  passwordPh: { en: 'Your password', ar: 'كلمة المرور' },
  signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
  bad: { en: 'The email or password is incorrect.', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
  multi: {
    en: 'This email is linked to more than one academy. Please contact support.',
    ar: 'هذا البريد مرتبط بأكثر من أكاديمية. يرجى التواصل مع الدعم.',
  },
  tagline: { en: 'Learn. Prove it. Grow.', ar: 'تعلّم. أثبت. انطلق.' },
};

export function LoginScreen() {
  const t = useT(strings);
  const { toggle, locale } = useLocale();
  const { login, lastEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(lastEmail ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate('/app/explore', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'MULTIPLE_ACADEMIES') setError(t('multi'));
      else setError(t('bad'));
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Ambient brand backdrop */}
      <div className="aurora opacity-90" />
      <div className="grain absolute inset-0" />

      {/* language toggle */}
      <div className="relative z-10 flex justify-end px-4 pt-[calc(0.75rem+var(--safe-top))]">
        <button
          type="button"
          onClick={toggle}
          className="press glass flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-bold"
        >
          <Languages className="size-3.5 text-primary" />
          {locale === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-10">
        {/* Brand hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-9 flex flex-col items-center text-center"
        >
          <div className="relative mb-5">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl" />
            <div className="grid size-20 place-items-center rounded-3xl border border-primary/25 bg-card/70 shadow-glow">
              <LogoMark className="size-11" />
            </div>
          </div>
          <h1 className="text-gold text-3xl font-extrabold tracking-tight">Nix Academy</h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">{t('tagline')}</p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="glass mx-auto w-full max-w-sm space-y-4 rounded-3xl border border-border/60 p-6 shadow-premium"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold">{t('welcome')}</h2>
            <p className="text-sm text-muted-foreground">{t('sub')}</p>
          </div>

          <Input
            label={t('email')}
            name="email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leading={<AtSign className="size-4" />}
            placeholder={t('emailPh')}
          />
          <Input
            label={t('password')}
            name="password"
            type={show ? 'text' : 'password'}
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leading={<Lock className="size-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="pointer-events-auto grid size-8 place-items-center rounded-lg text-muted-foreground"
                aria-label="Toggle password"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            placeholder={t('passwordPh')}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-semibold text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={busy}
            className={cn('w-full', busy && 'opacity-90')}
          >
            {!busy && <ArrowLeft className="size-4 ltr:rotate-180" />}
            {t('signIn')}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
