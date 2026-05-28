import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockClients } from '@/data/mockData';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(mockClients);
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*, projects(count)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clientsWithCount = (data || []).map((c: any) => ({
    ...c,
    projects_count: c.projects?.[0]?.count || 0,
  }));

  return NextResponse.json(clientsWithCount);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { data, error } = await supabase.from('clients').insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { id, project_ids, renewal_ids, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  // Update client fields
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If project_ids provided, update those projects to point to this client
  if (Array.isArray(project_ids)) {
    await supabase
      .from('projects')
      .update({ client_id: null })
      .eq('client_id', id);

    if (project_ids.length > 0) {
      await supabase
        .from('projects')
        .update({ client_id: id })
        .in('id', project_ids);
    }
  }

  // If renewal_ids provided, update those renewals to point to this client
  if (Array.isArray(renewal_ids)) {
    await supabase
      .from('renewals')
      .update({ client_id: null })
      .eq('client_id', id);

    if (renewal_ids.length > 0) {
      await supabase
        .from('renewals')
        .update({ client_id: id })
        .in('id', renewal_ids);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}