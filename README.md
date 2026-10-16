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
npm test             # vitest: engine, tokens, bank integrity, workflow, sessions, stores (PGlite)
```

Copy `.env.example` to `.env.local` for server settings (signing secret, staff accounts, optional database, optional AI key).

### Optional: live AI tutor

CELEVATE AI streams answers from Claude through `app/api/tutor/route.ts` when the server has an API key:

```bash
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
```

Without a key, the tutor runs in a **demo mode**. It plays scripted, pre-verified answers to the suggested questions, and every message is labelled "Demo response". The UI depends only on the `TutorProvider` interface in `lib/tutor/providers.ts`, so another backend can be plugged in.

## Question bank

The CELE question bank, mock board examinations and the authoring workflow are described in detail in [`spec.md`](spec.md). In short:

- **Source of truth:** `data/question-bank/*.json` (one file per CELE subject), validated against `lib/qbank/schema.ts` (also exported as `data/question-bank/schema/question.schema.json`). With `DATABASE_URL` set, the same records live in PostgreSQL/Supabase (`supabase/migrations`).
- **Verification:** every computational question has an independent Python check in `data/question-bank/verify/<subject>.py` that recomputes the answer from the givens. Nothing publishes unless that check passes and the schema, taxonomy, KaTeX and duplicate checks are clean. Human licensed-engineer (SME) review is tracked separately and is never set automatically.
- **Answer security:** learners receive answer-free questions with per-attempt shuffled choices and a signed session token. Grading, solutions and AI context are released by the server only when the rules allow (instant feedback in practice; after submission in mock exams).
- **Admin:** `/admin` (staff tokens from `CELEVATE_STAFF`) for editing, workflow (Draft → Technical review → Verified → Published), versions, import/export, reports and statistics.

```bash
npm run qbank:verify     # Python recomputation → writes verification results
npm run qbank:validate   # schema, taxonomy, KaTeX, duplicates → count report, manifest
npm run qbank:pipeline   # verify → validate → promote/publish passing items → client catalog
npm run qbank:db:import -- --migrate        # load the JSON bank into DATABASE_URL
npm run qbank:db:import -- --pglite --migrate --shim   # dry run in an in-memory Postgres
```

## Data and honesty

- **Learner data stays on the device.** Progress (lessons, attempts, exams, bookmarks, notes, study time) is stored in the browser's `localStorage`; Settings → *Your data* lets you export, import or reset it. The server grades sessions statelessly and, with a database configured, records exam attempts.
- **No fabricated statistics.** Every dashboard and analytics view is computed from the learner's own activity. Visitors can load clearly labelled **sample data** to preview the dashboards. While it is active, a persistent banner says so, and it can be cleared at any time.
- **The readiness score is an internal learning estimate.** It is labelled everywhere as not being a prediction of PRC results.
- **Content is original.** It includes no real board questions, pass rates, endorsements or testimonials. Questions are original CELE-style problems, never presented as actual PRC questions. Lessons that aren't written yet are listed as "In preparation" and can't be opened.

## Project structure

```
app/
  page.tsx                  Landing page
  onboarding/               First-run setup
  (app)/                    App shell routes: dashboard, review, subjects, practice,
                            exams, tutor, formulas, progress, achievements, settings
  (focus)/exams/take/       Distraction-free exam room (no app shell)
  admin/                    Question-bank admin console (staff only)
  api/sessions/             Start / check / submit / review (answer key stays server-side)
  api/admin/                Staff APIs: questions, workflow, import/export, reports, overview
  api/tutor/                Streaming Claude endpoint grounded in revealed, verified questions
components/
  ui/                       Design-system primitives (button, card, dialog, tabs, ...)
  shell/                    Sidebar, top bar, mobile nav, command menu, notifications
  marketing/                Landing page sections and parallax hero
  learn/ practice/ exam/    Learning, practice and examination experiences
  charts/ figures/ math/    Charts, engineering diagrams (SVG), KaTeX rendering
config/cele.ts              Configurable subject labels, codes and weights
data/question-bank/         Question bank JSON, taxonomy, exam config, verify/*.py, reports
supabase/migrations/        PostgreSQL schema (RLS, constraints, versioning, audit log)
scripts/qbank/              Validate, promote, catalog, DB import/export
tests/                      Vitest suites
lib/
  qbank/                    Schema, validation, selection/grading engine, CSV, client API
  server/                   Tokens, staff auth, question stores (file / Postgres), sessions
  content/                  Typed lessons and formulas per subject
  store/                    Persisted stores (progress, prefs, tutor) and UI state
  analytics.ts              Mastery, readiness, streaks, trends and recommendations
```

### Content model

Content lives in `lib/content/<subject>/` as typed TypeScript (`lib/content/types.ts`). Rich text supports inline `$math$` and `**bold**`. Lessons are built from blocks: headings, paragraphs, display math, callouts, tables, worked examples, figures, and inline self-checks. Subject names, topics and weights come from `data/question-bank/taxonomy.json` and exam presets from `data/question-bank/exam-config.json`, so they can be aligned with the current PRC syllabus without code changes.

## Design system

- **Themes:** Light, Dark and System. The choice is applied before first paint by an inline script, so the wrong theme never flashes. Transitions between themes are smooth.
- **Tokens:** semantic color roles, elevation, radii, motion easings, and a fluid type scale using Space Grotesk, Inter and JetBrains Mono.
- **Motion:** uses transforms and opacity only. The parallax scales back on small screens, is turned off on low-power devices and data-saver connections, and is fully disabled for `prefers-reduced-motion` or the in-app *Reduce motion* setting.
- **Accessibility:** a skip link, visible focus rings, native radio groups for answer choices, keyboard shortcuts (1–4, Enter, ←/→, F, ⌘K), a table view for every chart, and labelled status and live regions.
