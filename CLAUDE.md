# Brainscope Learning Center: Website

## What this is
Marketing and enrollment website for **Brainscope Learning Center** (also "Academy of Advanced AI & Robotics"), a physical learning center on the Main Road (Tripoli–Zgharta highway), Zgharta, Lebanon. Tagline: **Think • Create • Lead**.
Founders: Bassam Eter (engineering, robotics, curriculum, operations) and Marie Deeb (communications, young learners).
Goal: convert parents (primary), then school students, then university students, then institutions into WhatsApp / phone enquiries and trial-session bookings.

## Stack (do not change without asking)
- Astro 5 (static output) + TypeScript (strict)
- Tailwind CSS v4
- GSAP + ScrollTrigger (animation). No Framer Motion, no Three.js.
- Vanilla `<canvas>` for the hero neural-network animation
- Astro built-in i18n routing: /en, /fr, /ar (root redirects by browser language, default en)
- Deploy: GitHub Pages via GitHub Actions. Custom domain via `public/CNAME`.
- Package manager: pnpm. Fonts self-hosted via @fontsource (no Google Fonts CDN).

## Brand (source of truth: /brand-source/Visual_Identity_Brainscope.pdf)
Colors (define as CSS variables / Tailwind theme tokens):
- Deep Navy #081D3A (primary background)
- Royal Purple #6A2CFF (primary accent)
- White #FFFFFF, Graphite Gray #1F1F1F (neutrals)
- Electric Blue #00B8FF, Violet #A166FF, Magenta #FF4D9D (accents; use sparingly for highlights and glows)
Logo: front-facing human head inside a navy-to-purple ring with an infinity loop: half mechanical gears, half glowing purple brain with blue circuit lines and an atom, with "BRAINSCOPE / LEARNING CENTER" wordmark. Masters in /brand-source (logo-transparent.webp is the source for `pnpm brand`). On dark backgrounds use the emblem + white wordmark, as on banner-dark.webp. Never stretch, recolor, or add effects to the logo itself. Keep clear space = height of the "B".
Brand pattern: dark navy with thin circuit-board lines. Reuse as section backgrounds.
Typography: brand font is Gotham (licensed). Web substitute: **Montserrat** (headings 700/600, body 400/500). Arabic: **IBM Plex Sans Arabic** (or Tajawal). Fallback stacks required.
Mood: futuristic, elite, disciplined, precise. Not childish, even in kids sections (kids sections can be warmer via accent colors only).

## Contact data (single source: src/data/site.ts)
- WhatsApp: +961 81 171 031 (wa.me/96181171031)
- Phone (call): +961 81 171 031
- Instagram: @brainscopecenter
- Email, Facebook, TikTok, Google Maps link: placeholders marked `TODO_CONFIRM`
Never hardcode contact data anywhere else.

## Content rules
- ALL user-facing text lives in `src/i18n/{en,fr,ar}.ts` (or content collections). No hardcoded strings in components.
- Write EN first, then natural (not literal) FR and Modern Standard Arabic. Mark Arabic as `// NEEDS_NATIVE_REVIEW`.
- Programs: Academic Support (math, physics, chemistry, biology, French, English, agenda/homework coaching with weekly parent reviews); Future Skills (Robo Kids ages 8–12 with mBot2 + Scratch; Falcon Track ages 11–15 with mBot2 + Python and a rank-progression system; AI & Python for university level); Development (communication and leadership); University Support (tutoring and project support in mechatronics: mechanical, electrical, electronics, computer science; plus law, journalism, marketing and more); Chess (coming soon, shown with a "Coming soon" badge until launched). Agenda coaching is a headline service.
- University Support CTA is "Ask on WhatsApp" (pre-filled message naming the field), not "Book a free trial". Chess stays "Coming soon" (no launch date). Hero rotator words stay: Robotics / AI / Programming / Academic Excellence / Leadership.
- Pricing is hidden by default. Controlled by `SHOW_PRICING=false` in site.ts. Build the section anyway.
- No fake testimonials, no fake statistics, no stock-photo claims. Use clearly marked placeholders (`PLACEHOLDER`) that are easy to grep.
- No real photos exist yet. Use CSS/SVG/canvas visuals, brand-pattern backgrounds, and `<Placeholder />` components that can be swapped for photos later (Astro `<Image>` slots in /src/assets/photos/).

## RTL / i18n rules
- `<html lang dir>` set per locale. Use logical CSS properties (margin-inline-start, ps-*, text-start) everywhere. No left/right hardcoding.
- Animations must mirror in RTL (slide-in direction, horizontal scroll direction, arrows).
- Language switcher in header, persists choice (localStorage with try/catch).
- hreflang + canonical per page.

## Animation rules
- GSAP + ScrollTrigger only. Register once in a shared module. Kill and revert on route/locale change.
- Respect `prefers-reduced-motion`: no parallax, no canvas motion (static frame), reveals become simple fades or none.
- Animate only transform and opacity. No layout-thrashing properties.
- Hero canvas: cap particles by device (mobile ≤ 60, desktop ≤ 140), pause when off-screen (IntersectionObserver) and when tab hidden, devicePixelRatio capped at 2.
- Every animation must have a purpose (guide attention, show structure). No gratuitous motion.

## Performance and quality gates
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95.
- Total JS on first load < 150 KB gzipped (excluding chatbot, which lazy-loads on first open).
- Images: AVIF/WebP via Astro, explicit width/height, lazy-load below the fold.
- Must work acceptably on slow 3G / mid-range Android (Lebanon connectivity reality). Core content readable before JS runs.
- WCAG AA contrast, visible focus states, keyboard-navigable menu and chatbot, aria-labels on icon buttons.

## Conversion rules
- Floating WhatsApp button on every page (bottom inline-end, mirrors in RTL), pre-filled message in the active language.
- Header CTA: "Book a free trial". Every section ends with a clear next action.
- Enrollment / trial form has NO backend: it validates client-side and opens WhatsApp with a pre-filled, language-aware message (child age, program, parent name, preferred time). Also offers "Call now" and "Instagram" alternatives.

## Chatbot
- Floating assistant for parents and FAQs, trilingual, lazy-loaded.
- v1 (static-safe): rule/keyword FAQ matcher over `src/data/faq.{en,fr,ar}.json`, quick-reply chips, always offers WhatsApp handoff when unsure.
- v2 (optional): same UI calls a Cloudflare Worker proxy to the Claude API. NEVER put an API key in client code or the repo. Implement through a `ChatProvider` interface so the swap needs no UI changes.
- The bot must never invent prices, schedules, or policies. If unknown: say so and hand off to WhatsApp.

## Workflow rules
- Work in phases. After each phase: run `pnpm build`, `pnpm astro check`, summarize what changed, list anything needing my decision. Do not start the next phase until I say so.
- Commit after each phase with a clear message.
- Ask before adding any dependency not listed above.
- Keep components small, typed, and documented with a one-line comment on purpose.

## Commands
- `pnpm dev`: local server
- `pnpm build`: production build
- `pnpm astro check`: type check
- `pnpm preview`: serve the build
