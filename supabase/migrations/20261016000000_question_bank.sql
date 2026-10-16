-- CELEVATE question bank & examination schema (PostgreSQL 15+, Supabase-compatible)
--
-- Security model
--   * The Next.js server connects with a privileged role (DATABASE_URL) and enforces
--     authorization in its API layer (admin/reviewer/author sessions, exam tokens).
--   * Row-level security is enabled on every table so that direct client access through
--     Supabase (anon / authenticated roles) can never read answer keys, unpublished
--     questions or other learners' attempts.
--   * Learners read published questions through the `public_questions` /
--     `public_question_choices` views, which do not expose `is_correct` or solutions.

-- gen_random_uuid() is built into PostgreSQL 13+ (no extension required).

-- ---------------------------------------------------------------- roles
create table if not exists app_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,                        -- Supabase auth.users.id when available
  display_name  text not null,
  role          text not null default 'student' check (role in ('student', 'author', 'reviewer', 'admin')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- taxonomy
create table if not exists subjects (
  id             text primary key,                  -- 'mste' | 'hge' | 'psad'
  code           text not null unique,
  name           text not null,
  official_title text not null,
  description    text,
  weight         numeric(5,4) not null check (weight >= 0 and weight <= 1),
  display_order  int not null,
  active         boolean not null default true
);

create table if not exists topics (
  id              text primary key,
  subject_id      text not null references subjects(id) on delete cascade,
  parent_topic_id text references topics(id) on delete cascade,  -- null = main topic, else subtopic
  title           text not null,
  description     text,
  display_order   int not null default 0
);
create index if not exists topics_subject_idx on topics(subject_id);
create index if not exists topics_parent_idx on topics(parent_topic_id);

-- ---------------------------------------------------------------- questions
create table if not exists questions (
  id                     text primary key check (id ~ '^(mste|hge|psad)-q[0-9]{3,4}$'),
  subject_id             text not null references subjects(id),
  topic_id               text not null references topics(id),
  subtopic_id            text not null references topics(id),
  question_type          text not null check (question_type in ('computational', 'conceptual')),
  title                  text not null,
  question_text          text not null,
  difficulty             text not null check (difficulty in ('easy', 'moderate', 'difficult')),
  estimated_time_seconds int not null check (estimated_time_seconds between 30 and 900),
  explanation            text not null,                 -- engineering insight
  formula_latex          text,                          -- primary formula (all formulas in details)
  reference_text         text,
  details                jsonb not null,                -- given, required, formulas, variables, finalAnswer, commonErrors, …
  verification           jsonb not null,
  validation_status      text not null default 'draft'
                         check (validation_status in ('draft', 'technical_review', 'verified', 'needs_review', 'rejected')),
  publication_status     text not null default 'unpublished'
                         check (publication_status in ('unpublished', 'published', 'archived')),
  sme_review_status      text not null default 'pending'
                         check (sme_review_status in ('pending', 'approved', 'changes_requested')),
  current_version        int not null default 1 check (current_version >= 1),
  created_by             text not null,
  reviewed_by            text,
  sme_reviewed_by        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- Only verified questions can be published.
  constraint published_requires_verified check (publication_status <> 'published' or validation_status = 'verified')
);
create index if not exists questions_subject_idx on questions(subject_id);
create index if not exists questions_topic_idx on questions(topic_id);
create index if not exists questions_subtopic_idx on questions(subtopic_id);
create index if not exists questions_publish_idx on questions(publication_status, validation_status);
create index if not exists questions_difficulty_idx on questions(subject_id, difficulty);

create table if not exists question_choices (
  id            uuid primary key default gen_random_uuid(),
  question_id   text not null references questions(id) on delete cascade,
  choice_label  text not null check (choice_label in ('A', 'B', 'C', 'D')),
  choice_text   text not null,
  choice_value  double precision,
  is_correct    boolean not null default false,
  display_order int not null check (display_order between 1 and 4),
  unique (question_id, choice_label),
  unique (question_id, display_order)
);
-- Exactly one correct choice per question (at most one enforced here; "at least one" by the trigger below).
create unique index if not exists question_choices_one_correct on question_choices(question_id) where is_correct;

create table if not exists question_solutions (
  id             uuid primary key default gen_random_uuid(),
  question_id    text not null references questions(id) on delete cascade,
  step_number    int not null check (step_number >= 1),
  step_title     text not null,
  explanation    text not null,
  equation_latex text,
  unique (question_id, step_number)
);

create table if not exists question_versions (
  id               uuid primary key default gen_random_uuid(),
  question_id      text not null references questions(id) on delete cascade,
  version_number   int not null check (version_number >= 1),
  content_snapshot jsonb not null,
  changed_by       text not null,
  change_reason    text not null,
  created_at       timestamptz not null default now(),
  unique (question_id, version_number)
);

-- Published questions must have four choices and exactly one correct answer.
create or replace function check_question_integrity() returns trigger language plpgsql as $$
declare
  n_choices int;
  n_correct int;
  n_steps int;
begin
  if new.publication_status = 'published' then
    select count(*), count(*) filter (where is_correct) into n_choices, n_correct from question_choices where question_id = new.id;
    select count(*) into n_steps from question_solutions where question_id = new.id;
    if n_choices <> 4 or n_correct <> 1 then
      raise exception 'question % must have 4 choices and exactly 1 correct answer to be published', new.id;
    end if;
    if n_steps < 2 then
      raise exception 'question % must have a step-by-step solution to be published', new.id;
    end if;
    if (new.verification ->> 'status') is distinct from 'passed' then
      raise exception 'question % has not passed verification', new.id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists questions_integrity on questions;
create constraint trigger questions_integrity after insert or update on questions
  deferrable initially deferred for each row execute function check_question_integrity();

-- ---------------------------------------------------------------- exams
create table if not exists exams (
  id                      text primary key,
  title                   text not null,
  exam_type               text not null check (exam_type in ('mock_board', 'subject', 'topic', 'random', 'timed', 'custom')),
  duration_minutes        int not null check (duration_minutes between 1 and 600),
  question_count          int not null check (question_count between 1 and 200),
  subject_distribution    jsonb not null,
  difficulty_distribution jsonb,
  auto_submit             boolean not null default true,
  reveal_solutions        boolean not null default true,
  active                  boolean not null default true
);

create table if not exists exam_attempts (
  id               text primary key,                 -- server-issued session id
  exam_id          text references exams(id),
  learner_id       text not null,                    -- anonymous device id or app_users.id
  user_id          uuid references app_users(id),
  title            text not null,
  started_at       timestamptz not null,
  deadline_at      timestamptz,
  submitted_at     timestamptz,
  score            numeric(5,2),
  correct_count    int,
  question_count   int not null,
  duration_seconds int,
  auto_submitted   boolean not null default false,
  status           text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired', 'abandoned'))
);
create index if not exists exam_attempts_learner_idx on exam_attempts(learner_id, started_at desc);

create table if not exists exam_attempt_questions (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          text not null references exam_attempts(id) on delete cascade,
  question_id         text not null references questions(id),
  question_version_id uuid references question_versions(id),
  question_version    int not null,
  question_order      int not null,
  choice_order        text not null check (choice_order ~ '^[ABCD]{4}$'),
  answer_snapshot     text check (answer_snapshot in ('A', 'B', 'C', 'D')),
  selected_choice_id  uuid references question_choices(id),
  is_correct          boolean,
  answered_at         timestamptz,
  is_flagged          boolean not null default false,
  time_spent_seconds  int,
  unique (attempt_id, question_order),
  unique (attempt_id, question_id)
);
create index if not exists eaq_question_idx on exam_attempt_questions(question_id);

-- ---------------------------------------------------------------- reports & audit
create table if not exists question_reports (
  id          uuid primary key default gen_random_uuid(),
  question_id text not null references questions(id) on delete cascade,
  reported_by text not null,
  issue_type  text not null check (issue_type in ('wrong_answer', 'calculation_error', 'unclear_question', 'typo', 'rendering', 'other')),
  description text not null check (length(description) between 5 and 2000),
  status      text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  reviewed_by text,
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists question_reports_status_idx on question_reports(status, created_at desc);

create table if not exists audit_log (
  id          bigserial primary key,
  actor       text not null,
  action      text not null,
  entity      text not null,
  entity_id   text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_entity_idx on audit_log(entity, entity_id, created_at desc);

-- ---------------------------------------------------------------- learner-safe views
create or replace view public_questions with (security_barrier = true) as
  select id, subject_id, topic_id, subtopic_id, question_type, title, question_text, difficulty,
         estimated_time_seconds, current_version
  from questions
  where publication_status = 'published' and validation_status = 'verified';

create or replace view public_question_choices with (security_barrier = true) as
  select c.question_id, c.choice_label, c.choice_text, c.display_order
  from question_choices c
  join questions q on q.id = c.question_id
  where q.publication_status = 'published' and q.validation_status = 'verified';

-- ---------------------------------------------------------------- row level security
alter table app_users              enable row level security;
alter table subjects               enable row level security;
alter table topics                 enable row level security;
alter table questions              enable row level security;
alter table question_choices       enable row level security;
alter table question_solutions     enable row level security;
alter table question_versions      enable row level security;
alter table exams                  enable row level security;
alter table exam_attempts          enable row level security;
alter table exam_attempt_questions enable row level security;
alter table question_reports       enable row level security;
alter table audit_log              enable row level security;

create or replace function app_role() returns text language sql stable as $$
  select coalesce((select role from app_users where auth_user_id = auth.uid()), 'student')
$$;

-- Taxonomy and exam definitions are public.
drop policy if exists subjects_read on subjects;
create policy subjects_read on subjects for select using (active);
drop policy if exists topics_read on topics;
create policy topics_read on topics for select using (true);
drop policy if exists exams_read on exams;
create policy exams_read on exams for select using (active);

-- Raw question tables: staff only (learners use the public views above).
drop policy if exists questions_staff on questions;
create policy questions_staff on questions for all using (app_role() in ('author', 'reviewer', 'admin')) with check (app_role() in ('author', 'reviewer', 'admin'));
drop policy if exists choices_staff on question_choices;
create policy choices_staff on question_choices for all using (app_role() in ('author', 'reviewer', 'admin')) with check (app_role() in ('author', 'reviewer', 'admin'));
drop policy if exists solutions_staff on question_solutions;
create policy solutions_staff on question_solutions for all using (app_role() in ('author', 'reviewer', 'admin')) with check (app_role() in ('author', 'reviewer', 'admin'));
drop policy if exists versions_staff on question_versions;
create policy versions_staff on question_versions for select using (app_role() in ('author', 'reviewer', 'admin'));

-- Learners see only their own attempts; writes go through the server.
drop policy if exists attempts_own on exam_attempts;
create policy attempts_own on exam_attempts for select using (user_id is not null and user_id = (select id from app_users where auth_user_id = auth.uid()));
drop policy if exists attempt_questions_own on exam_attempt_questions;
create policy attempt_questions_own on exam_attempt_questions for select using (
  exists (select 1 from exam_attempts a where a.id = attempt_id and a.user_id = (select id from app_users where auth_user_id = auth.uid()))
);

-- Reports: anyone signed in may file; staff triage.
drop policy if exists reports_insert on question_reports;
create policy reports_insert on question_reports for insert with check (auth.uid() is not null);
drop policy if exists reports_staff on question_reports;
create policy reports_staff on question_reports for select using (app_role() in ('reviewer', 'admin'));

drop policy if exists audit_admin on audit_log;
create policy audit_admin on audit_log for select using (app_role() = 'admin');

drop policy if exists app_users_self on app_users;
create policy app_users_self on app_users for select using (auth_user_id = auth.uid() or app_role() = 'admin');

grant select on public_questions, public_question_choices to anon, authenticated;
