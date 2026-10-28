// Site map: which page each section lives on, plus header/footer navigation. Single source for every internal link.
import type { Dictionary } from '@/i18n/en';
import { type Locale, localizedPath } from '@/i18n';

/** Locale-agnostic page paths ('' = home). Each page holds at most three sections. */
export const PAGES = ['', 'about', 'programs', 'book', 'contact', 'faq'] as const;
export type PageSlug = (typeof PAGES)[number];

/** Old pages merged into /programs/ (kept as redirects so shared links still work). */
export const REDIRECTS: Record<string, string> = {
  'future-skills': 'programs#for-kids',
  academic: 'programs#program-academic',
  workshops: 'programs#program-workshops',
};

/**
 * Section / program id → where it lives. `hash` is appended to the page path; programs open their popup
 * (#program-…) and filters pre-select an audience (#for-…).
 */
const TARGETS: Record<string, { page: PageSlug; hash?: string }> = {
  about: { page: 'about' },
  founders: { page: 'about', hash: 'founders' },
  // Collaborations live in a Programs popup until real partner logos exist (then the About page shows them too).
  partners: { page: 'programs', hash: 'program-partnerships' },
  programs: { page: 'programs' },
  pathway: { page: 'programs', hash: 'pathway' },
  tracks: { page: 'programs', hash: 'for-kids' },
  academic: { page: 'programs', hash: 'program-academic' },
  university: { page: 'programs', hash: 'program-university' },
  development: { page: 'programs', hash: 'program-development' },
  workshops: { page: 'programs', hash: 'program-workshops' },
  book: { page: 'book' },
  pricing: { page: 'book', hash: 'pricing' },
  testimonials: { page: 'book', hash: 'testimonials' },
  contact: { page: 'contact' },
  faq: { page: 'faq' },
};

/** Path of a page in the given locale, e.g. pagePath('en', 'about') → /en/about/. */
export const pagePath = (locale: Locale, page: PageSlug): string => localizedPath(locale, page ? `/${page}/` : '/');

/** Link to a section or program wherever it lives, e.g. sectionHref('fr', 'university') → /fr/programs/#program-university. */
export const sectionHref = (locale: Locale, id: string): string => {
  const target = TARGETS[id];
  if (!target) return localizedPath(locale, `/#${id}`);
  return `${pagePath(locale, target.page)}${target.hash ? `#${target.hash}` : ''}`;
};

type NavKey = keyof Dictionary['nav'];

/** Header navigation: short on purpose, one item per page (the trial CTA sits beside it). */
export const NAV_ITEMS: { key: NavKey; section: string }[] = [
  { key: 'about', section: 'about' },
  { key: 'programs', section: 'programs' },
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
export const sectionPage = (id: string): PageSlug | undefined => TARGETS[id]?.page;
