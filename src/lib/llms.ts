// Builds llms.txt (short map of the site for AI assistants, https://llmstxt.org) and llms-full.txt (full text:
// programs + every confirmed FAQ answer). Everything comes from the same i18n/data files as the pages,
// so the text stays in sync with the site automatically. Unconfirmed values (TODO_CONFIRM) are never included.
import { LOCALES, type Locale, getDictionary, localizedPath, withBase } from '@/i18n';
import { CONTACT, SITE, SOCIAL, isConfirmed } from '@/data/site';
import { getFaq } from '@/data/faq';
import { PARTNERS } from '@/data/partners';
import { PAGES } from '@/data/nav';

const LANG_NAMES: Record<Locale, string> = { en: 'English', fr: 'Français', ar: 'العربية' };

const pageTitle = (locale: Locale, slug: string): string => {
  const t = getDictionary(locale);
  if (!slug) return t.meta.defaultTitle;
  const seo = (t.seo as Record<string, { title: string }>)[slug];
  return seo ? seo.title : slug;
};
const pageDescription = (locale: Locale, slug: string): string => {
  const t = getDictionary(locale);
  if (!slug) return t.meta.defaultDescription;
  return (t.seo as Record<string, { description: string }>)[slug]?.description ?? '';
};

function facts(site: URL): string[] {
  const lines = [
    `- Name: ${SITE.name}`,
    `- What: education and technology learning center (robotics, AI, programming, academic and university support, communication and leadership)`,
    `- Location: ${SITE.address.street}, ${SITE.address.locality}, North Lebanon`,
    `- Ages: from 6 years old to university students`,
    `- Teaching extras: weekly parent follow-up; free trial session before enrolling`,
    `- Phone / WhatsApp: ${CONTACT.phoneDisplay} (https://wa.me/${CONTACT.whatsappNumber})`,
    `- Instagram: ${SOCIAL.instagram}`,
  ];
  if (isConfirmed(SOCIAL.googleMaps)) lines.push(`- Google Maps: ${SOCIAL.googleMaps}`);
  if (isConfirmed(CONTACT.email)) lines.push(`- Email: ${CONTACT.email}`);
  if (isConfirmed(SOCIAL.facebook)) lines.push(`- Facebook: ${SOCIAL.facebook}`);
  lines.push(`- Founders: ${SITE.founders.join(' and ')}`);
  lines.push(`- Book a free trial: ${new URL(localizedPath('en', '/book/'), site).href}`);
  lines.push(`- Website languages: English, French, Arabic`);
  lines.push(`- Prices: not published online; ask on WhatsApp`);
  return lines;
}

export function buildLlms(site: URL): string {
  const abs = (path: string) => new URL(path, site).href;
  const t = getDictionary('en');
  const out: string[] = [];
  out.push(`# ${SITE.name}`, '');
  out.push(`> ${t.meta.defaultDescription}`, '');
  out.push(
    'Brainscope is an engineering-led learning center in Zgharta, North Lebanon. It teaches robotics, programming and AI with visible progression, supports school and university students, and runs communication, leadership and media workshops. Tagline: Think • Create • Lead.',
    '',
  );
  out.push('## Key facts', '', ...facts(site), '');
  for (const locale of LOCALES) {
    out.push(`## Pages (${LANG_NAMES[locale]})`, '');
    for (const slug of PAGES) {
      const path = localizedPath(locale, slug ? `/${slug}/` : '/');
      out.push(`- [${pageTitle(locale, slug)}](${abs(path)}): ${pageDescription(locale, slug)}`);
    }
    out.push('');
  }
  out.push('## Optional', '');
  out.push(`- [Full text of programs and FAQ](${abs(withBase('/llms-full.txt'))}): complete answers in English, French and Arabic`);
  out.push(`- [Sitemap](${abs(withBase('/sitemap.xml'))})`);
  out.push('');
  return out.join('\n');
}

export function buildLlmsFull(site: URL): string {
  const out: string[] = [buildLlms(site), '---', ''];
  for (const locale of LOCALES) {
    const t = getDictionary(locale);
    out.push(`# ${t.meta.siteName} (${LANG_NAMES[locale]})`, '');
    out.push(`## ${t.about.title}`, '', t.about.intro, '');
    for (const p of t.about.pillars) out.push(`- ${p.title}: ${p.text}`);
    out.push('');
    out.push(`## ${t.catalog.title}`, '');
    for (const tr of t.tracks.items) out.push(`- ${tr.name} (${tr.age}): ${tr.summary}`);
    for (const cat of t.programs.categories.filter((c) => c.id !== 'tracks')) out.push(`- ${cat.title}: ${cat.text}`);
    out.push(`- ${t.academic.agendaTitle}: ${t.academic.agendaText}`);
    out.push('');
    out.push(`### ${t.university.eyebrow}`, '', t.university.intro, '');
    for (const f of t.university.fields) out.push(`- ${f.title}: ${f.text}`);
    out.push('');
    out.push(`### ${t.workshops.eyebrow}`, '', t.workshops.intro, '');
    for (const w of t.workshops.items) out.push(`- ${w.title}: ${w.text}`);
    out.push('');
    if (PARTNERS.length) {
      out.push(`### ${t.partners.listTitle}`, '');
      for (const p of PARTNERS) out.push(`- ${p.name}${p.url ? ` (${p.url})` : ''}`);
      out.push('');
    }
    out.push(`## ${t.faq.title}`, '');
    for (const f of getFaq(locale).filter((e) => e.status !== 'TODO_CONFIRM')) out.push(`### ${f.q}`, '', f.a, '');
  }
  return out.join('\n');
}
