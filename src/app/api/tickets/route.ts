import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('tickets')
    .select(`*, projects (name), clients (name)`)
    .order('created_at', { ascending: false });

  if (error) {
    // If table doesn't exist yet, return empty array
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
  const { data, error } = await supabase.from('tickets').insert(body).select().single();

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Tickets table not created yet. Please run the migration SQL in your Supabase Dashboard.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for admins/developers (non-critical)
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'developer']);

    if (profiles && profiles.length > 0) {
      const notifications = profiles.map((a: any) => ({
        user_id: a.id,
        title: 'New Ticket: ' + (body.title || 'Support Request'),
        message: `A new ticket has been created: "${body.title}"`,
        type: 'ticket',
        reference_id: data.id,
      }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (e) {
    // Notification creation is non-critical
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
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`*, projects (name), clients (name)`)
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
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('tickets').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}