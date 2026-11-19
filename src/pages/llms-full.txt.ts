// /llms-full.txt: full text of programs and confirmed FAQ answers in EN / FR / AR (see src/lib/llms.ts).
import type { APIRoute } from 'astro';
import { buildLlmsFull } from '@/lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(buildLlmsFull(site!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
