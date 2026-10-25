# Brainscope Learning Center website: project history

This is the full record of how the website was built: the plan, every phase, the decisions you made, the problems
found and fixed, and what is still open. It covers October 12–25, 2026, from an empty repository to a site that is
finished and waiting to be published.

- **Repository:** `Phoenix-Falcon001/Brainscope-Academy`
- **Branches:** `main` (official; GitHub Pages publishes from it) and `claude/modest-sagan-wo6kbn` (the working
  branch). Both are identical as of `4ffeeb9`.
- **Status:** all 5 phases complete (Phase 0 to Phase 4). One manual GitHub setting is needed to publish (see §9).

---

## 1. The starting brief

You provided a two-part package:

1. **`CLAUDE.md`**: the project rules, saved at the repository root and read at the start of every working session.
   - Stack: Astro 5, TypeScript, Tailwind CSS v4, GSAP, a `<canvas>` hero, Astro i18n for `/en /fr /ar`, GitHub Pages, pnpm, self-hosted fonts.
   - Brand: colours, logo rules, Montserrat for Latin text and IBM Plex Sans Arabic.
   - Contact data in one file (WhatsApp / phone +961 81 171 031, Instagram @brainscopecenter).
   - Content rules: all text in the language files, no fake testimonials or statistics, pricing hidden.
   - RTL and animation rules.
   - Quality targets: Lighthouse mobile Performance ≥ 90, Accessibility / SEO / Best Practices ≥ 95; under 150 KB of JavaScript.
   - Conversion rules: floating WhatsApp button, "Book a free trial" button, a form that goes to WhatsApp.
   - The chatbot plan.
   - Workflow: work in phases and stop after each one for your approval.
2. **Five phase prompts** (Phase 0 to Phase 4), run one at a time, plus a list of ideas for after launch.

Business context in the brief: Brainscope Learning Center ("Academy of Advanced AI & Robotics"), on the Main Road
(Tripoli–Zgharta highway) in Zgharta, Lebanon. Tagline **Think • Create • Lead**. Founders **Bassam Eter**
(engineering, robotics, curriculum, operations) and **Marie Deeb** (communications, young learners). The main
audience is parents, then school students, university students and institutions.

---

## 2. Timeline at a glance

| Date | Commit | Step |
| --- | --- | --- |
| Oct 12 | `6e57c81` | **Phase 0**: foundation |
| Oct 14 | `ba7c7fb` | **Phase 1**: animated hero and motion system |
| Oct 14 | `124ca83` | Official logo added across the site |
| Oct 14 | `72f2abd` | Wider "What we offer" strip; banner-style "A" in the wordmark |
| Oct 14 | `240387b` | Your decisions recorded in `CLAUDE.md` |
| Oct 14 | `d1a8bcc` | **Phase 2**: all home-page sections in three languages |
| Oct 25 | `c51c1f7` | **Phase 3**: trial form, chatbot, SEO, analytics, Workshops and Collaborations |
| Oct 25 | `b09a228` | **Phase 4**: QA fixes, README, content checklist, QA report |
| Oct 25 | — | `main` branch created on GitHub from the finished work |
| Oct 25 | `4ffeeb9` | Deploy workflow updated to Node 24 (removed GitHub's deprecation warning) |

---

## 3. Phase 0: foundation (Oct 12)

**Built**
- Astro 5 + strict TypeScript + Tailwind v4 project (pnpm).
- Language routing: `/en/`, `/fr/`, `/ar/`. The root address sends visitors to their saved or browser language
  (English by default), and also works without JavaScript.
- Design system: brand colours, a fluid type scale, rounded corners, glow shadows, and the circuit-board background
  pattern.
- Self-hosted Montserrat and IBM Plex Sans Arabic, with size-matched fallback fonts so the page doesn't jump while
  fonts load.
- Page shell:
  - search-engine tags, language alternates, link-preview tags and business data for Google;
  - a sticky header with a language switcher that remembers your choice;
  - a mobile menu, a footer, the floating WhatsApp button and a "skip to content" link.
- `src/data/site.ts`: the single home for contact details and on/off switches (`SHOW_PRICING`, etc.).
- GitHub Actions workflow that publishes to GitHub Pages.

**Logo:** the brand PDFs were not in the repository yet, so a placeholder mark was used temporarily.

**Fixed:** the Arabic and French menus didn't fit on one line at desktop width. The full desktop menu now appears
from 1280 px, and the French button became "Essai gratuit".

---

## 4. Phase 1: hero and motion system (Oct 14)

**Built**
- **Animation toolkit** (`src/lib/motion.ts`): GSAP set up once and shared, with ready-made effects (fade-up,
  line-by-line headings, staggered cards, counters, buttons that follow the cursor, tilting cards).
  - Effects mirror in Arabic and tone down for visitors who turn off motion.
  - Everything is cleaned up when leaving the page.
- **Neural-network animation** (`src/lib/neural-canvas.ts`):
  - glowing nodes drift, link up and are drawn toward the cursor or finger;
  - at most 60 nodes on phones and 140 on desktop, with the sharpness capped for speed;
  - pauses when off-screen or in a hidden tab, and shows one still frame when motion is turned off.
- **Hero:**
  - "Think • Create • Lead" rises in word by word;
  - the line below cycles Robotics → AI → Programming → Academic Excellence → Leadership once, then stops;
  - two buttons, "Book a free trial" and "Chat on WhatsApp", plus a scroll cue.
- **First-visit intro animation** (≤ 1.2 s, pure CSS), skipped on return visits.
- **"What we offer" strip** under the hero (no invented statistics; counters ready for real numbers).

**Your logo files.** You uploaded three images: the logo on white, the logo with a transparent background, and the
dark banner. With them:
- the emblem (head + ring) was cut out automatically for the header, hero, intro animation, favicons and the link-preview image;
- on dark backgrounds the site uses the emblem with a white wordmark, as on your banner;
- the hero animation now flows into the emblem's purple brain;
- `CLAUDE.md` was corrected: the logo is a front-facing head, not a profile.

**Your answers in this phase**
1. Vector logo: *"not sure"*. The site works with the image version; a vector file only matters for print.
2. **The offer is wider than the original brief**: university services (AI, mechatronics, law, journalism,
   marketing, leadership…), plus AI, Agenda coaching, Robotics, and **Chess coming soon**. The strip was rebuilt
   around this.
3. **The "A" in BRAINSCOPE must match the banner exactly**: now drawn with no crossbar and a purple triangle,
   everywhere.
4. University support uses **"Ask on WhatsApp"** instead of "Book a free trial".
5. The hero's rotating words **stay as they are**.
6. Chess stays **"Coming soon"** with no date.

---

## 5. Phase 2: page sections (Oct 14)

**Sections built, in all three languages** (French and Arabic were written as natural translations; Arabic is
marked for native review):
1. **About / Why Brainscope**: positioning plus 4 values; a circuit line draws itself as you scroll.
2. **Programs**: 4 cards (Academic Support, Future Skills, University Support, Development) that tilt and glow.
3. **Future Skills tracks**: Robo Kids, Falcon Track (with rank insignia), AI & Python.
   - On desktop the cards slide sideways as you scroll: leftward in English and French, rightward in Arabic.
   - On phones the cards are stacked.
4. **Academic Support**: 6 subjects, agenda coaching, and the weekly parent review shown in 3 steps.
5. **University Support**: field cards, each with "Ask on WhatsApp".
6. **Student pathway**: Discover → Learn → Build → Demo Day → Lead.
7. **Founders**: placeholder portraits. The military background line stays hidden behind a switch.
8. **Pricing**: built but hidden; a "pilot-program details on WhatsApp" card shows instead.
9. **Testimonials**: built; only appears once real quotes exist.
10. **FAQ**: open/close questions, sharing their content with the chatbot.
11. **Location and contact**: the Google map loads only when tapped; opening hours are a placeholder.

**Speed work:** the Arabic page first scored 73 on mobile. Preloading the headline font, using fewer Arabic font
weights, and limiting the intro animation to desktop raised it to the 85–97 range.

**Fixed:** a long button overflowed on phones; the sideways card row was cut off at the bottom of the screen.

---

## 6. Phase 3: conversion, chatbot, SEO, and your two new sections (Oct 25)

**Your requests for this phase:** add a **Collaborations section** (academies and institutions you work with) and
a **Workshops section** (leadership, journalism, communication, public speaking, and more).

**Built**
- **Workshops**: six cards (Leadership, Public speaking, Communication, Journalism & media, Robotics & AI, Study
  skills), each with an "Ask about this workshop" WhatsApp link, plus "Request a custom workshop" for schools.
- **Collaborations**: four ways to work with Brainscope and a "Become a partner" button.
  - The partner logo grid is ready but hidden until real partners are added in `src/data/partners.ts`.
- **Free-trial form**: name, age, program, contact method, preferred time and an optional message.
  - Errors show next to each field and in a summary at the top.
  - Ages typed in Arabic digits (١٢) are accepted.
  - Sending opens WhatsApp with a ready-made message in the visitor's language. Call and Instagram are offered too.
  - Every "Book a free trial" button on the site now leads to this form.
- **Chatbot v1**: a small button above the WhatsApp button; the chat itself downloads only when opened.
  - Answers from 22 FAQ entries per language, tolerating typos, missing accents and Lebanese phrasing.
  - Never invents prices or schedules.
  - Hands over to the team on WhatsApp after two unanswered questions, or for unconfirmed answers.
- **Chatbot v2 (prepared, not live)**: `/worker`, a small Cloudflare server that would let Claude answer using only
  your FAQ. It is locked to your website, has per-visitor rate limits and spending caps, and keeps the API key on
  the server. Deployment steps are in `worker/README.md`.
- **SEO**: a sitemap listing all three languages, a robots.txt file, structured data for Google, a link-preview
  image per language, and a 404 page in all three languages.
- **Analytics**: ready for Plausible, Google Analytics or the Meta Pixel; nothing loads until you add an ID in `site.ts`.

**Speed work:** headings now split for animation only when scrolled to, the hero animation runs at 30 fps on
phones, and the Arabic fonts were reduced to 2 files. Arabic Latin words (Robo Kids, Python) use Montserrat.

---

## 7. Phase 4: QA and launch (Oct 25)

**Audit results** (full details in `docs/QA_REPORT.md`)

| Page | Mobile (Performance / Accessibility / Best Practices / SEO) | Desktop |
| --- | --- | --- |
| English | 96 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| French | 96 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| Arabic | 94 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |

- **Accessibility scan (axe):** 0 problems in all languages and states.
- **Keyboard:** every section reachable in order (100 stops), with a visible focus outline everywhere.
- **Reduced motion and no JavaScript:** both work; all content stays readable.
- **Slow 3G with a slowed-down phone CPU:** headline readable after 0.7 s.
- **Arabic layout:** checked at mobile, tablet and desktop widths.
- **JavaScript:** about 54 KB on first load (limit 150 KB).

**Fixed during the audit**
- **Keyboard gap (serious):** content waiting to fade in couldn't receive keyboard focus, so Tab skipped most
  sections. Fixed, and focusing a sideways card now scrolls it into view.
- **Screen-reader names:** the logo and language links had names that didn't match their visible text.
- **Small fixes:** error links too small to tap, button hover contrast, chat history not keyboard-scrollable.
- **Arabic speed:** on phones the headline now appears at once (Arabic mobile went from 84 to 94).

**Documents:**
- `README.md`: how to edit text, add photos, switch sections, run locally, and deploy with your domain (DNS records included).
- `TODO_CONTENT.md`: a generated list of every placeholder still waiting for real content.
- `docs/QA_REPORT.md`: the full audit.

---

## 8. After Phase 4: verification and going live (Oct 25)

- **Your check:** you asked whether Phases 3 and 4 were really finished. Re-verified: no unsaved work, my copy
  identical to GitHub, every deliverable present, build clean.
- **`main` didn't exist:** the repository had only the working branch, so nothing had ever been published. With your
  approval, `main` was created from the finished work, which started the first publish run.
- **The publish run failed** at "Get Pages site … Not Found": GitHub Pages isn't switched on in the repository
  settings. Only the owner can change that.
- **GitHub's "Node.js 20 is deprecated" warning** was removed by updating the workflow to current Node 24 versions
  (`4ffeeb9`). Re-checked: the warning is gone, and the Pages setting is the only remaining blocker.
- **The `v1.0.0` tag** couldn't be pushed from this environment (tag pushes are blocked); it should be created as a
  GitHub Release.

---

## 9. How to publish (your steps)

1. GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Actions** tab → latest "Deploy to GitHub Pages" run → **Re-run all jobs**.
   The site goes live at **https://phoenix-falcon001.github.io/Brainscope-Academy/**.
3. **Releases → Draft a new release** → tag `v1.0.0` on `main` → Publish.
4. Custom domain: put it in `public/CNAME`, add the DNS records listed in `README.md`, then tick **Enforce HTTPS**.
5. Check the live site with PageSpeed Insights, and submit `sitemap.xml` in Google Search Console.

---

## 10. Still open (content and decisions)

Run `pnpm todo` for the exact, up-to-date list (`TODO_CONTENT.md`).

**Content to provide**
- Domain name, opening hours, exact Google Maps pin, email, Facebook and TikTok links (if any).
- Answers to 6 unconfirmed FAQ questions: teaching language, safety and supervision, group size, session length,
  certificates, what to bring.
- Real names for the Robo Kids badges and Falcon Track ranks, and confirmation of the example projects.
- Partner academies and institutions (names, logos, permission to list them).
- Real photos (center, founders), real testimonials, confirmed statistics, prices (when ready).
- A native Arabic speaker's review (Arabic text is marked `NEEDS_NATIVE_REVIEW`).

**Decisions waiting for you**
- Intro animation on desktop only? (done this way for mobile speed)
- Arabic "medium/semibold" text shows as regular/bold to save download size. OK?
- Arabic age ranges display as "12–8" in right-to-left text; a native speaker should say whether «من 8 إلى 12» reads better.
- Smarter chatbot (v2): whether to switch it on, which model (Opus 5.5 by default; Haiku 5.5 is about 40× cheaper),
  and approval for its packages, which install only inside `/worker`.
- Military background line for the founders: wording, and whether to show it at all (`SHOW_MILITARY_AFFILIATION`).
- Header menu: University Support is reached through Programs (the menu is full). Swap it in for another item?
- Vector logo (SVG/PDF), if the designer has one.

---

## 11. Ideas for after launch (from the original brief)

- Photo and video hero once the space is photographed
- Class schedule and seat-availability widget (Google Sheets or Airtable)
- Demo Day gallery and student project showcase
- Blog / news for SEO (Arabic and French parent search terms)
- Parent portal and certificate verification page
- Chatbot v2 live with the Claude API (already prepared in `/worker`)

---

## 12. Where things are

| You want to… | Go to |
| --- | --- |
| Change any text | `src/i18n/en.ts`, `fr.ts`, `ar.ts` |
| Change FAQ / chatbot answers | `src/data/faq.en.json`, `faq.fr.json`, `faq.ar.json` |
| Change contact details, hours, switches | `src/data/site.ts` |
| Add partners / stats / testimonials | `src/data/partners.ts`, `stats.ts`, `testimonials.ts` |
| Add photos | `src/assets/photos/` (see README) |
| Replace the logo | `brand-source/` then `pnpm brand` |
| See what content is missing | `TODO_CONTENT.md` (`pnpm todo`) |
| Read the audit | `docs/QA_REPORT.md` |
| Project rules | `CLAUDE.md` |
| Run / deploy instructions | `README.md` |
