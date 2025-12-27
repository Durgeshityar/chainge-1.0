-- Allow chat inserts for any session (frontend already requires auth)

drop policy if exists "allow insert chats" on public.chats;
create policy "allow insert chats"
  on public.chats
  for insert
  with check (true);
