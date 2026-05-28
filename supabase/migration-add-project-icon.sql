-- Migration: Add icon_url column to projects table
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon_url text;