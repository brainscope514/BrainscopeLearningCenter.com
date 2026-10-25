# QA report: v1.0.0

Audit of the production build (`pnpm build`) served locally, 2026-10-25. Tools: Lighthouse 12, axe-core 4,
Playwright + Chromium. Real-world numbers should be re-checked with PageSpeed Insights after deployment
(local Lighthouse scores vary ±5–10 points between identical runs on shared CPUs).

## Lighthouse (Performance / Accessibility / Best Practices / SEO)

| Page | Mobile | Desktop |
| --- | --- | --- |
| /en/ | 96 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /fr/ | 96 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| /ar/ | 94 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |

Gates (mobile Perf ≥ 90, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95): **met on all three locales.**
Mobile LCP ≈ 1.8–2.6 s, TBT ≈ 120–200 ms, CLS ≤ 0.012. JavaScript on first load ≈ 54 KB gzipped (gate: 150 KB);
the chatbot (≈ 4 KB + 2–3 KB FAQ data) loads only when opened.

## Accessibility

- **axe-core (WCAG 2.0/2.1/2.2 A + AA + best practices): 0 violations** on EN/FR/AR, desktop and mobile, in every
  state tested: page scrolled, form with errors, chatbot open, mobile menu open, 404.
- **Keyboard-only walkthrough:** skip link first, focuses `<main>`; every section reachable in order
  (100 tab stops desktop EN, 89 mobile AR); every focused element has a visible focus ring and is visible
  (pending scroll reveals finish instantly on focus; focusing a card in the horizontal Future Skills row scrolls it
  into view). Mobile menu and chatbot: focus moves in, Escape closes and returns focus.
- Contrast: all text and button states ≥ 4.5:1 (hover purple darkened to #7B44FF for this).
- Fixed during the audit: content hidden by scroll reveals was not keyboard-focusable; logo and language-switcher
  link names did not contain their visible text; error-summary links below 24 px; chat log not keyboard-scrollable.

## Reduced motion (`prefers-reduced-motion: reduce`)

No preloader, no smooth scrolling, hero canvas renders one static frame, headline uses a short fade, no pinned
horizontal scroll (tracks stack vertically), reveals become plain fades, scroll-cue animation off.

## Without JavaScript

All 15 sections and their text are readable; FAQ answers are expanded; the hero headline is visible; the trial
form shows a "message us on WhatsApp" fallback; header CTA, WhatsApp button and every link work.

## Slow 3G (500 kbps, 400 ms RTT) + 4× CPU slowdown, 390 px phone

| | EN | AR |
| --- | --- | --- |
| Headline readable | 0.7 s | 0.7 s |
| First contentful paint | 2.0 s | 2.5 s |
| Web fonts swapped in | 4.1 s | 6.3 s |
| Scripts interactive / canvas starts | 4.6 s | 6.4 s |

Content is readable before fonts and scripts arrive (system-font fallbacks are size-matched, so no layout jump);
animations start only once the page is idle. Phones skip the preloader, render the hero canvas at ~30 fps and
1.5× pixel density, and show the headline without the word-by-word reveal.

## RTL

`/ar/` checked at 375, 768 and 1440 px: layout, header, drawer (opens from the left), floating buttons (bottom
left), arrows, timeline and horizontal scroll (moves right) all mirror; no horizontal overflow at any width.

## Cross-browser notes

Automated tests ran in Chromium only (the only engine available in the build environment). From a code review of
the features used:

| Browser | Status | Notes |
| --- | --- | --- |
| **Chrome Android** (current) | Tested (Chromium, mobile emulation) | Primary target. |
| **Safari iOS 16.4+ / macOS Safari** | Expected to work | All features supported: `<dialog>`, `dvh/svh`, `:has()`, logical properties, `color-mix`, WebP. `requestIdleCallback` is missing in Safari, so a `setTimeout` fallback is used. WhatsApp links open the app via `wa.me`; if the form's `window.open` is blocked, the success screen shows an "Open WhatsApp" button. **Please test on a real iPhone before launch.** |
| **Safari iOS 15.4–16.3** | Works with minor visual differences | Tailwind v4 targets Safari 16.4+; older versions get fallbacks, so some translucent tints/glows may look flatter. Layout, text and buttons work. |
| **iOS < 15.4** | Degraded | `<dialog>` (mobile menu) unsupported: the footer navigation remains available. Rare in practice. |
| **Firefox 128+** | Expected to work | No known issues; `text-wrap: balance` and `size-adjust` fall back gracefully on older versions. |
| **Samsung Internet** (Chromium-based) | Expected to work | Same engine as Chrome. |

Known limitations: the Google map loads only on request (privacy/bandwidth); share-preview images are cached by
WhatsApp/Facebook, so after changes use the Facebook Sharing Debugger to refresh.
