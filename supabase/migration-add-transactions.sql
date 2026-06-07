-- Create transactions table for payment tracking
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  type text not null check (type in ('payment', 'invoice')),
  amount decimal(10,2) not null,
  description text,
  payment_method text,
  reference_id text,
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS policies
alter table transactions enable row level security;
create policy "Allow all" on transactions for all using (true) with check (true);
