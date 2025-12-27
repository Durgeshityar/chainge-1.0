-- Rework chat policies to avoid recursive checks

create or replace function public.is_chat_member(p_chat_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  return exists (
    select 1
    from public.chat_participants
    where chat_id = p_chat_id
      and user_id = p_user_id
  );
end;
$$;

-- Chats policies

drop policy if exists "allow insert chats" on public.chats;
create policy "allow insert chats"
  on public.chats
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "allow select participant chats" on public.chats;
create policy "allow select participant chats"
  on public.chats
  for select
  using (public.is_chat_member(id, auth.uid()));

drop policy if exists "allow update participant chats" on public.chats;
create policy "allow update participant chats"
  on public.chats
  for update
  using (public.is_chat_member(id, auth.uid()))
  with check (public.is_chat_member(id, auth.uid()));

-- Chat participant policies

drop policy if exists "allow select chat participants" on public.chat_participants;
create policy "allow select chat participants"
  on public.chat_participants
  for select
  using (public.is_chat_member(chat_id, auth.uid()));

drop policy if exists "allow insert chat participants" on public.chat_participants;
create policy "allow insert chat participants"
  on public.chat_participants
  for insert
  with check (
    auth.uid() = user_id
    or public.is_chat_member(chat_id, auth.uid())
  );

drop policy if exists "allow update own chat participant" on public.chat_participants;
create policy "allow update own chat participant"
  on public.chat_participants
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "allow delete own chat participant" on public.chat_participants;
create policy "allow delete own chat participant"
  on public.chat_participants
  for delete
  using (auth.uid() = user_id);

-- Message policies

drop policy if exists "allow select chat messages" on public.messages;
create policy "allow select chat messages"
  on public.messages
  for select
  using (public.is_chat_member(chat_id, auth.uid()));

drop policy if exists "allow insert chat messages" on public.messages;
create policy "allow insert chat messages"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and public.is_chat_member(chat_id, auth.uid())
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
