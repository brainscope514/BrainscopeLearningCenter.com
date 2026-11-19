// robots.txt: everything public is open to search engines and AI assistants; points to the sitemap and llms.txt.
// Note: crawlers only read robots.txt at the root of a domain. While the site lives in a sub-folder
// (brainscope514.github.io/BrainscopeLearningCenter.com/), this file is informative only; submit the sitemap in
// Google Search Console instead. With a root URL (custom domain or a <user>.github.io repo) it works fully.
import type { APIRoute } from 'astro';
import { withBase } from '@/i18n';

/** Search engines and AI assistants explicitly welcomed (they are also covered by "User-agent: *"). */
const WELCOME = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Applebot',
];

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(withBase(path), site).href;
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    ...WELCOME.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${abs('/sitemap.xml')}`,
    '',
    `# Plain-text summary for AI assistants: ${abs('/llms.txt')}`,
    `# Full text version: ${abs('/llms-full.txt')}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
