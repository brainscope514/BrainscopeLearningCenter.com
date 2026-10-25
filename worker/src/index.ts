// Cloudflare Worker: proxies the website chatbot to the Claude API. The API key lives only here (Worker secret).
// Guards: CORS locked to ALLOWED_ORIGINS, per-IP rate limit, request validation, capped output, prompt caching.
// Response to the site: { text: string, handoff: boolean } (matches ClaudeWorkerProvider in src/lib/chat/).
import Anthropic from '@anthropic-ai/sdk';
import { HANDOFF_MARKER, SYSTEM_PROMPT } from './prompt';

interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string;
  CLAUDE_MODEL: string;
  MAX_OUTPUT_TOKENS: string;
  RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const LOCALES = new Set(['en', 'fr', 'ar']);
const MAX_TURNS = 10;
const MAX_TURN_CHARS = 600;
const MAX_BODY_BYTES = 16_000;

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const json = (body: unknown, status: number, origin?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(origin ? corsHeaders(origin) : {}) },
  });

/** Validates and normalises the conversation sent by the browser. */
function parseBody(raw: unknown): { locale: string; turns: ChatTurn[] } | null {
  if (!raw || typeof raw !== 'object') return null;
  const { locale, messages } = raw as { locale?: unknown; messages?: unknown };
  if (typeof locale !== 'string' || !LOCALES.has(locale) || !Array.isArray(messages) || messages.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const m of messages.slice(-MAX_TURNS)) {
    if (!m || typeof m !== 'object') return null;
    const { role, text } = m as { role?: unknown; text?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim()) return null;
    turns.push({ role, text: text.slice(0, MAX_TURN_CHARS) });
  }
  // The API needs the conversation to start with a user turn and end with the new user question.
  while (turns.length && turns[0]!.role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1]!.role !== 'user') return null;
  return { locale, turns };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
    if (!allowed.includes(origin)) return json({ error: 'forbidden' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin);

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (env.RATE_LIMITER) {
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json({ error: 'rate_limited' }, 429, origin);
    }

    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413, origin);
    let body: ReturnType<typeof parseBody>;
    try {
      body = parseBody(await request.json());
    } catch {
      body = null;
    }
    if (!body) return json({ error: 'bad_request' }, 400, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const messages: Anthropic.Beta.BetaMessageParam[] = body.turns.map((t, i) => ({
      role: t.role,
      // The page language travels with the first user turn, after the cached system prompt.
      content: i === 0 ? `[page language: ${body.locale}]\n${t.text}` : t.text,
    }));

    try {
      const response = await client.beta.messages.create({
        model: env.CLAUDE_MODEL || 'claude-opus-5-5',
        max_tokens: Number(env.MAX_OUTPUT_TOKENS) || 1024,
        // Thinking is always on for this model; low effort keeps short FAQ answers fast and cheap.
        output_config: { effort: 'low' },
        // Static system prompt → cached across requests (verify with usage.cache_read_input_tokens).
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        // If the model declines on safety grounds, the API retries on a fallback model in the same call.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages,
      });

      // Refusals and truncated answers are never shown: hand off to a human instead.
      if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
        return json({ text: '', handoff: true }, 200, origin);
      }
      let text = response.content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('')
        .trim();
      const handoff = text.includes(HANDOFF_MARKER);
      text = text.replaceAll(HANDOFF_MARKER, '').trim();
      return json({ text, handoff }, 200, origin);
    } catch (error) {
      // The site falls back to the FAQ matcher on any non-2xx response.
      if (error instanceof Anthropic.RateLimitError) return json({ error: 'upstream_busy' }, 503, origin);
      if (error instanceof Anthropic.APIError) return json({ error: 'upstream_error' }, 502, origin);
      return json({ error: 'internal_error' }, 500, origin);
    }
  },
};
