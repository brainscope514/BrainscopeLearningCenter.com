// sitemap.xml with hreflang alternates for every localized page (generated at build time, no extra dependency).
import type { APIRoute } from 'astro';
import { LOCALES, LOCALE_TAGS, localizedPath } from '@/i18n';
import { PAGES as SLUGS } from '@/data/nav';

/** Locale-agnostic page paths to list (from the site map in src/data/nav.ts). */
const PAGES = SLUGS.map((slug) => (slug ? `/${slug}/` : '/'));

/** Build date: every deploy rebuilds all pages, so this is the honest "last modified" date. */
const LASTMOD = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const urls = PAGES.flatMap((page) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (alt) => `    <xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[alt].hreflang}" href="${abs(localizedPath(alt, page))}"/>`,
      );
      alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(localizedPath('en', page))}"/>`);
      return `  <url>\n    <loc>${abs(localizedPath(locale, page))}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n${alternates.join('\n')}\n  </url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
