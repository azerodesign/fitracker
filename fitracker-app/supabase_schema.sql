-- 1. USERS & AUTH
-- Supabase handles Login/Register automatically via the 'auth.users' table.
-- We don't need to create a table for users, but we reference 'auth.users' in other tables.

-- 2. TRANSACTIONS (Pemasukan & Pengeluaran)
-- Stores all financial records.
create table transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- Links to the logged-in user
  type text check (type in ('Income', 'Expense')) not null, -- Distinguishes Pemasukan vs Pengeluaran
  amount numeric not null,
  category text not null, -- e.g., 'Food', 'Salary'
  date date not null
);

-- 3. BUDGETS
-- Stores budget limits per category for each user.
create table budgets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  category text not null,
  limit_amount numeric not null,
  unique (user_id, category) -- Prevents duplicate budget entries for the same category
);

-- 4. SECURITY (Row Level Security)
-- Ensures users can ONLY see and edit their own data.

-- Enable Security
alter table transactions enable row level security;
alter table budgets enable row level security;

-- Policies for Transactions
create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- Policies for Budgets
create policy "Users can view own budgets" on budgets
  for select using (auth.uid() = user_id);

create policy "Users can insert/update own budgets" on budgets
  for all using (auth.uid() = user_id);
