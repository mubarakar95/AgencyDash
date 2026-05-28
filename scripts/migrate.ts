import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrate() {
  console.log('Running migration: Add quotation_url to projects table');
  
  // The Supabase JS client doesn't support DDL, so we'll use the REST API
  // to check if the column exists and guide the user
  const { data, error } = await supabase
    .from('projects')
    .select('quotation_url')
    .limit(1);

  if (error) {
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      console.log('\n⚠️  The quotation_url column does not exist yet.');
      console.log('Please run this SQL in your Supabase Dashboard SQL Editor:\n');
      console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS quotation_url text;');
      console.log('\nGo to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/editor\n');
    } else {
      console.error('Error:', error.message);
    }
  } else {
    console.log('✅ quotation_url column already exists!');
  }
}

migrate();