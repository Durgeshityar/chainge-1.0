-- Enable RLS and add policies for users table

alter table public.users enable row level security;

drop policy if exists "Allow insert own profile" on public.users;
create policy "Allow insert own profile"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Allow users to select any profile (can tighten later)
drop policy if exists "Allow read profiles" on public.users;
create policy "Allow read profiles"
  on public.users
  for select
  using (true);

-- Allow users to update their own profile
drop policy if exists "Allow update own profile" on public.users;
create policy "Allow update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
