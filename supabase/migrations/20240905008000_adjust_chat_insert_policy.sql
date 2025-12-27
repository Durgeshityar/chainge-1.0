-- Broaden chat insert policy to authenticated users (anon key sessions)

drop policy if exists "allow insert chats" on public.chats;
create policy "allow insert chats"
  on public.chats
  for insert
  with check (auth.uid() is not null);
