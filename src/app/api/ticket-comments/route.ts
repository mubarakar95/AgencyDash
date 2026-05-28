import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticket_id');

  let query = supabase
    .from('ticket_comments')
    .select('*')
    .order('created_at', { ascending: true });

  if (ticketId) {
    query = query.eq('ticket_id', ticketId);
  }

  const { data, error } = await query;

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
  const { data, error } = await supabase.from('ticket_comments').insert(body).select().single();

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Comments table not created yet. Please run the migration SQL in your Supabase Dashboard.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}