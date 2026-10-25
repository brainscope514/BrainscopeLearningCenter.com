// Real partner academies / institutions only. Add an entry (and its logo in src/assets/partners/) once the
// collaboration is confirmed and the partner agrees to be listed. While empty, the partner grid is hidden and the
// Collaborations section shows only the "how we can collaborate" offer.
import type { ImageMetadata } from 'astro';

export interface Partner {
  /** Official name, shown as text (and as the logo's alt text). */
  name: string;
  /** Optional logo imported from src/assets/partners/, e.g. `import logo from '@/assets/partners/x.png'`. */
  logo?: ImageMetadata;
  /** Optional website. */
  url?: string;
}

export const PARTNERS: Partner[] = [];
