-- Create agency_settings table (single row for the agency/business)
create table if not exists agency_settings (
  id bigint primary key default 1,
  agency_name text not null default 'My Agency',
  agency_address text,
  agency_contact text,
  agency_email text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_ifsc text,
  gst_number text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint single_row check (id = 1)
);

-- Insert default row
insert into agency_settings (id, agency_name) values (1, 'My Agency')
on conflict (id) do nothing;

-- RLS policies
alter table agency_settings enable row level security;
create policy "Allow all" on agency_settings for all using (true) with check (true);
