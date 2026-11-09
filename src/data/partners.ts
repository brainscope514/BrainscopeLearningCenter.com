// Real partner academies / institutions only. Add an entry (and its logo in src/assets/partners/) once the
// collaboration is confirmed and the partner agrees to be listed. While empty, the partner grid is hidden and the
// Collaborations section shows only the "how we can collaborate" offer.
import type { ImageMetadata } from 'astro';
import alefbaaLogo from '@/assets/partners/alefbaa-ai.png';
import futurebotsLogo from '@/assets/partners/futurebots.png';
import ckcLogo from '@/assets/partners/ckc-chedid.png';
import smartElectricLogo from '@/assets/partners/smart-electric.png';

export interface Partner {
  /** Official name, shown as text (and as the logo's alt text). */
  name: string;
  /** Optional logo imported from src/assets/partners/, e.g. `import logo from '@/assets/partners/x.png'`. */
  logo?: ImageMetadata;
  /** Optional website or Instagram page. */
  url?: string;
}

// Logos are cropped from the files the partners sent (white background; shown on white tiles).
export const PARTNERS: Partner[] = [
  { name: 'alefbaa.ai', logo: alefbaaLogo, url: 'https://www.instagram.com/alefbaa.ai/' },
  { name: 'FutureBots', logo: futurebotsLogo, url: 'https://futurebots.academy/' },
  { name: 'CKC Chedid', logo: ckcLogo, url: 'https://www.instagram.com/chedidc.k.c/' },
  // Logo only, no link (by choice).
  { name: 'Smart Electric', logo: smartElectricLogo },
  // TODO_CONFIRM: logo (name-only tile until it arrives).
  { name: 'Las Manos Art Studio', url: 'https://www.instagram.com/lasmanosartstudio/' },
];
