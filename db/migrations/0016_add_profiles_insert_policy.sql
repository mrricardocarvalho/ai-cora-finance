-- Add INSERT policy to profiles table
-- This allows users to create their own profile if one doesn't exist

-- Drop policy if it exists (for idempotency)
drop policy if exists "Profiles: Insert own profile" on public.profiles;

-- Create insert policy - users can only insert their own profile
create policy "Profiles: Insert own profile" on public.profiles 
  for insert 
  with check (auth.uid() = id);
