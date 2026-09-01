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
import { session } from './api';

export type Locale = 'ar' | 'en';
const LOCALE_KEY = 'nixacademy.locale';

interface LocaleCtx {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

const Ctx = createContext<LocaleCtx | null>(null);

function applyDom(locale: Locale) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  session.setLang(locale);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    void Preferences.get({ key: LOCALE_KEY }).then(({ value }) => {
      if (value === 'ar' || value === 'en') {
        setLocaleState(value);
        applyDom(value);
      } else {
        applyDom('ar');
      }
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    applyDom(l);
    void Preferences.set({ key: LOCALE_KEY, value: l });
  }, []);

  const value = useMemo<LocaleCtx>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      setLocale,
      toggle: () => setLocale(locale === 'ar' ? 'en' : 'ar'),
    }),
    [locale, setLocale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

/** One bilingual string. */
export type Msg = { en: string; ar: string };
/** A screen's string table. */
export type Dict = Record<string, Msg>;

/**
 * Screen-local translations — each screen passes its own {en, ar} table, so no
 * shared dictionary file exists to collide on. Supports `{name}` interpolation.
 *
 *   const t = useT({ title: { en: 'Explore', ar: 'استكشف' } });
 *   <h1>{t('title')}</h1>
 */
export function useT<D extends Dict>(dict: D) {
  const { locale } = useLocale();
  return useCallback(
    (key: keyof D, vars?: Record<string, string | number>) => {
      const msg = dict[key];
      let out = (msg ? msg[locale] : String(key)) ?? String(key);
      if (vars) for (const k in vars) out = out.replaceAll(`{${k}}`, String(vars[k]));
      return out;
    },
    // dict is defined inline per render but stable in content; locale drives it.
    [locale, dict],
  );
}

/** Pick the right side of a bilingual value outside of a component tree. */
export function pick(msg: Msg, locale: Locale) {
  return msg[locale];
}

/** Localized field helper for API rows carrying `titleI18n` / `descriptionI18n`
 *  maps ({ en, ar }) with a base fallback. */
export function localized(row: object, field: string, locale: Locale): string {
  const r = row as Record<string, unknown>;
  const i18n = r[`${field}I18n`] as Record<string, string> | undefined;
  const val = i18n?.[locale] || i18n?.en || i18n?.ar;
  return (val || (r[field] as string) || '') as string;
}
