create extension if not exists "pgcrypto";

create type progress_status as enum ('not_started','in_progress','completed');
create type review_status   as enum ('pending','reviewed');

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  target_year smallint check (target_year between 2024 and 2040),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.user_syllabus_progress (
  user_id         uuid not null references public.users(id) on delete cascade,
  topic_id        text not null check (length(topic_id) between 3 and 64),
  status          progress_status not null default 'not_started',
  last_revised_at timestamptz,
  revision_count  integer not null default 0 check (revision_count >= 0),
  updated_at      timestamptz not null default now(),
  primary key (user_id, topic_id)
);
create index idx_usp_user_status on public.user_syllabus_progress (user_id, status);

create table public.daily_study_logs (
  user_id          uuid not null references public.users(id) on delete cascade,
  date             date not null,
  duration_minutes integer not null default 0 check (duration_minutes between 0 and 1440),
  target_achieved  boolean not null default false,
  primary key (user_id, date)
);

create table public.test_results (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  test_id          text not null,
  marks_obtained   numeric(6,2) not null,
  total_marks      numeric(6,2) not null check (total_marks > 0),
  total_time_taken integer not null check (total_time_taken >= 0),
  submitted_at     timestamptz not null default now(),
  check (marks_obtained <= total_marks)
);
create index idx_tr_user_submitted on public.test_results (user_id, submitted_at desc);
create index idx_tr_test on public.test_results (test_id);

create table public.mains_answer_uploads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  question_id  text not null,
  pdf_url_r2   text not null,
  status       review_status not null default 'pending',
  review_notes text,
  created_at   timestamptz not null default now()
);
create index idx_mau_user on public.mains_answer_uploads (user_id, created_at desc);
create index idx_mau_pending on public.mains_answer_uploads (created_at) where status = 'pending';

alter table public.users                  enable row level security;
alter table public.user_syllabus_progress enable row level security;
alter table public.daily_study_logs       enable row level security;
alter table public.test_results           enable row level security;
alter table public.mains_answer_uploads   enable row level security;

create policy "own profile read"   on public.users for select using ((select auth.uid()) = id);
create policy "own profile update" on public.users for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own progress all" on public.user_syllabus_progress for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own logs all" on public.daily_study_logs for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own results read"   on public.test_results for select using ((select auth.uid()) = user_id);
create policy "own results insert" on public.test_results for insert with check ((select auth.uid()) = user_id);

create policy "own uploads read"   on public.mains_answer_uploads for select using ((select auth.uid()) = user_id);
create policy "own uploads insert" on public.mains_answer_uploads for insert
  with check ((select auth.uid()) = user_id and status = 'pending' and review_notes is null);

create or replace function public.upsert_topic_progress(
  p_topic_id text, p_status progress_status, p_revised boolean default false
) returns void language sql security invoker as $$
  insert into public.user_syllabus_progress as p
    (user_id, topic_id, status, last_revised_at, revision_count, updated_at)
  values (auth.uid(), p_topic_id, p_status,
          case when p_revised then now() end, case when p_revised then 1 else 0 end, now())
  on conflict (user_id, topic_id) do update set
    status = excluded.status,
    last_revised_at = case when p_revised then now() else p.last_revised_at end,
    revision_count  = p.revision_count + case when p_revised then 1 else 0 end,
    updated_at = now();
$$;
