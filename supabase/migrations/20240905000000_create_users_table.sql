-- Migration: create users table expected by adapters
-- Mirrors the User shape from types/index.ts

create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  username text not null unique,
  name text not null,
  display_name text,
  bio text,
  avatar_url text,
  cover_image text,
  interests text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  gender text,
  height text,
  weight text,
  age integer,
  location text,
  activity_tracker text,
  date_of_birth date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_users_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_users_updated_at on public.users;
create trigger trigger_users_updated_at
before update on public.users
for each row
execute function public.set_users_updated_at();
