// Chat assistant UI (vanilla DOM), lazy-loaded on first open by ChatLauncher. Talks to a ChatProvider only.
// Accessible: dialog labelled by its title, polite live log, Escape closes and returns focus to the launcher.
import type { Locale } from '@/i18n';
import type { FaqEntry } from '@/data/faq';
import type { ChatProvider, ChatReply, ChatTurn } from './types';
import { FaqProvider } from './faq-provider';
import { ClaudeWorkerProvider } from './claude-worker-provider';

export interface ChatStrings {
  close: string;
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  send: string;
  typing: string;
  suggestionsLabel: string;
  notSure: string;
  handoff: string;
  handoffCta: string;
  handoffMessage: string;
  confirmNote: string;
  opensInNewTab: string;
  quickReplies: string[];
}

export interface ChatOptions {
  locale: Locale;
  strings: ChatStrings;
  whatsappNumber: string;
  workerUrl: string;
  launcher: HTMLButtonElement;
}

const FAQ_LOADERS: Record<Locale, () => Promise<{ default: FaqEntry[] }>> = {
  en: () => import('@/data/faq.en.json'),
  fr: () => import('@/data/faq.fr.json'),
  ar: () => import('@/data/faq.ar.json'),
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function createChat(opts: ChatOptions) {
  const { strings: s, launcher } = opts;
  const faq = new FaqProvider((await FAQ_LOADERS[opts.locale]()).default);
  const provider: ChatProvider = opts.workerUrl ? new ClaudeWorkerProvider(opts.workerUrl, faq) : faq;
  const history: ChatTurn[] = [];
  const waLink = (text: string) => `https://wa.me/${opts.whatsappNumber}?text=${encodeURIComponent(text)}`;
  let lastQuestion = '';

  // ---- DOM ------------------------------------------------------------------------------------------------
  const panel = el(
    'div',
    'chat-panel fixed bottom-4 end-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] max-h-[min(36rem,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl border border-violet/40 bg-navy-900 text-white shadow-[0_24px_64px_-12px_rgb(0_0_0/0.7)]',
  );
  panel.id = 'brainscope-chat';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'brainscope-chat-title');
  panel.hidden = true;

  const header = el('div', 'flex items-start gap-3 border-b border-white/10 bg-[linear-gradient(135deg,rgb(106_44_255/0.35),transparent)] p-4');
  const titles = el('div', 'flex-1');
  const title = el('h2', 'text-base font-bold', s.title);
  title.id = 'brainscope-chat-title';
  titles.append(title, el('p', 'mt-0.5 text-xs text-ink-muted', s.subtitle));
  const closeBtn = el('button', 'grid size-10 place-items-center rounded-md hover:bg-white/10');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', s.close);
  closeBtn.innerHTML =
    '<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3-1.41-1.41Z"/></svg>';
  header.append(titles, closeBtn);

  const log = el('div', 'flex-1 space-y-3 overflow-y-auto p-4');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  // Focusable so keyboard users can scroll the conversation.
  log.tabIndex = 0;
  log.setAttribute('aria-label', s.title);

  const chips = el('div', 'flex flex-wrap gap-2 px-4 pb-3');
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', s.suggestionsLabel);

  const form = el('form', 'flex gap-2 border-t border-white/10 p-3');
  const input = el('input', 'min-w-0 flex-1 rounded-pill border border-white/15 bg-navy-800 px-4 py-2.5 text-sm text-white placeholder:text-ink-muted focus:border-violet focus:outline-none');
  input.type = 'text';
  input.maxLength = 300;
  input.placeholder = s.placeholder;
  input.setAttribute('aria-label', s.placeholder);
  const sendBtn = el('button', 'rounded-pill bg-purple px-4 text-sm font-semibold hover:bg-purple-400', s.send);
  sendBtn.type = 'submit';
  form.append(input, sendBtn);

  const footer = el('a', 'flex items-center justify-center gap-2 border-t border-white/10 py-2.5 text-xs font-semibold text-violet hover:text-white');
  footer.href = waLink(s.handoffMessage);
  footer.target = '_blank';
  footer.rel = 'noopener';
  footer.textContent = s.handoffCta;
  footer.append(el('span', 'sr-only', ` ${s.opensInNewTab}`));

  panel.append(header, log, chips, form, footer);
  document.body.append(panel);

  // ---- Rendering helpers -----------------------------------------------------------------------------------
  const scroll = () => (log.scrollTop = log.scrollHeight);

  const bubble = (role: ChatTurn['role'], text: string) => {
    const wrap = el('div', role === 'user' ? 'flex justify-end' : 'flex justify-start');
    const b = el(
      'p',
      role === 'user'
        ? 'max-w-[85%] rounded-2xl rounded-ee-sm bg-purple px-3.5 py-2 text-sm'
        : 'max-w-[85%] rounded-2xl rounded-es-sm bg-navy-700 px-3.5 py-2 text-sm text-white',
      text,
    );
    b.dir = 'auto';
    wrap.append(b);
    log.append(wrap);
    scroll();
    return b;
  };

  const handoffButton = () => {
    const a = el('a', 'mt-2 inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#0b1f12]', s.handoffCta);
    a.href = waLink(`${s.handoffMessage}${lastQuestion}`);
    a.target = '_blank';
    a.rel = 'noopener';
    a.append(el('span', 'sr-only', ` ${s.opensInNewTab}`));
    const wrap = el('div', 'flex justify-start');
    wrap.append(a);
    log.append(wrap);
    scroll();
  };

  const setChips = (ids: string[]) => {
    chips.replaceChildren(
      ...ids
        .map((id) => ({ id, q: faq.question(id) }))
        .filter((c): c is { id: string; q: string } => Boolean(c.q))
        .map(({ id, q }) => {
          const chip = el('button', 'rounded-pill border border-violet/40 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple/30', q);
          chip.type = 'button';
          chip.addEventListener('click', () => void ask(q, id));
          return chip;
        }),
    );
  };

  /** Three-dot typing indicator (static dots under reduced motion), shown briefly before each answer. */
  const typing = async () => {
    const wrap = el('div', 'flex justify-start');
    const dots = el('span', 'chat-typing inline-flex gap-1 rounded-2xl bg-navy-700 px-3.5 py-3');
    dots.setAttribute('role', 'status');
    dots.setAttribute('aria-label', s.typing);
    for (let i = 0; i < 3; i++) dots.append(el('span', 'size-1.5 rounded-full bg-violet'));
    wrap.append(dots);
    log.append(wrap);
    scroll();
    await new Promise((r) => setTimeout(r, reducedMotion() ? 200 : 550));
    wrap.remove();
  };

  const render = (reply: ChatReply) => {
    if (reply.text) {
      bubble('assistant', reply.text);
      history.push({ role: 'assistant', text: reply.text });
      if (reply.handoff) {
        bubble('assistant', s.confirmNote);
        handoffButton();
      }
      setChips(s.quickReplies.filter((id) => id !== reply.matchedId).slice(0, 4));
    } else if (reply.handoff) {
      bubble('assistant', s.handoff);
      handoffButton();
      setChips(s.quickReplies.slice(0, 4));
    } else {
      bubble('assistant', s.notSure);
      setChips(reply.suggestions?.length ? reply.suggestions : s.quickReplies.slice(0, 4));
    }
  };

  async function ask(text: string, faqId?: string) {
    const question = text.trim();
    if (!question) return;
    lastQuestion = question;
    bubble('user', question);
    history.push({ role: 'user', text: question });
    chips.replaceChildren();
    const reply = faqId ? faq.answer(faqId) : null;
    const [result] = await Promise.all([reply ? Promise.resolve(reply) : provider.reply(question, history, opts.locale), typing()]);
    render(result);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    void ask(value);
  });

  // ---- Open / close ----------------------------------------------------------------------------------------
  const close = () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };
  const open = () => {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
  };
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  bubble('assistant', s.greeting);
  setChips(s.quickReplies);

  return { open, close, toggle: () => (panel.hidden ? open() : close()) };
}
