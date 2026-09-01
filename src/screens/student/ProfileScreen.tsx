import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  Bell,
  FileText,
  Languages,
  LifeBuoy,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLocale, useT } from '@/lib/i18n';
import { AppBar } from '@/components/layout/AppBar';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/button';
import { tapMedium } from '@/lib/native';
import { ProfileHeader } from './profile/ProfileHeader';
import { SettingsGroup } from './profile/SettingsGroup';
import { SettingsRow } from './profile/SettingsRow';

const APP_VERSION = 'v0.1.0';

const strings = {
  title: { en: 'Account', ar: 'الحساب' },
  learner: { en: 'Learner', ar: 'متعلّم' },
  member: { en: 'Member', ar: 'عضو' },

  prefs: { en: 'Preferences', ar: 'التفضيلات' },
  language: { en: 'Language', ar: 'اللغة' },
  languageHint: { en: 'Tap to switch', ar: 'اضغط للتبديل' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  notificationsHint: { en: 'Push & email alerts', ar: 'تنبيهات الدفع والبريد' },

  support: { en: 'Support', ar: 'الدعم' },
  help: { en: 'Help & Support', ar: 'المساعدة والدعم' },
  helpHint: { en: 'Get in touch with us', ar: 'تواصل معنا' },

  legal: { en: 'Legal', ar: 'الشؤون القانونية' },
  terms: { en: 'Terms of Service', ar: 'شروط الخدمة' },
  privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },

  about: { en: 'About', ar: 'حول التطبيق' },
  version: { en: 'App version', ar: 'إصدار التطبيق' },

  logout: { en: 'Log out', ar: 'تسجيل الخروج' },
  logoutQuestion: { en: 'Log out of your account?', ar: 'تسجيل الخروج من حسابك؟' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
};

/** Container / item variants for a gentle staggered entrance. */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ProfileScreen() {
  const t = useT(strings);
  const { locale, toggle } = useLocale();
  const { user, workspace, logout } = useAuth();
  const navigate = useNavigate();

  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: () => api.get<{ email?: string; name?: string }>('/me/profile').catch(() => null),
    staleTime: 5 * 60_000,
  });

  const profile = profileQuery.data;
  const email = profile?.email ?? user?.email;
  const name =
    profile?.name ?? user?.name ?? (email ? email.split('@')[0] : t('learner'));
  const langName = locale === 'ar' ? 'العربية' : 'English';

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    void tapMedium();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <AppBar title={t('title')} />
      <Screen>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-md space-y-5 pt-4"
        >
          {/* Identity hero */}
          <motion.div variants={item}>
            <ProfileHeader
              loading={profileQuery.isPending}
              name={name}
              email={email}
              workspace={workspace?.name}
              memberLabel={t('member')}
            />
          </motion.div>

          {/* Preferences */}
          <motion.div variants={item}>
            <SettingsGroup label={t('prefs')}>
              <SettingsRow
                icon={Languages}
                label={t('language')}
                hint={t('languageHint')}
                onClick={toggle}
                value={<span className="font-bold text-primary">{langName}</span>}
              />
              <SettingsRow
                icon={Bell}
                label={t('notifications')}
                hint={t('notificationsHint')}
                chevron
                onClick={() => {}}
              />
            </SettingsGroup>
          </motion.div>

          {/* Support & legal */}
          <motion.div variants={item}>
            <SettingsGroup label={t('support')}>
              <SettingsRow
                icon={LifeBuoy}
                label={t('help')}
                hint={t('helpHint')}
                chevron
                onClick={() => {}}
              />
              <SettingsRow icon={FileText} label={t('terms')} chevron onClick={() => {}} />
              <SettingsRow icon={ShieldCheck} label={t('privacy')} chevron onClick={() => {}} />
            </SettingsGroup>
          </motion.div>

          {/* Log out */}
          <motion.div variants={item} className="pt-1">
            <AnimatePresence mode="wait" initial={false}>
              {!confirming ? (
                <motion.button
                  key="logout"
                  type="button"
                  onClick={() => setConfirming(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-3.5 font-bold text-destructive shadow-card transition-colors active:bg-destructive/15"
                >
                  <LogOut className="size-4 rtl:-scale-x-100" />
                  {t('logout')}
                </motion.button>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-destructive/25 bg-destructive/[0.06] p-4 text-center shadow-card"
                >
                  <p className="text-sm font-semibold">{t('logoutQuestion')}</p>
                  <div className="mt-3.5 flex gap-2.5">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => setConfirming(false)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      loading={busy}
                      onClick={onLogout}
                    >
                      <LogOut className="size-4 rtl:-scale-x-100" />
                      {t('logout')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Version footer — native convention, removes a whole thin group */}
          <motion.p variants={item} className="pb-2 pt-1 text-center text-xs text-muted-foreground">
            Nix Academy · {APP_VERSION}
          </motion.p>
        </motion.div>
      </Screen>
    </>
  );
}
