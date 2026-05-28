import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(id, name, company), projects(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();

  // Auto-generate invoice number if not provided
  if (!body.invoice_number) {
    const count = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true });

    const num = (count.count || 0) + 1;
    body.invoice_number = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(num).padStart(4, '0')}`;
  }

  // Calculate amount from line_items if provided
  if (body.line_items && Array.isArray(body.line_items)) {
    body.amount = body.line_items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  }

  if (body.client_id === '') body.client_id = null;
  if (body.project_id === '') body.project_id = null;

  const { data, error } = await supabase.from('invoices').insert(body).select('*, clients(id, name, company), projects(id, name)').single();

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
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  // Calculate amount from line_items if provided
  if (updates.line_items && Array.isArray(updates.line_items)) {
    updates.amount = updates.line_items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  }

  if (updates.client_id === '') updates.client_id = null;
  if (updates.project_id === '') updates.project_id = null;

  const { data, error } = await supabase
    .from('invoices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, clients(id, name, company), projects(id, name)')
    .single();

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
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}