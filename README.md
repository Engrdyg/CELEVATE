# CELEVATE

**Elevate Your Knowledge. Earn Your License.**

CELEVATE is a review platform for the Philippine **Civil Engineering Licensure Examination (CELE)**. It brings together structured lessons, practice problems with step-by-step solutions, timed mock board exams, progress analytics, a formula library and an AI study assistant.

> CELEVATE is an independent project. It is not affiliated with, or endorsed by, the Professional Regulation Commission (PRC) or the Board of Civil Engineering.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Cache Components / Partial Prerendering) with **React 19** and **TypeScript**
- **Tailwind CSS v4** with semantic design tokens (`app/globals.css`)
- **Radix UI** primitives (dialogs, menus, tabs, tooltips, selects) and **cmdk** for the command menu
- **Motion** (`motion/react`) for scroll-linked parallax and micro-interactions
- **Recharts** for charts and **KaTeX** for math typesetting
- **Zustand** for local state, persisted to `localStorage`
- **@anthropic-ai/sdk** for the optional live AI tutor

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

### Optional: live AI tutor

CELEVATE AI streams answers from Claude through `app/api/tutor/route.ts` when the server has an API key:

```bash
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
```

Without a key, the tutor runs in a **demo mode**. It plays scripted, pre-verified answers to the suggested questions, and every message is labelled "Demo response". The UI depends only on the `TutorProvider` interface in `lib/tutor/providers.ts`, so another backend can be plugged in.

## Data and honesty

- **No backend or accounts.** Progress (lessons, attempts, exams, bookmarks, notes, study time) is stored in the browser's `localStorage`. Settings → *Your data* lets you export, import or reset it.
- **No fabricated statistics.** Every dashboard and analytics view is computed from the learner's own activity. Visitors can load clearly labelled **sample data** to preview the dashboards. While it is active, a persistent banner says so, and it can be cleared at any time.
- **The readiness score is an internal learning estimate.** It is labelled everywhere as not being a prediction of PRC results.
- **Content is original.** It includes no real board questions, pass rates, endorsements or testimonials. Lessons that aren't written yet are listed as "In preparation" and can't be opened.

## Project structure

```
app/
  page.tsx                  Landing page
  onboarding/               First-run setup
  (app)/                    App shell routes: dashboard, review, subjects, practice,
                            exams, tutor, formulas, progress, achievements, settings
  (focus)/exams/take/       Distraction-free exam room (no app shell)
  api/tutor/                Streaming Claude endpoint (optional)
components/
  ui/                       Design-system primitives (button, card, dialog, tabs, ...)
  shell/                    Sidebar, top bar, mobile nav, command menu, notifications
  marketing/                Landing page sections and parallax hero
  learn/ practice/ exam/    Learning, practice and examination experiences
  charts/ figures/ math/    Charts, engineering diagrams (SVG), KaTeX rendering
config/cele.ts              Configurable subject labels, codes and weights
lib/
  content/                  Typed lessons, questions and formulas per subject
  store/                    Persisted stores (progress, prefs, tutor) and UI state
  analytics.ts              Mastery, readiness, streaks, trends and recommendations
```

### Content model

Content lives in `lib/content/<subject>/` as typed TypeScript (`lib/content/types.ts`). Rich text supports inline `$math$` and `**bold**`. Lessons are built from blocks: headings, paragraphs, display math, callouts, tables, worked examples, figures, and inline self-checks. Subject names and weights are set in `config/cele.ts`, so they can be aligned with the current PRC syllabus.

## Design system

- **Themes:** Light, Dark and System. The choice is applied before first paint by an inline script, so the wrong theme never flashes. Transitions between themes are smooth.
- **Tokens:** semantic color roles, elevation, radii, motion easings, and a fluid type scale using Space Grotesk, Inter and JetBrains Mono.
- **Motion:** uses transforms and opacity only. The parallax scales back on small screens, is turned off on low-power devices and data-saver connections, and is fully disabled for `prefers-reduced-motion` or the in-app *Reduce motion* setting.
- **Accessibility:** a skip link, visible focus rings, native radio groups for answer choices, keyboard shortcuts (1–4, Enter, ←/→, F, ⌘K), a table view for every chart, and labelled status and live regions.
