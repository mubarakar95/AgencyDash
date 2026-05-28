-- Migration: Add ticket_id column to tasks table for linking tasks to tickets
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES tickets(id);