-- ============================================================
-- MIGRATION: Create task_comments and task_comment_views tables
-- ============================================================
--
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor
-- 2. Paste this ENTIRE script in the SQL editor
-- 3. Click "Run" to execute
-- 4. Refresh the page and verify the tables were created
--
-- ============================================================

-- Step 1: Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  author_name text NOT NULL,
  content text NOT NULL,
  image_urls text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Step 2: Create task_comment_views table
CREATE TABLE IF NOT EXISTS task_comment_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  last_viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Step 3: Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comment_views ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies
CREATE POLICY "Allow all" ON task_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON task_comment_views FOR ALL USING (true) WITH CHECK (true);

-- Verification: Run these queries separately to confirm
-- SELECT * FROM task_comments LIMIT 1;
-- SELECT * FROM task_comment_views LIMIT 1;
