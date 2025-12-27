-- Ensure realtime captures full row data for chat tables

alter table if exists public.chats replica identity full;
alter table if exists public.chat_participants replica identity full;
alter table if exists public.messages replica identity full;
