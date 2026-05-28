import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // Try to select quotation_url to check if column exists
    const { data: checkData, error: checkError } = await supabase
      .from('projects')
      .select('quotation_url')
      .limit(1);

    if (checkError && (checkError.message.includes('column') || checkError.message.includes('does not exist'))) {
      return NextResponse.json({
        needsMigration: true,
        message: 'Please run this SQL in Supabase Dashboard SQL Editor:\n\nALTER TABLE projects ADD COLUMN IF NOT EXISTS quotation_url text;\n\nAlso create a storage bucket:\n\nINSERT INTO storage.buckets (id, name, public) VALUES (\'project-documents\', \'project-documents\', true);\n\nThen set the RLS policy:\n\nCREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow public reads" ON storage.objects FOR SELECT USING (true);',
        sql: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS quotation_url text;',
      });
    }

    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.id === 'project-documents');

    return NextResponse.json({
      needsMigration: false,
      columnExists: true,
      bucketExists: !!bucketExists,
      message: bucketExists
        ? 'All migrations complete!'
        : 'Storage bucket needs to be created. Run the bucket creation SQL.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}