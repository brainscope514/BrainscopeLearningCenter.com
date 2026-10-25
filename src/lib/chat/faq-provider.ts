// ChatProvider v1: keyword + fuzzy matcher over the FAQ JSON. It never generates text: every answer is a
// verbatim FAQ answer, so it cannot invent prices, schedules or policies. Unsure → suggestions, then WhatsApp handoff.
import type { Locale } from '@/i18n';
import type { FaqEntry } from '@/data/faq';
import type { ChatProvider, ChatReply, ChatTurn } from './types';
import { normalize, stem, tokens } from './normalize';

const MATCH_THRESHOLD = 2.5;

/** Levenshtein distance ≤ 1 (cheap check for one typo). */
function nearlyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 5) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

interface Indexed {
  entry: FaqEntry;
  phrases: string[];
  words: string[];
  questionWords: Set<string>;
}

export function scoreEntry(item: Indexed, inputNorm: string, inputTokens: string[]): number {
  let score = 0;
  for (const phrase of item.phrases) if (` ${inputNorm} `.includes(` ${phrase} `)) score += 3;
  for (const tok of inputTokens) {
    if (item.words.includes(tok)) score += 2.5;
    else if (item.words.some((w) => nearlyEqual(w, tok) || (tok.length >= 5 && w.length >= 5 && (w.startsWith(tok) || tok.startsWith(w)))))
      score += 1.5;
    if (item.questionWords.has(tok)) score += 1;
  }
  return score;
}

export class FaqProvider implements ChatProvider {
  readonly name = 'faq';
  private index: Indexed[];
  private unmatched = 0;

  constructor(entries: FaqEntry[]) {
    this.index = entries.map((entry) => {
      const kw = entry.keywords.map(normalize);
      return {
        entry,
        phrases: kw.filter((k) => k.includes(' ')),
        words: kw.filter((k) => !k.includes(' ')).map(stem),
        questionWords: new Set(tokens(entry.q)),
      };
    });
  }

  /** Answer for a quick-reply chip (exact FAQ id). */
  answer(id: string): ChatReply | null {
    const hit = this.index.find((i) => i.entry.id === id);
    return hit ? this.toReply(hit.entry) : null;
  }

  question(id: string): string | undefined {
    return this.index.find((i) => i.entry.id === id)?.entry.q;
  }

  async reply(input: string, _history: ChatTurn[], _locale: Locale): Promise<ChatReply> {
    const inputNorm = normalize(input);
    const inputTokens = tokens(input);
    let best: { item: Indexed; score: number } | null = null;
    for (const item of this.index) {
      const score = scoreEntry(item, inputNorm, inputTokens);
      if (!best || score > best.score) best = { item, score };
    }
    if (best && best.score >= MATCH_THRESHOLD) {
      this.unmatched = 0;
      return this.toReply(best.item.entry);
    }
    this.unmatched += 1;
    // Second miss in a row → hand off to a human instead of guessing.
    if (this.unmatched >= 2) {
      this.unmatched = 0;
      return { text: '', handoff: true };
    }
    const ranked = this.index
      .map((item) => ({ id: item.entry.id, score: scoreEntry(item, inputNorm, inputTokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.id);
    return { text: '', suggestions: ranked };
  }

  private toReply(entry: FaqEntry): ChatReply {
    // Answers still awaiting founder confirmation always come with the WhatsApp handoff.
    return { text: entry.a, matchedId: entry.id, handoff: entry.status === 'TODO_CONFIRM' };
  }
}
