// Shared motion system: GSAP + ScrollTrigger registered once, reduced-motion / RTL helpers,
// reusable reveal utilities, declarative [data-*] wiring and cleanup on navigation.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;
/** Registers plugins exactly once (safe to call from every component script). */
export function registerMotion(): typeof gsap {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: 'power3.out', duration: 0.8 });
    registered = true;
  }
  return gsap;
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True on devices with a precise hovering pointer (mouse / trackpad); gates magnetic + tilt. */
export const hasFinePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isRTL = (): boolean => document.documentElement.dir === 'rtl';

/** Mirrors a horizontal distance for RTL: dirX(40) = 40 in LTR, -40 in RTL. */
export const dirX = (value: number): number => (isRTL() ? -value : value);

type Targets = gsap.TweenTarget;
interface RevealOptions {
  delay?: number;
  y?: number;
  /** ScrollTrigger start; pass `false` to play immediately (above-the-fold content). */
  start?: string | false;
}

const trigger = (el: Element, start: string | false) =>
  start === false ? undefined : { trigger: el, start, once: true };

/** Fade + rise into view. Reduced motion: plain short fade. */
export function fadeUp(targets: Targets, { delay = 0, y = 32, start = 'top 85%' }: RevealOptions = {}) {
  const el = gsap.utils.toArray<Element>(targets)[0];
  if (!el) return;
  const reduced = prefersReducedMotion();
  return gsap.from(targets, {
    // opacity only (not autoAlpha/visibility): hidden-until-revealed content must stay keyboard-focusable.
    opacity: 0,
    y: reduced ? 0 : y,
    duration: reduced ? 0.4 : 0.9,
    delay,
    scrollTrigger: trigger(el, start),
  });
}

/** Splits a heading into masked lines that slide up in sequence. Never splits chars (keeps Arabic shaping intact).
 * The split happens lazily, when the heading first enters the viewport, so page load doesn't pay for every heading. */
export function lineReveal(el: HTMLElement, { delay = 0, start = 'top 85%' }: RevealOptions = {}) {
  if (prefersReducedMotion()) return fadeUp(el, { delay, start, y: 0 });
  const run = () =>
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      aria: 'auto',
      onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: 0.09, delay }),
    });
  if (start === false) return run();
  return ScrollTrigger.create({
    trigger: el,
    start: 'top bottom-=40',
    once: true,
    // ctx.add keeps the lazily created split inside the page context, so destroyMotion() still reverts it.
    onEnter: () => (ctx ? ctx.add(run) : run()),
  });
}

/** Reveals direct children one after another (cards, list items). Slides from the inline-start side. */
export function staggerChildren(container: Element, { delay = 0, start = 'top 85%' }: RevealOptions = {}) {
  const children = Array.from(container.children);
  if (!children.length) return;
  const reduced = prefersReducedMotion();
  return gsap.from(children, {
    // opacity only (not autoAlpha/visibility): hidden-until-revealed content must stay keyboard-focusable.
    opacity: 0,
    x: reduced ? 0 : dirX(-24),
    y: reduced ? 0 : 16,
    duration: reduced ? 0.4 : 0.7,
    stagger: reduced ? 0.04 : 0.08,
    delay,
    scrollTrigger: trigger(container, start),
  });
}

/** Counts a number up to `data-counter` when it scrolls into view, formatted for the page locale. */
export function counter(el: HTMLElement) {
  const to = Number(el.dataset.counter);
  if (!Number.isFinite(to)) return;
  const format = new Intl.NumberFormat(document.documentElement.lang || 'en');
  const suffix = el.dataset.counterSuffix ?? '';
  const render = (v: number) => (el.textContent = `${format.format(Math.round(v))}${suffix}`);
  if (prefersReducedMotion()) return void render(to);
  const state = { v: 0 };
  render(0);
  return gsap.to(state, {
    v: to,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate: () => render(state.v),
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  });
}

/** Button gently follows the pointer while hovered. Desktop pointers only, off under reduced motion. */
export function magnetic(el: HTMLElement, strength = 0.3) {
  if (prefersReducedMotion() || !hasFinePointer()) return;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => (xTo(0), yTo(0));
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
  };
}

/** 3D tilt toward the pointer for cards. Desktop pointers only, off under reduced motion. */
export function tilt(el: HTMLElement, maxDeg = 7) {
  if (prefersReducedMotion() || !hasFinePointer()) return;
  gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
  const rxTo = gsap.quickTo(el, 'rotationX', { duration: 0.6 });
  const ryTo = gsap.quickTo(el, 'rotationY', { duration: 0.6 });
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ryTo(px * maxDeg * 2);
    rxTo(-py * maxDeg * 2);
  };
  const leave = () => (rxTo(0), ryTo(0));
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
  };
}

let ctx: gsap.Context | null = null;
const listenerCleanups: Array<() => void> = [];

/**
 * Wires every declarative hook under `root` and returns a cleanup function:
 * [data-reveal="fade-up|lines|stagger"], [data-counter], [data-magnetic], [data-tilt].
 * Optional [data-reveal-delay] (seconds). Safe to call once per page.
 */
export function initMotion(root: ParentNode = document): () => void {
  registerMotion();
  destroyMotion();
  ctx = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const delay = Number(el.dataset.revealDelay ?? 0);
      const kind = el.dataset.reveal;
      if (kind === 'lines') lineReveal(el, { delay });
      else if (kind === 'stagger') staggerChildren(el, { delay });
      else fadeUp(el, { delay });
    });
    root.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => counter(el));
  });
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const off = magnetic(el, Number(el.dataset.magnetic) || undefined);
    if (off) listenerCleanups.push(off);
  });
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const off = tilt(el, Number(el.dataset.tilt) || undefined);
    if (off) listenerCleanups.push(off);
  });
  // Keyboard focus must never land on content that is still fading in: finish any pending reveal around it.
  const revealOnFocus = (event: FocusEvent) => {
    for (let node = event.target as Element | null; node && node !== document.body; node = node.parentElement) {
      gsap.getTweensOf(node).forEach((tween) => {
        if (tween.progress() < 1) {
          tween.scrollTrigger?.disable(false);
          tween.progress(1);
        }
      });
    }
  };
  document.addEventListener('focusin', revealOnFocus);
  listenerCleanups.push(() => document.removeEventListener('focusin', revealOnFocus));
  return destroyMotion;
}

/** Kills and reverts every tween, ScrollTrigger, SplitText and listener created by initMotion. */
export function destroyMotion(): void {
  ctx?.revert();
  ctx = null;
  listenerCleanups.splice(0).forEach((off) => off());
}

// Clean up when leaving the page (full navigation, bfcache) or on Astro view-transition swaps.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh());
  window.addEventListener('pagehide', destroyMotion);
  document.addEventListener('astro:before-swap', destroyMotion);
}

export { gsap, ScrollTrigger, SplitText };
