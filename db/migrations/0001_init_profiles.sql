-- Create public.profiles table and related policies + trigger

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  comfort_floor numeric(10,2) default 0,
  risk_tolerance text,
  onboarding_completed boolean default false,
  onboarding_step integer default 1,
  currency text default 'EUR',
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: users can select and update their own profile
create policy "Profiles: Select own profile" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: Update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger function: insert into public.profiles after auth.users insert
create or replace function public.handle_new_auth_user() returns trigger as $func$
begin
  insert into public.profiles(id, email) values(new.id, new.email) on conflict do nothing;
  return new;
end;
$func$ language plpgsql;

create trigger insert_profile_after_insert
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
