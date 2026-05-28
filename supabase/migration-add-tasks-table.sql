-- Migration: Add tasks table for internal project task management
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  type text NOT NULL DEFAULT 'task' CHECK (type IN ('bug', 'feature', 'task', 'improvement')),
  assignee_id uuid REFERENCES team_members(id),
  due_date date,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);