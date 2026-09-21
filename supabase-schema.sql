-- Smart PC Builder account storage
-- Run this once in the Supabase SQL Editor.

create table if not exists public.saved_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  budget integer not null default 0,
  total integer not null default 0,
  score integer not null default 0,
  build jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_builds_user_id_created_at_idx
  on public.saved_builds(user_id, created_at desc);

alter table public.saved_builds enable row level security;

drop policy if exists "Users can view their own saved builds" on public.saved_builds;
create policy "Users can view their own saved builds"
  on public.saved_builds for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own saved builds" on public.saved_builds;
create policy "Users can create their own saved builds"
  on public.saved_builds for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved builds" on public.saved_builds;
create policy "Users can delete their own saved builds"
  on public.saved_builds for delete
  using (auth.uid() = user_id);
