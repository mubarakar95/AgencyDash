-- Migration: Add image_urls column to tasks table for screenshots (multiple images)
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';