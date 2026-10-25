// Chat provider contract: the widget only talks to a ChatProvider, so the FAQ matcher (v1) can be swapped for the
// Claude Worker proxy (v2) without UI changes.
import type { Locale } from '@/i18n';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatReply {
  text: string;
  /** FAQ id the answer came from, if any. */
  matchedId?: string;
  /** Show the "Talk to a human on WhatsApp" handoff with this reply. */
  handoff?: boolean;
  /** FAQ ids to offer as quick-reply chips. */
  suggestions?: string[];
}

export interface ChatProvider {
  readonly name: string;
  reply(input: string, history: ChatTurn[], locale: Locale): Promise<ChatReply>;
}
