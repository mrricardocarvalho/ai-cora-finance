-- Migration: create goals table
create table if not exists public.goals (
  id uuid primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) default 0,
  deadline timestamp,
  linked_account_id uuid references accounts(id),
  created_at timestamp default now()
);

alter table public.goals enable row level security;
create policy "Goals: Select own" on public.goals for select using (auth.uid() = user_id);
create policy "Goals: Insert own" on public.goals for insert with check (auth.uid() = user_id);
create policy "Goals: Update own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Goals: Delete own" on public.goals for delete using (auth.uid() = user_id);
