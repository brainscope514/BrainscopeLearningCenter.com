// Site map: which page each section lives on, plus header/footer navigation. Single source for every internal link.
import type { Dictionary } from '@/i18n/en';
import { type Locale, localizedPath } from '@/i18n';

/** Locale-agnostic page paths ('' = home). Each page holds at most three sections. */
export const PAGES = ['', 'about', 'future-skills', 'academic', 'workshops', 'book', 'contact', 'faq'] as const;
export type PageSlug = (typeof PAGES)[number];

/** Section id → page it lives on. The first section of a page is linked without a #hash. */
const SECTION_PAGE: Record<string, { page: PageSlug; first?: boolean }> = {
  programs: { page: '' },
  about: { page: 'about', first: true },
  highlights: { page: 'about' },
  founders: { page: 'about' },
  tracks: { page: 'future-skills', first: true },
  pathway: { page: 'future-skills' },
  academic: { page: 'academic', first: true },
  university: { page: 'academic' },
  workshops: { page: 'workshops', first: true },
  partners: { page: 'workshops' },
  book: { page: 'book', first: true },
  pricing: { page: 'book' },
  testimonials: { page: 'book' },
  contact: { page: 'contact', first: true },
  faq: { page: 'faq', first: true },
};

/** Path of a page in the given locale, e.g. pagePath('en', 'about') → /en/about/. */
export const pagePath = (locale: Locale, page: PageSlug): string => localizedPath(locale, page ? `/${page}/` : '/');

/** Link to a section wherever it lives, e.g. sectionHref('fr', 'university') → /fr/academic/#university. */
export const sectionHref = (locale: Locale, id: string): string => {
  const target = SECTION_PAGE[id];
  if (!target) return localizedPath(locale, `/#${id}`);
  return `${pagePath(locale, target.page)}${target.first ? '' : `#${id}`}`;
};

type NavKey = keyof Dictionary['nav'];

/** Header navigation (kept to 7 items so it fits on one line at xl). */
export const NAV_ITEMS: { key: NavKey; section: string }[] = [
  { key: 'about', section: 'about' },
  { key: 'programs', section: 'programs' },
  { key: 'tracks', section: 'tracks' },
  { key: 'academic', section: 'academic' },
  { key: 'workshops', section: 'workshops' },
  { key: 'faq', section: 'faq' },
  { key: 'contact', section: 'contact' },
];

export const FOOTER_NAV_ITEMS: { key: NavKey; section: string }[] = [
  { key: 'about', section: 'about' },
  { key: 'programs', section: 'programs' },
  { key: 'tracks', section: 'tracks' },
  { key: 'academic', section: 'academic' },
  { key: 'university', section: 'university' },
  { key: 'workshops', section: 'workshops' },
  { key: 'founders', section: 'founders' },
  { key: 'partners', section: 'partners' },
  { key: 'book', section: 'book' },
  { key: 'faq', section: 'faq' },
  { key: 'contact', section: 'contact' },
];

/** Page a nav item belongs to (used to mark the current page in the header). */
export const sectionPage = (id: string): PageSlug | undefined => SECTION_PAGE[id]?.page;
