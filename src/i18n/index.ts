// i18n helpers: locale list, dictionary lookup, text direction and base-aware localized paths.
import en, { type Dictionary } from './en';
import fr from './fr';
import ar from './ar';

export const LOCALES = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP 47 tags used for hreflang and og:locale. */
export const LOCALE_TAGS: Record<Locale, { hreflang: string; og: string }> = {
  en: { hreflang: 'en', og: 'en_US' },
  fr: { hreflang: 'fr', og: 'fr_FR' },
  ar: { hreflang: 'ar', og: 'ar_LB' },
};

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar };

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

export const getDir = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');

/** Prefixes a root-relative path with the configured Astro `base` (GitHub Pages project sites). */
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
};

/** Path of `subpath` (e.g. "/" or "/#faq") in the given locale, base included. */
export const localizedPath = (locale: Locale, subpath = '/'): string => {
  const clean = subpath.startsWith('/') ? subpath : `/${subpath}`;
  return withBase(`/${locale}${clean}`);
};

/** Strips base and locale prefix from a pathname, returning the locale-agnostic remainder. */
export const stripLocale = (pathname: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const segments = path.split('/').filter(Boolean);
  if (segments.length && isLocale(segments[0])) segments.shift();
  path = `/${segments.join('/')}`;
  return pathname.endsWith('/') && path !== '/' ? `${path}/` : path;
};

/** Fills `{token}` placeholders in a dictionary template, e.g. fill(t.tracks.waMessage, { track: 'Robo Kids' }). */
export const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);

/** Link to the free-trial page (used by every "Book a free trial" CTA). */
export const trialHref = (locale: Locale): string => localizedPath(locale, '/book/');
