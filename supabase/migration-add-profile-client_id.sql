-- Migration: Add user_id to clients table (links client records to auth users)
-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

-- Remove the wrong-direction column from profiles (if it exists)
ALTER TABLE profiles DROP COLUMN IF EXISTS client_id;

-- Add user_id to clients table to link to auth users
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) UNIQUE;