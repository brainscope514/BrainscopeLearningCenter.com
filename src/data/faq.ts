// FAQ entries per locale, shared by the FAQ section and (Phase 3) the chatbot matcher.
// Source files: src/data/faq.{en,fr,ar}.json. `status: "TODO_CONFIRM"` marks answers awaiting founder confirmation.
import type { Locale } from '@/i18n';
import en from './faq.en.json';
import fr from './faq.fr.json';
import ar from './faq.ar.json';

export interface FaqEntry {
  id: string;
  q: string;
  a: string;
  keywords: string[];
  status?: string;
}

const FAQ: Record<Locale, FaqEntry[]> = { en, fr, ar };

export const getFaq = (locale: Locale): FaqEntry[] => FAQ[locale];
