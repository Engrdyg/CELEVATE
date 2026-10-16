# CELEVATE: Question Bank, Questionnaires and Mock Board Examination System

Status as of 2026-10-16. This document describes what is **implemented**. Planned and unfinished work is listed separately in [§14 Status and remaining work](#14-status-and-remaining-work).

## 1. Scope and principles

- All questions are **original CELE-style problems**. They are not presented as actual PRC board questions.
- A question reaches learners only when it is **validated, independently verified and published**.
  - Ambiguous or unverifiable items stay in Draft or Needs review.
- **Automated verification is not human review.** Licensed-engineer (SME) approval is a separate status, set only by a human reviewer who attests to it. Learners see which kind of check applies to each item.
- **No invented code provisions, clause numbers or page citations.**
  - Design-code-dependent values (φ factors, load combinations, allowable stresses, bolt and weld strengths, bearing-capacity factors) are stated in the problem stem as given assumptions.
  - `references` stays empty unless a verifiable reference exists.
- **Counts are never claimed, only computed** from stored records (`npm run qbank:validate -- --write-reports`).
- **The answer key never reaches the learner's browser before the rules allow it.**

## 2. CELE subject structure (PRC syllabus check)

Source: PRC examination programs for Civil Engineering (April 2024, November 2024, April 2025) and the Board of Civil Engineering syllabus page, checked 2026-10-16. The PDF bodies could not be fetched directly, so verification is **partial**. The record is stored in `data/question-bank/taxonomy.json → verification`.

| Id | Code | Official title | Weight |
|---|---|---|---|
| `mste` | MSTE | Applied Mathematics, Surveying, Principles of Transportation and Highway Engineering, Construction Management and Methods | 35% |
| `hge` | HGE | Hydraulics and Principles of Geotechnical Engineering | 30% |
| `psad` | PSAD | Principles of Structural Analysis and Design | 35% |

- **Verified:**
  - the three subject groups and their 35/30/35 weights;
  - Construction Management and Methods belongs to Subject 1 (not Subject 3);
  - the main PSAD coverage areas.
- **Not verified** (and marked so in the data and in the admin overview):
  - the complete official subtopic lists;
  - the passing rules (70% general average and 50% minimum subject grade are shown only as a labelled study reference in `exam-config.json → passingReference.verified = false`);
  - the reported change in subject order from March 2026.

**Configurability.** Subjects, topics, subtopics and weights live in `taxonomy.json`. The difficulty mix, exam presets, recent-question exclusion window and SME requirement live in `exam-config.json`. No code changes are needed to align them with a new PRC program. The UI (`config/cele.ts`, practice filters, admin coverage) reads from these files.

Topic list (subtopics are in `taxonomy.json`):

- **MSTE:**
  - Algebra
  - Trigonometry and Geometry
  - Analytic Geometry
  - Calculus and Differential Equations
  - Probability, Statistics and Engineering Economy
  - Surveying
  - Transportation and Highway Engineering
  - Construction Management and Methods
- **HGE:**
  - Fluid Properties
  - Hydrostatics
  - Fluid Flow and Pipe Systems
  - Open Channel Flow
  - Soil Properties and Classification
  - Permeability and Seepage
  - Stresses in Soil
  - Consolidation and Settlement
  - Shear Strength of Soil
  - Foundations and Earth Structures
- **PSAD:**
  - Engineering Mechanics
  - Strength of Materials
  - Theory of Structures
  - Reinforced Concrete Design
  - Prestressed Concrete
  - Steel Design
  - Timber Design

## 3. Question record

The schema is `lib/qbank/schema.ts` (Zod). It is exported as JSON Schema at `data/question-bank/schema/question.schema.json`.

| Field | Notes |
|---|---|
| `id` | `mste-q001`… — immutable |
| `subject`, `topic`, `subtopic` | Must exist in the taxonomy |
| `type` | `computational` or `conceptual` |
| `title`, `stem` | Rich text: inline `$KaTeX$`, `**bold**` |
| `figure` | Optional diagram id (SVG components in `components/figures`) |
| `choices[4]` | `{ key: A–D, text, value? }`. `value` is required for computational items and must match the first number in `text` |
| `answer` | Correct key |
| `difficulty` | `easy` / `moderate` / `difficult` |
| `estimatedTimeSeconds` | 30–900 |
| `given[]`, `required` | Given values and the required unknown |
| `formulas[]` | `{ label, tex }` |
| `variables[]` | `{ symbol, meaning, unit }` |
| `solution[]` | ≥ 2 steps `{ title, text, tex? }`, covering substitution and computation |
| `finalAnswer` | With units |
| `insight` | Engineering insight |
| `commonErrors[]` | Explains each distractor |
| `relatedConcepts[]`, `relatedLessonIds[]`, `formulaIds[]` | Lesson and formula ids are checked against the content library |
| `references[]` | Only verifiable references |
| `verification` | `{ method: python-recompute / conceptual-review, script, computedValue, unit, tolerance ≤ 5%, status: passed / failed / not-run, checkedAt, notes }` |
| `status` | `{ validation: draft / technical_review / verified / needs_review / rejected, publication: unpublished / published / archived, smeReview: pending / approved / changes_requested }` |
| `meta` | `{ author, createdAt, updatedAt, updatedBy, version, reviewedBy, smeReviewer, changeReason }` |
| `history[]` | Snapshots of earlier versions `{ version, snapshot, changedBy, changeReason, changedAt }` |

The schema itself enforces these rules:

- exactly the keys A–D, with unique choice texts;
- the id prefix matches the subject;
- computational items need given values, formulas, a numeric value on every choice, and python-recompute verification;
- placeholder text is rejected;
- *published ⇒ verified and verification passed*.

## 4. Quality assurance

All checks are deterministic and run in CI-style scripts and tests.

1. **Independent recomputation** (`data/question-bank/verify/{mste,hge,psad}.py`, harness `harness.py`, runner `run.py`).
   - Each computational item has a `@check(qid, unit, tol)` function that re-derives the answer from givens re-typed from the stem.
   - Several checks deliberately use a different method from the authored solution, for example:
     - bisection in place of a closed form;
     - E₁−E₂ for the hydraulic-jump loss;
     - the R⁵ form of Boussinesq;
     - Mohr-circle tangency.
   - `run.py` requires that:
     - the computed value matches the keyed choice within tolerance;
     - **exactly one** choice matches;
     - distractors are distinguishable;
     - units agree.
   - It writes `verification.*` and `reports/verification-report.json`.
2. **Validation** (`lib/qbank/validate.ts`, `scripts/qbank/validate.ts`) covers:
   - schema;
   - taxonomy membership;
   - KaTeX compilation of all inline and display math, including balanced `$`;
   - choice text matching its numeric value;
   - `computedValue` agreeing with the key;
   - lesson and formula ids existing;
   - conceptual items not publishing without SME approval.
3. **Duplicate detection** (`lib/qbank/duplicates.ts`) classifies near-matches as:
   - exact;
   - numeric-variant (same text, different numbers);
   - similar (word-shingle Jaccard ≥ 0.6).

   It runs in validation, import and the admin overview.
4. **Promotion** (`scripts/qbank/promote.ts`).
   - It moves only `technical_review` items with a passed check and zero validation errors to `verified`, and, with `--publish`, to `published`.
   - The actor is recorded as the automated pipeline.
   - Conceptual items are skipped and wait for a human.
5. **Pipeline:** `npm run qbank:pipeline` runs verify → validate → promote --publish → client catalog → validate again.

## 5. Publishing workflow and roles

```
Draft → Technical review → Verified → Published
          ↘ Needs review ↗      ↘ (unpublish / archive / restore)
          ↘ Rejected → Draft
```

| Action | admin | reviewer | author | system (pipeline) |
|---|---|---|---|---|
| Create / edit draft | ✓ | ✓ | ✓ | ✓ |
| → Technical review / back to Draft | ✓ | ✓ | ✓ | ✓ |
| → Verified, Needs review, Rejected | ✓ | ✓ | — | ✓ |
| Publish / unpublish / archive / restore | ✓ | — | — | ✓ |
| SME approve (licensed-engineer attestation required) | ✓ | ✓ | — | **never** |
| SME request changes (→ Needs review, unpublished) | ✓ | ✓ | — | ✓ |

- "Verified" requires `verification.status = passed`. Conceptual items also require SME approval.
- Leaving "Verified" withdraws publication.
- When `requireSmeApprovalToPublish` is true in `exam-config.json`, publishing also requires SME approval.
- **Edits are versioned** (`lib/server/qbank/save.ts`):
  - every save bumps `meta.version` and snapshots the previous version, recording who saved it and why;
  - a change to the problem, choices, key, givens, formulas, solution, final answer, figure or type resets verification to `not-run`, returns the item to Draft and unpublishes it;
  - metadata-only edits (title, tags, related lessons) keep the current status;
  - a change reason is mandatory.
- **Pinned versions:** sessions and results record the version each question had when the attempt started. Later edits never change how an existing attempt is graded or reviewed.

## 6. Storage

| Store | When | Notes |
|---|---|---|
| `FileStore` (`lib/server/qbank/file-store.ts`) | default | Version-controlled JSON in `data/question-bank`. Read-only in production; writable in `next dev` or with `QBANK_FILE_WRITES=1`. Atomic writes, mtime cache. Reports → `reports/student-reports.json`; audit → `reports/audit-log.jsonl`. Learner attempts stay in the browser. |
| `PostgresStore` (`lib/server/qbank/pg-store.ts`) | `DATABASE_URL` set | Transactional saves and workflow, audit rows, idempotent attempt recording. |

### Database schema

The schema is in `supabase/migrations/20261016000000_question_bank.sql`.

- **Tables:**
  - `app_users` (role)
  - `subjects`
  - `topics` (self-referencing for subtopics)
  - `questions`
  - `question_choices`
  - `question_solutions`
  - `question_versions` (immutable snapshots)
  - `exams`
  - `exam_attempts`
  - `exam_attempt_questions` (pinned version, presented order, selection, correctness)
  - `question_reports`
  - `audit_log`
- **Integrity:**
  - foreign keys and check constraints;
  - a partial unique index allowing only **one correct choice** per question;
  - *published ⇒ verified*;
  - a deferred constraint trigger that refuses publication unless there are 4 choices, 1 correct, ≥ 2 solution steps and passed verification.
- **Indexes** on subject, topic, status and difficulty.
- **LaTeX** is stored as text.
- **Row-level security** is enabled on every table, with `app_role()` based on `auth.uid()`.
- **Learner-facing access** goes only through the `security_barrier` views `public_questions` and `public_question_choices`. These expose published items with no `is_correct`, solutions or verification data.
- **Tooling:**
  - `npm run qbank:db:import` / `qbank:db:export` sync the JSON bank with a database;
  - `--pglite --migrate --shim` runs everything in an in-memory Postgres for a dry run (this is what the tests use).

## 7. Learner experience

### Practice (`/practice`)

| Mode | Behaviour |
|---|---|
| Topic | One syllabus topic |
| Subject | Mixed questions from one CELE subject |
| Random | All subjects |
| Weak areas | Topic weights from the learner's own accuracy. Untested topics get a mild priority. The learner is told when there is too little history. |
| Timed | Countdown, auto-submit, answers revealed at the end |

- Every mode uses the real bank through `POST /api/sessions`.
- Options: difficulty filter, 5–30 questions, and feedback after each answer or at the end.
- Recently answered questions (window 40) are pushed to the back of selection.
- Deep links such as `/practice?mode=topic&topic=hge-statics` and `/practice?q=<id>` start a set immediately.
- Bookmarks, flags, a navigator, keyboard shortcuts (1–4 / A–D, Enter, ←/→) and an elapsed timer are included.

### Mock board exams (`/exams`, `/exams/take`, `/exams/results`)

- **Presets** from `exam-config.json`:
  - full mock (60 items / 180 min);
  - mixed 30;
  - three subject sprints of 25 items.
- **Custom builder:** choose subjects, length, time, auto-submit and whether solutions are shown in the results.
- **Before starting:** an instructions dialog.
- **During the exam:**
  - distraction-free room;
  - countdown with a 5-minute warning;
  - question palette showing answered, unanswered and marked-for-review;
  - mark for review;
  - autosave and resume after a refresh (persisted in the browser);
  - per-question time tracking;
  - submit confirmation listing unanswered and flagged counts;
  - auto-submit at expiry, with retry when offline.
- **No answers or solutions** are available during the exam. The server refuses instant checks for mock sessions.
- **Results:**
  - percentage and raw score;
  - correct, incorrect and unanswered counts;
  - time used against the limit;
  - change from the previous exam;
  - subject chart with the labelled 70% reference line;
  - trend across exams;
  - accuracy by topic and by difficulty;
  - strongest and weakest areas with practice links;
  - item review (all / incorrect / unanswered / flagged) re-derived from the signed result token.
- Late submissions are flagged. **No readiness or pass predictions are made.**

### Solutions

Solutions are shown as Given / Required / Formula with a variables table / Solution steps / Final answer / Engineering insight / Common errors, all rendered with KaTeX. Each item shows a badge for its verification state:

- "Answer independently recomputed" for items that passed the automated check;
- "Awaiting licensed-engineer review", or "Reviewed by a licensed engineer" only when `smeReview = approved`.

Learners can report an error on every item (`POST /api/reports`). Reports are triaged in the admin console and never change a question automatically.

### AI explanations (`/tutor`)

- From a revealed solution, "Ask CELEVATE AI" offers five actions:
  - explain it more simply;
  - why the keyed answer is correct;
  - why the other choices are wrong;
  - an alternative method;
  - review the formulas.
- The request carries a **reveal token** (issued only after the learner has answered or submitted). The server loads the verified question and adds it as grounding context (`lib/tutor/question-context.ts`).
  - The model is told to treat the authored solution as authoritative.
  - It must explain any discrepancy and suggest "Report an issue" rather than override the key.
  - It refers to choices by content, because the learner saw them shuffled.
- The AI output is shown separately and labelled "AI-generated · not verified content". It never modifies the authored solution.
- Without an API key, demo mode restates the verified solution, labelled as such.

### Lessons, landing page, review

- Lessons embed inline self-checks.
- The landing page "Try a problem" demo is served by the same answer-free API.
- My Review bookmarks resolve through the answer-free client catalog (`lib/qbank/catalog.generated.json`).

## 8. Answer security and randomisation

- **Answer-free payloads.** `PublicQuestion` contains id, version, metadata, stem, figure and shuffled choices `{ id, label, text }`. It has no key, numeric values, solution or verification data. The client catalog is metadata only.
- **Stateless signed sessions** (`lib/server/tokens.ts`, HMAC-SHA256 with `CELEVATE_SIGNING_SECRET`).
  - The session token carries question ids, pinned versions, per-item choice order, mode, feedback rule, deadline and reveal rule.
  - Result and reveal tokens are separate kinds.
  - Tampering, kind confusion and expiry are rejected.
- **Rules enforced by the server:**
  - instant checks only in instant-feedback sessions and before deadline + 120 s grace;
  - submissions grade only questions in the token, against the pinned versions;
  - late submissions are marked and their time is capped;
  - when an exam hides solutions, the key is withheld from both the submit and review responses.
- **Selection** (`lib/qbank/engine.ts → selectQuestions`) uses only published, verified questions and never returns duplicates within a session. It applies:
  - the subject, topic, subtopic and difficulty filters;
  - subject weights (CELE weights for mocks);
  - the configured 30/50/20 difficulty distribution;
  - topic weights (weak-area practice);
  - pushing recently answered questions to the back;
  - forcing included ids to the front.

  Allocation is bounded by availability.
- **Choice shuffling** is per attempt, with the mapping preserved. "Choice X" references inside solutions are relabelled to the letters the learner saw.
- **Fixed order per attempt:** the question order and choice order are fixed in the token, so resume, review and grading all use the exact same order.
- **Staff authentication:**
  - signed httpOnly `SameSite=Strict` cookie, 12-hour TTL;
  - timing-safe token comparison;
  - login rate limit of 8 attempts per 15 minutes per IP;
  - same-origin checks on all state-changing admin requests;
  - request-size limits.

## 9. Admin console (`/admin`)

Staff sign in with tokens from `CELEVATE_STAFF`. Read-only deployments show a banner and hide the editing controls.

- **Overview.** All values are computed live:
  - generated, verification-passed, verified, published, awaiting-human-review and SME-approved counts;
  - progress toward 3,000 (published only);
  - coverage per topic;
  - difficulty mix against the target;
  - duplicates and open reports;
  - syllabus verification status;
  - recent audit log;
  - "Run Python verification" when editing locally.
- **Questions:** search (id, title, stem, author); filters for subject, topic, difficulty, validation, publication and SME status; pagination.
- **Editor:**
  - classification fields;
  - diagram picker;
  - stem;
  - choices with a correct-answer selector and numeric values;
  - givens, required unknown, formulas, variables and solution steps (substitution and computation);
  - final answer, insight, common errors, related ids, references;
  - verification settings;
  - live preview of the question and solution;
  - live quality checks (schema, taxonomy, KaTeX, consistency);
  - change reason;
  - save as a new version;
  - discard;
  - version history with "load into editor";
  - per-question learner reports.
- **Workflow bar:** role-aware transitions, publish/unpublish, archive/restore, and SME approve (licensed-engineer attestation dialog) or request changes.
- **Import / export:**
  - JSON or CSV import, validated before commit (schema, taxonomy, KaTeX, existing ids, exact duplicates block; near-duplicates warn); imports always enter as drafts;
  - export of all or published items as JSON or CSV.
- **Error reports:** open, investigating, resolved or dismissed, with resolution notes.

## 10. APIs

| Route | Method | Purpose |
|---|---|---|
| `/api/qbank/catalog` | GET | Answer-free metadata of published items |
| `/api/sessions` | POST | Start practice/timed/weakness/mock session |
| `/api/sessions/check` | POST | Instant feedback for one item (instant sessions only) |
| `/api/sessions/submit` | POST | Grade a session; returns result + result token (+ reveal token if allowed) |
| `/api/sessions/review` | POST | Re-derive item review from a result token |
| `/api/qbank/revealed` | POST | Verified solution for a revealed item (reveal token) |
| `/api/reports` | POST | Learner error report (202 with `stored:false` on read-only stores) |
| `/api/tutor` | GET/POST | AI availability; streaming explanation with optional verified-question grounding |
| `/api/admin/session` | GET/POST/DELETE | Staff session |
| `/api/admin/overview` | GET | Counts, coverage, duplicates, audit, config |
| `/api/admin/questions` | GET/POST | List / create |
| `/api/admin/questions/[id]` | GET/PUT/POST/DELETE | Detail with versions/reports/issues; save version; workflow action; archive |
| `/api/admin/import` | POST | Validate / commit JSON or CSV |
| `/api/admin/export` | GET | JSON / CSV export |
| `/api/admin/reports` | GET/PATCH | Report triage |
| `/api/admin/verify` | POST | Run the Python harness (local file store only) |

## 11. Seed and tooling files (`data/question-bank/`)

| File | Purpose |
|---|---|
| `taxonomy.json`, `exam-config.json` | Configurable syllabus and exam settings |
| `mathematics-surveying-transportation.json`, `hydraulics-geotechnical.json`, `structural-analysis-design.json` | Question records |
| `schema/question.schema.json` | JSON Schema export |
| `verify/harness.py`, `verify/run.py`, `verify/{mste,hge,psad}.py` | Independent verification |
| `reports/verification-report.json` | Last verification run |
| `reports/question-count-report.json` | Counts, errors, warnings, duplicates |
| `reports/batches.json` | Promotion batches |
| `reports/audit-log.jsonl` | File-store audit log |
| `progress-manifest.json` | Phase status, per-subject/topic progress toward 3,000, uncovered subtopics |

Import and validation scripts: `scripts/qbank/*`. Integrity tests: `tests/*`.

## 12. Tests

Run with `npm test` (Vitest 5). There are 45 tests in 6 files:

- `engine.test.ts` covers:
  - deterministic shuffling;
  - apportionment;
  - no duplicates;
  - CELE subject weights (21/18/21 of 60) and the difficulty mix;
  - filters;
  - included and recent ids;
  - weak-topic weighting;
  - answer-free payloads;
  - label remapping;
  - grading and scoring.
- `tokens.test.ts` covers round-trips, tampering, kind confusion, expiry and malformed tokens.
- `bank.test.ts` covers:
  - zero validation errors and warnings;
  - unique ids and stems;
  - published ⇒ verified and passed;
  - key equals recomputed value;
  - no SME approval without a human reviewer;
  - count report equals the records;
  - catalog equals the published set and contains no answers;
  - a 30/50/20 mix per subject.
- `workflow.test.ts` covers:
  - the full workflow and role permissions;
  - SME attestation, and that automation can never approve;
  - requested changes;
  - versioning, history attribution and verification reset;
  - metadata-only edits;
  - the mandatory change reason.
- `sessions.test.ts` covers:
  - mock payloads with no key leak and instant checks refused;
  - server-side grading against pinned versions;
  - the key withheld when solutions are hidden;
  - out-of-session answers ignored and forged tokens rejected;
  - reveal tokens scoped to one item;
  - instant checks refused after the deadline;
  - late submissions capped.
- `stores.test.ts` covers:
  - FileStore on a temporary copy (published filter, versions, pinned versions, audit, reports);
  - CSV round-trip;
  - PostgresStore on PGlite with the real migration (import, no key columns in public views, one-correct-choice constraint, versioned edits).

## 13. Configuration

See `.env.example`.

| Variable | Purpose |
|---|---|
| `CELEVATE_SIGNING_SECRET` | Required in production |
| `CELEVATE_STAFF` / `CELEVATE_ADMIN_TOKEN` | Admin accounts |
| `DATABASE_URL` (+ `DATABASE_SSL`) | Optional Postgres |
| `QBANK_FILE_WRITES` | File-store editing |
| `ANTHROPIC_API_KEY` | Optional live AI |

## 14. Status and remaining work

### Phase 1 (this delivery)

| | MSTE | HGE | PSAD | Total |
|---|---|---|---|---|
| Generated | 50 | 50 | 50 | **150** |
| Independent Python check passed | 50 | 50 | 50 | **150** |
| Verified (validation status) | 50 | 50 | 50 | **150** |
| Published | 50 | 50 | 50 | **150** |
| Licensed-engineer (SME) approved | 0 | 0 | 0 | **0** |
| Awaiting human review | 50 | 50 | 50 | **150** |

- **Difficulty:** 45 easy, 75 moderate, 30 difficult (30/50/20). Every subject has 15 / 25 / 10.
- **Type:** all 150 are computational. No conceptual items yet.
- **Coverage:**
  - every taxonomy topic has questions;
  - every subtopic is covered except one: `mste-stat-stats` (descriptive statistics) has no question yet;
  - current gaps are tracked in `progress-manifest.json → subtopicsWithoutQuestions`.
- The 45 questions that existed before this phase were migrated and re-verified. Fixes made during migration:
  - **hge-q004:** distractor D corrected to match its stated mistake;
  - **hge-q013:** choices reworded as signed values;
  - **mste-q009 and mste-q011:** distractors that were within 0.3% of the key were replaced;
  - givens or formulas added to several stems.

  No keyed answers were wrong.

### Items flagged for SME attention

These are not errors. Each needs a human decision.

- **mste-q007, mste-q012, mste-q013** (leveling elevation, PT station, summit elevation): distractors are far apart in absolute terms but under 2% apart relative to the large values, so they are checked with tight tolerances.
- **mste-q035:** the value is expressed in million PHP.
- **mste-q025:** the result depends on the approximate coordinates given.
- **mste-q044, mste-q047:** the constants are stated in the stem.
- **hge-q011:** two distractors are about 1% apart (kept from the original question).
- **hge-q037:** the unit is 10⁻⁶ m/s.
- **hge-q038:** a deliberate unit-error distractor.
- **hge-q046, hge-q047:** the bearing-capacity factors are given in the stem.
- **psad-q044:** illustrative section properties, not taken from a real W-shape table.
- **psad-q046, psad-q047:** the F_nv and F_EXX values are assumed.
- **psad-q049:** the timber column formulas need to be confirmed against the NSCP edition being taught.
- **psad-q021, psad-q025:** distractors are close to the key by design.
- **psad-q028:** truss geometry is described in words only.

### Phase 2 (not started)

- **Target:** 3,000 approved, unique questions. 2,850 remain.
- **Batches:** 30–50 per subject, each running author → verify → validate → review → publish. Batch contents are logged in `reports/batches.json` and the manifest.
- **Priorities:**
  - conceptual items with SME review;
  - more diagrams;
  - subtopic gaps listed in the manifest.
- **Not done yet:**
  - human SME review of the 150 published items;
  - an official-syllabus re-check once the PRC PDFs are accessible (then set `taxonomy.verification.status` accordingly).

### Known limitations

- **File store in production:** the default deployment serves the bank read-only. Learner reports return `stored:false` unless a database (or a writable file store) is configured, and the UI tells the learner so. Admin editing on Vercel needs `DATABASE_URL`.
- **Database role mapping:** `PostgresStore` is wired and tested on PGlite. The production Supabase setup still needs the migration applied and staff mapped to `app_users` roles for RLS-based direct access. The app's own API uses the service connection.
- **Learner data:** attempts are stored per device (browser storage). There are no learner accounts yet.
- **AI tutor:** without `ANTHROPIC_API_KEY` it runs in labelled demo mode.
- **Database TLS:** the Postgres connection uses TLS without certificate pinning (`rejectUnauthorized: false`) for compatibility with managed poolers. Tighten this if the provider's CA is available.
