// Single source of truth for contact data, social links and feature flags.
// Never hardcode any of these values elsewhere in the codebase.

export const SITE = {
  name: 'Brainscope Learning Center',
  altName: 'Academy of Advanced AI & Robotics',
  founders: ['Bassam Eter', 'Marie Deeb'],
  address: {
    street: 'Main Road (Tripoli–Zgharta highway)',
    locality: 'Zgharta',
    region: 'North Governorate',
    country: 'LB',
  },
  // TODO_CONFIRM: exact coordinates of the center (used in JSON-LD and the map embed).
  geo: null as { lat: number; lng: number } | null,
} as const;

export const CONTACT = {
  /** E.164 digits only, used to build wa.me and tel: links. */
  whatsappNumber: '96181171031',
  whatsappDisplay: '+961 81 171 031',
  phoneNumber: '+96181171031',
  phoneDisplay: '+961 81 171 031',
  email: 'TODO_CONFIRM@example.com',
} as const;

export const SOCIAL = {
  instagramHandle: 'brainscopecenter',
  instagram: 'https://www.instagram.com/brainscopecenter/',
  facebook: 'TODO_CONFIRM',
  tiktok: 'TODO_CONFIRM',
  googleMaps: 'TODO_CONFIRM',
} as const;

/** Google Maps search used by the click-to-load map until the exact pin (SOCIAL.googleMaps) is confirmed. TODO_CONFIRM */
export const MAP_QUERY = 'Brainscope Learning Center, Zgharta, Lebanon';
export const mapSearchUrl = (): string =>
  isConfirmed(SOCIAL.googleMaps)
    ? SOCIAL.googleMaps
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
export const mapEmbedUrl = (): string => `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

/** TODO_CONFIRM: opening hours. While null, the contact section asks visitors to check on WhatsApp. */
export const HOURS: null | { en: string; fr: string; ar: string } = null;

/** Chatbot settings. workerUrl: leave empty to use the FAQ matcher only (v1); set it to the deployed
 * Cloudflare Worker URL (see /worker/README.md) to enable Claude-powered answers (v2). */
export const CHAT = {
  workerUrl: '',
} as const;

/** Analytics: nothing loads while every value is empty. Fill ONE value (and review the privacy notice) to enable.
 * plausibleDomain: e.g. 'brainscope.example' · gaId: e.g. 'G-XXXXXXX' · metaPixelId: e.g. '1234567890'. */
export const ANALYTICS = {
  plausibleDomain: '',
  gaId: '',
  metaPixelId: '',
} as const;

/** Feature flags: flip to true when the content is real and approved. */
export const FLAGS = {
  SHOW_PRICING: false,
  SHOW_TESTIMONIALS: false,
  SHOW_MILITARY_AFFILIATION: false,
} as const;

/** True when a value is still a TODO_CONFIRM placeholder (used to hide unconfirmed links). */
export const isConfirmed = (value: string): boolean => !value.includes('TODO_CONFIRM');

/** Builds a wa.me link with a URL-encoded pre-filled message (safe for Arabic). */
export const whatsappLink = (message?: string): string =>
  `https://wa.me/${CONTACT.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const telLink = (): string => `tel:${CONTACT.phoneNumber}`;
