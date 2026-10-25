# Brainscope chatbot v2: Cloudflare Worker (not deployed)

The website chatbot works today **without** this Worker: v1 answers from the FAQ files
(`src/data/faq.{en,fr,ar}.json`) entirely in the browser. This Worker is the optional v2: the same chat window
sends questions here, and the Worker asks Claude to answer **using only those FAQ facts**.

```
Browser chat ──POST {locale, messages}──▶ Worker (this folder) ──▶ Claude API
         ◀──────── {text, handoff} ◀────────
```

## Safety and cost guards

- **API key**: stored as a Worker *secret* (`ANTHROPIC_API_KEY`). It is never in the repo or the browser.
- **CORS**: only origins listed in `ALLOWED_ORIGINS` (wrangler.toml) are served; everything else gets 403.
- **Rate limit**: 15 requests per minute per IP (Workers Rate Limiting binding `RATE_LIMITER`).
- **Request limits**: max 10 turns, 600 characters per turn, 16 KB body; `locale` must be en / fr / ar.
- **Output cap**: `MAX_OUTPUT_TOKENS` (default 1024), `effort: low`. Truncated or refused answers are never shown;
  the visitor gets the WhatsApp handoff instead.
- **Strict prompt** (`src/prompt.ts`): built from the site's FAQ files; never invents prices, schedules or
  policies; replies in the visitor's language; appends `[HANDOFF]` when the team should answer (the site then
  shows the WhatsApp button).
- **Prompt caching**: the system prompt is identical for every request and marked `cache_control: ephemeral`,
  so repeated questions mostly pay cached-input rates.
- **Refusal fallback**: `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) lets the API retry a
  safety-declined request on a fallback model inside the same call.
- **Fail-safe**: if the Worker errors or is unreachable, the site silently falls back to the v1 FAQ matcher.

## Model and cost

`CLAUDE_MODEL` defaults to `claude-opus-5-5` at low effort. For a high-volume FAQ bot, `claude-haiku-5-5` is far
cheaper; switch by changing `CLAUDE_MODEL` in `wrangler.toml` (Haiku has no server-side refusal fallback, so
remove the `betas` / `fallbacks` lines in `src/index.ts` if you switch). Set a monthly spend limit in the Claude
Console before going live.

## Deploy

Prerequisites: a Cloudflare account, a Claude API key (console.anthropic.com), Node 20+.

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY      # paste the key when prompted
# edit wrangler.toml → ALLOWED_ORIGINS = "https://your-domain,https://www.your-domain"
npx wrangler deploy                            # prints https://brainscope-chat.<account>.workers.dev
```

Then enable it on the website: in `src/data/site.ts` set

```ts
export const CHAT = { workerUrl: 'https://brainscope-chat.<account>.workers.dev' } as const;
```

and redeploy the site. No UI change is needed (`ClaudeWorkerProvider` implements the same `ChatProvider`
interface as the FAQ matcher).

## Test locally

```bash
cd worker
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .dev.vars   # .dev.vars is local only; never commit it
npx wrangler dev
curl -s localhost:8787 -H 'Origin: https://phoenix-falcon001.github.io' -H 'content-type: application/json' \
  -d '{"locale":"en","messages":[{"role":"user","text":"What ages do you teach?"}]}'
```

`npm run typecheck` type-checks the Worker.
