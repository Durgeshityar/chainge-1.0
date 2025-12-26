create table if not exists public.posts (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  activity_id uuid,
  caption text,
  media_urls text[] not null default '{}',
  map_snapshot_url text,
  stats jsonb,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_posts_updated_at on public.posts;
create trigger trigger_posts_updated_at
before update on public.posts
for each row
execute function public.set_posts_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Allow insert own posts" on public.posts;
create policy "Allow insert own posts"
  on public.posts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Allow read posts" on public.posts;
create policy "Allow read posts"
  on public.posts
  for select
  using (true);

drop policy if exists "Allow update own posts" on public.posts;
create policy "Allow update own posts"
  on public.posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Allow delete own posts" on public.posts;
create policy "Allow delete own posts"
  on public.posts
  for delete
  using (auth.uid() = user_id);
