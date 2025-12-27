-- Temporarily allow all operations on chats (debug)

drop policy if exists "allow insert chats" on public.chats;
drop policy if exists "allow select participant chats" on public.chats;
drop policy if exists "allow update participant chats" on public.chats;
drop policy if exists "allow delete chats" on public.chats;

create policy "allow all chats"
  on public.chats
  for all
  using (true)
  with check (true);
