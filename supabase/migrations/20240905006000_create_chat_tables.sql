create extension if not exists "pgcrypto";

-- Chat schema for conversations, participants, and messages

do $$
begin
  create type public.chat_type as enum ('DIRECT', 'GROUP');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  type public.chat_type not null default 'DIRECT',
  name text,
  last_message_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_chats_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_chats_updated_at on public.chats;
create trigger trigger_chats_updated_at
before update on public.chats
for each row
execute function public.set_chats_updated_at();

create table if not exists public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  last_read_at timestamptz,
  unique (chat_id, user_id)
);

create index if not exists chat_participants_chat_id_idx on public.chat_participants(chat_id);
create index if not exists chat_participants_user_id_idx on public.chat_participants(user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  media_urls text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists messages_chat_created_idx on public.messages(chat_id, created_at desc);

alter table public.chats
  add constraint chats_last_message_fk
  foreign key (last_message_id)
  references public.messages(id)
  on delete set null;

alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "allow insert chats" on public.chats;
create policy "allow insert chats"
  on public.chats
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "allow select participant chats" on public.chats;
create policy "allow select participant chats"
  on public.chats
  for select
  using (exists (
    select 1
    from public.chat_participants cp
    where cp.chat_id = chats.id
      and cp.user_id = auth.uid()
  ));

drop policy if exists "allow update participant chats" on public.chats;
create policy "allow update participant chats"
  on public.chats
  for update
  using (exists (
    select 1
    from public.chat_participants cp
    where cp.chat_id = chats.id
      and cp.user_id = auth.uid()
  ))
  with check (exists (
    select 1
    from public.chat_participants cp
    where cp.chat_id = chats.id
      and cp.user_id = auth.uid()
  ));

drop policy if exists "allow select chat participants" on public.chat_participants;
create policy "allow select chat participants"
  on public.chat_participants
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chat_participants.chat_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "allow insert chat participants" on public.chat_participants;
create policy "allow insert chat participants"
  on public.chat_participants
  for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chat_participants.chat_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "allow update own chat participant" on public.chat_participants;
create policy "allow update own chat participant"
  on public.chat_participants
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "allow delete own chat participant" on public.chat_participants;
create policy "allow delete own chat participant"
  on public.chat_participants
  for delete
  using (user_id = auth.uid());

drop policy if exists "allow select chat messages" on public.messages;
create policy "allow select chat messages"
  on public.messages
  for select
  using (exists (
    select 1
    from public.chat_participants cp
    where cp.chat_id = messages.chat_id
      and cp.user_id = auth.uid()
  ));

drop policy if exists "allow insert chat messages" on public.messages;
create policy "allow insert chat messages"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.chat_participants cp
      where cp.chat_id = messages.chat_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "allow update own chat messages" on public.messages;
create policy "allow update own chat messages"
  on public.messages
  for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

drop policy if exists "allow delete own chat messages" on public.messages;
create policy "allow delete own chat messages"
  on public.messages
  for delete
  using (sender_id = auth.uid());
