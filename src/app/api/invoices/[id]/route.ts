import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Fetch client and project separately
  let client = null;
  let project = null;

  if (data.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, company, email, address')
      .eq('id', data.client_id)
      .single();
    client = clientData;
  }

  if (data.project_id) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', data.project_id)
      .single();
    project = projectData;
  }

  return NextResponse.json({ ...data, clients: client, projects: project });
}
