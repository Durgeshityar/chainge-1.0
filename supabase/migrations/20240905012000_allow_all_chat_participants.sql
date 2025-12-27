-- Temporarily allow all operations on chat_participants and messages

drop policy if exists "allow select chat participants" on public.chat_participants;
drop policy if exists "allow insert chat participants" on public.chat_participants;
drop policy if exists "allow update own chat participant" on public.chat_participants;
drop policy if exists "allow delete own chat participant" on public.chat_participants;

create policy "allow all chat_participants"
  on public.chat_participants
  for all
  using (true)
  with check (true);

drop policy if exists "allow select chat messages" on public.messages;
drop policy if exists "allow insert chat messages" on public.messages;
drop policy if exists "allow update own chat messages" on public.messages;
drop policy if exists "allow delete own chat messages" on public.messages;

create policy "allow all chat_messages"
  on public.messages
  for all
  using (true)
  with check (true);
