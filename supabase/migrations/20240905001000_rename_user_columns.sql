-- Rename snake_case columns to camelCase for adapter compatibility

alter table public.users rename column display_name to "displayName";
alter table public.users rename column avatar_url to "avatarUrl";
alter table public.users rename column cover_image to "coverImage";
alter table public.users rename column follower_count to "followerCount";
alter table public.users rename column following_count to "followingCount";
alter table public.users rename column activity_tracker to "activityTracker";
alter table public.users rename column date_of_birth to "dateOfBirth";
alter table public.users rename column created_at to "createdAt";
alter table public.users rename column updated_at to "updatedAt";

-- Recreate the updated_at trigger to use the new column name

drop trigger if exists trigger_users_updated_at on public.users;
drop function if exists public.set_users_updated_at();

create or replace function public.set_users_updated_at()
returns trigger as $$
begin
  new."updatedAt" = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trigger_users_updated_at
before update on public.users
for each row
execute function public.set_users_updated_at();
