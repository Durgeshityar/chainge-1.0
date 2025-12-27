-- Ensure anon/authenticated roles can interact with chat tables under RLS

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.chats to anon, authenticated;
grant select, insert, update, delete on table public.chat_participants to anon, authenticated;
grant select, insert, update, delete on table public.messages to anon, authenticated;
