-- Revert user columns to snake_case for Postgres friendliness

alter table public.users rename column "displayName" to display_name;
alter table public.users rename column "avatarUrl" to avatar_url;
alter table public.users rename column "coverImage" to cover_image;
alter table public.users rename column "followerCount" to follower_count;
alter table public.users rename column "followingCount" to following_count;
alter table public.users rename column "activityTracker" to activity_tracker;
alter table public.users rename column "dateOfBirth" to date_of_birth;
alter table public.users rename column "createdAt" to created_at;
alter table public.users rename column "updatedAt" to updated_at;

-- Update trigger to match snake_case column

drop trigger if exists trigger_users_updated_at on public.users;
drop function if exists public.set_users_updated_at();

create or replace function public.set_users_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trigger_users_updated_at
before update on public.users
for each row
execute function public.set_users_updated_at();
