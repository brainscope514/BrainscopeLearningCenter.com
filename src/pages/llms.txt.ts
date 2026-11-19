// /llms.txt: short Markdown map of the site for AI assistants (see src/lib/llms.ts).
import type { APIRoute } from 'astro';
import { buildLlms } from '@/lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(buildLlms(site!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
