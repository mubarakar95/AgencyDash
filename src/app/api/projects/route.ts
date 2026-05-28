import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockProjects } from '@/data/mockData';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(mockProjects);
  }

  let { data, error } = await supabase
    .from('projects')
    .select(`*, clients (name)`)
    .order('created_at', { ascending: false });

  if (error && error.message && (error.message.includes('quotation_url') || error.message.includes('icon_url'))) {
    ({ data, error } = await supabase
      .from('projects')
      .select(`id, name, client_id, status, deadline, progress, budget, spent, description, created_at, updated_at, clients (name)`)
      .order('created_at', { ascending: false }));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { data, error } = await supabase.from('projects').insert(body).select().single();

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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const { quotation_url, icon_url, ...safeUpdates } = updates;
  const finalUpdates = { ...safeUpdates, updated_at: new Date().toISOString() };

  const withOptional = {
    ...finalUpdates,
    ...(quotation_url !== undefined ? { quotation_url } : {}),
    ...(icon_url !== undefined ? { icon_url } : {}),
  };

  let data, error;

  ({ data, error } = await supabase
    .from('projects')
    .update(withOptional)
    .eq('id', id)
    .select(`*, clients (name)`)
    .single());

  if (error && error.message && (error.message.includes('quotation_url') || error.message.includes('icon_url'))) {
    const retryUpdates = { ...safeUpdates, updated_at: new Date().toISOString() };
    ({ data, error } = await supabase
      .from('projects')
      .update(retryUpdates)
      .eq('id', id)
      .select(`*, clients (name)`)
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}