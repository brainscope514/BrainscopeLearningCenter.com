// Navigation: dictionary key + in-page anchor. Header uses NAV_ITEMS (kept short to fit); footer uses FOOTER_NAV_ITEMS.
import type { Dictionary } from '@/i18n/en';

export const NAV_ITEMS: { key: keyof Dictionary['nav']; anchor: string }[] = [
  { key: 'about', anchor: 'about' },
  { key: 'programs', anchor: 'programs' },
  { key: 'tracks', anchor: 'tracks' },
  { key: 'academic', anchor: 'academic' },
  { key: 'founders', anchor: 'founders' },
  { key: 'faq', anchor: 'faq' },
  { key: 'contact', anchor: 'contact' },
];

export const FOOTER_NAV_ITEMS: { key: keyof Dictionary['nav']; anchor: string }[] = [
  { key: 'about', anchor: 'about' },
  { key: 'programs', anchor: 'programs' },
  { key: 'tracks', anchor: 'tracks' },
  { key: 'academic', anchor: 'academic' },
  { key: 'university', anchor: 'university' },
  { key: 'workshops', anchor: 'workshops' },
  { key: 'founders', anchor: 'founders' },
  { key: 'partners', anchor: 'partners' },
  { key: 'book', anchor: 'book' },
  { key: 'faq', anchor: 'faq' },
  { key: 'contact', anchor: 'contact' },
];
