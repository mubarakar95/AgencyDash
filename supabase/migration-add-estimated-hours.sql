-- Migration: Add estimated_hours column to tasks table
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours numeric(6,2);