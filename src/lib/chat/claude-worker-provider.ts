// ChatProvider v2 (STUB, not enabled): forwards the conversation to the Cloudflare Worker in /worker, which calls
// the Claude API server-side. No API key ever reaches the browser. Enabled only when CHAT.workerUrl is set in
// src/data/site.ts; on any error it falls back to the FAQ provider so visitors always get an answer.
import type { Locale } from '@/i18n';
import type { ChatProvider, ChatReply, ChatTurn } from './types';

export class ClaudeWorkerProvider implements ChatProvider {
  readonly name = 'claude-worker';

  constructor(
    private readonly endpoint: string,
    private readonly fallback: ChatProvider,
  ) {}

  async reply(input: string, history: ChatTurn[], locale: Locale): Promise<ChatReply> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, messages: [...history.slice(-8), { role: 'user', text: input }] }),
      });
      if (!res.ok) throw new Error(`Worker responded ${res.status}`);
      const data = (await res.json()) as { text?: string; handoff?: boolean };
      if (data.text) return { text: data.text, handoff: Boolean(data.handoff) };
      if (data.handoff) return { text: '', handoff: true };
      throw new Error('Empty reply');
    } catch {
      return this.fallback.reply(input, history, locale);
    }
  }
}
