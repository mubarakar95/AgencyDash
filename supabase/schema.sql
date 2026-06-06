-- Step 1: Create tables in correct order (no foreign keys before referenced tables exist)

-- Profiles Table (links to auth.users for role management)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'developer', 'client')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Clients Table (must be first - referenced by others)
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  company text,
  status text not null default 'lead' check (status in ('active', 'lead', 'inactive')),
  last_contact date,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Team Members Table
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  role text not null,
  tags text[] default '{}',
  workload integer default 0 check (workload >= 0 and workload <= 100),
  active_projects integer default 0,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Projects Table (references clients)
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_id uuid references clients(id),
  status text not null default 'lead' check (status in ('lead', 'quoted', 'active', 'in-progress', 'review', 'delivered', 'maintenance')),
  deadline date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  budget decimal(10,2) default 0,
  spent decimal(10,2) default 0,
  description text,
  quotation_url text,
  icon_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Renewals Table (references clients)
create table if not exists renewals (
  id uuid default gen_random_uuid() primary key,
  asset_name text not null,
  type text not null check (type in ('domain', 'hosting', 'ssl', 'license')),
  client_id uuid references clients(id),
  expiry_date date not null,
  cost decimal(10,2) default 0,
  provider text,
  status text not null default 'safe' check (status in ('safe', 'warning', 'critical', 'expired')),
  auto_renew boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Follow-ups Table (references clients)
create table if not exists follow_ups (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id),
  type text not null check (type in ('proposal', 'project_checkin', 'renewal_notice', 'invoice_reminder', 'custom')),
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'completed', 'snoozed')),
  message text,
  sequence_step integer default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Time Entries Table (references projects and team_members)
create table if not exists time_entries (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  team_member_id uuid references team_members(id),
  description text,
  hours decimal(4,2) not null,
  date date not null,
  billable boolean default true,
  created_at timestamp with time zone default now()
);

-- Tickets Table (support requests from clients)
create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  client_id uuid references clients(id),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ticket Comments Table
create table if not exists ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  author_name text not null,
  author_role text not null default 'client',
  content text not null,
  created_at timestamp with time zone default now()
);

-- Notifications Table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  message text,
  type text not null default 'ticket' check (type in ('ticket', 'renewal', 'followup', 'system')),
  reference_id text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Tasks Table (internal project task management)
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  type text not null default 'task' check (type in ('bug', 'feature', 'task', 'improvement')),
  assignee_id uuid references profiles(id),
  due_date date,
  ticket_id uuid references tickets(id),
  image_url text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Step 2: Enable RLS on all tables
alter table profiles enable row level security;
alter table clients enable row level security;
alter table team_members enable row level security;
alter table projects enable row level security;
alter table renewals enable row level security;
alter table follow_ups enable row level security;
alter table time_entries enable row level security;
alter table tasks enable row level security;

-- Step 3: Create RLS Policies
create policy "Allow all" on profiles for all using (true) with check (true);
create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on team_members for all using (true) with check (true);
create policy "Allow all" on projects for all using (true) with check (true);
create policy "Allow all" on renewals for all using (true) with check (true);
create policy "Allow all" on follow_ups for all using (true) with check (true);
create policy "Allow all" on time_entries for all using (true) with check (true);
create policy "Allow all" on tickets for all using (true) with check (true);
create policy "Allow all" on ticket_comments for all using (true) with check (true);
create policy "Allow all" on notifications for all using (true) with check (true);
create policy "Allow all" on tasks for all using (true) with check (true);

-- Step 3.5: Function to handle new user signup
-- All new users get 'client' role by default. Admins must be manually assigned.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 4: Insert sample data
insert into clients (name, email, phone, company, status, last_contact) values
  ('John Doe', 'john@acme.com', '+1 555-0101', 'Acme Corp', 'active', '2026-05-20'),
  ('Sarah Smith', 'sarah@techstart.io', '+1 555-0102', 'TechStart', 'active', '2026-05-22'),
  ('Mike Johnson', 'mike@greenleaf.org', '+1 555-0103', 'GreenLeaf', 'active', '2026-05-18'),
  ('Emily Davis', 'emily@design.studio', '+1 555-0104', 'DesignStudio', 'inactive', '2026-05-10'),
  ('New Lead Inc', 'contact@newlead.com', '+1 555-0105', 'New Lead Inc', 'lead', '2026-05-24');

insert into team_members (name, email, role, tags, workload, active_projects) values
  ('Alice Chen', 'alice@agency.com', 'Senior Developer', '{frontend,react}', 85, 3),
  ('Bob Smith', 'bob@agency.com', 'Backend Developer', '{backend,node,python}', 60, 2),
  ('Charlie Kim', 'charlie@agency.com', 'Designer', '{ui/ux,figma}', 40, 1),
  ('Dana Lee', 'dana@agency.com', 'DevOps', '{devops,aws,docker}', 70, 2);
