// Real family / student testimonials only (never invented). The section stays hidden while this list is empty
// or FLAGS.SHOW_TESTIMONIALS is false. Add the quote in each language; omit a language to fall back to English.
import type { Locale } from '@/i18n';

export interface Testimonial {
  /** Name as approved by the family, e.g. "Rita K." */
  name: string;
  /** e.g. "Parent of a Falcon Track student" */
  role: Partial<Record<Locale, string>> & { en: string };
  quote: Partial<Record<Locale, string>> & { en: string };
}

export const TESTIMONIALS: Testimonial[] = [];
