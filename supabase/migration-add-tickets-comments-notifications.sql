-- ============================================================
-- MIGRATION: Create tickets, ticket_comments, and notifications
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor
-- 2. Paste this ENTIRE script in the SQL editor
-- 3. Click "Run" to execute
-- 4. Refresh the page and verify the tables were created
--
-- ============================================================

-- Step 1: Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id),
  client_id uuid REFERENCES clients(id),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT 'client',
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 3: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'ticket' CHECK (type IN ('ticket', 'renewal', 'followup', 'system')),
  reference_id text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 4: Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies
CREATE POLICY "Allow all" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ticket_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Verification: Run these queries separately to confirm
-- SELECT * FROM tickets LIMIT 1;
-- SELECT * FROM ticket_comments LIMIT 1;
-- SELECT * FROM notifications LIMIT 1;