import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TASKS_SELECT = `*, projects (id, name, icon_url), profiles (id, full_name), tickets (id, title, status)`;

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const project_id = searchParams.get('project_id');
  const ticket_id = searchParams.get('ticket_id');
  const assignee_id = searchParams.get('assignee_id');
  const unassigned = searchParams.get('unassigned');

  let query = supabase
    .from('tasks')
    .select(TASKS_SELECT)
    .order('created_at', { ascending: false });

  if (project_id) {
    query = query.eq('project_id', project_id);
  }
  if (ticket_id) {
    query = query.eq('ticket_id', ticket_id);
  }
  if (assignee_id) {
    query = query.eq('assignee_id', assignee_id);
  }
  if (unassigned === 'true') {
    query = query.is('assignee_id', null);
  }

  const { data, error } = await query;

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json([]);
    }
    if (error.message && error.message.includes('ticket_id')) {
      const fallback = await supabase
        .from('tasks')
        .select(`*, projects (id, name, icon_url), profiles (id, full_name)`)
        .order('created_at', { ascending: false });
      if (fallback.error) {
        if (fallback.error.message && fallback.error.message.includes('does not exist')) {
          return NextResponse.json([]);
        }
        return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      }
      return NextResponse.json(fallback.data);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function createAssignmentNotification(taskId: string, assigneeId: string, taskTitle: string) {
  if (!supabase) return;
  await supabase.from('notifications').insert({
    user_id: assigneeId,
    title: `Assigned: ${taskTitle}`,
    message: `You've been assigned to "${taskTitle}"`,
    type: 'system',
    reference_id: taskId,
    read: false,
  });
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();

  if (body.ticket_id === '') {
    body.ticket_id = null;
  }

  if (body.image_urls && !Array.isArray(body.image_urls)) {
    body.image_urls = [];
  }

  let selectQuery = `*, projects (id, name, icon_url), profiles (id, full_name)`;

  const { data: ticketCheck } = await supabase
    .from('tickets')
    .select('id')
    .limit(1);

  if (ticketCheck) {
    selectQuery += `, tickets (id, title, status)`;
  }

  const { data, error } = await supabase.from('tasks').insert(body).select(selectQuery).single();

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Tasks table not created yet. Please run the migration SQL in your Supabase Dashboard.' }, { status: 503 });
    }
    if (error.message && error.message.includes('ticket_id')) {
      delete body.ticket_id;
      const fallbackData = await supabase.from('tasks').insert(body).select(`*, projects (id, name, icon_url), profiles (id, full_name)`).single();
      if (fallbackData.error) {
        return NextResponse.json({ error: fallbackData.error.message }, { status: 500 });
      }
      return NextResponse.json(fallbackData.data, { status: 201 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data?.assignee_id) {
    createAssignmentNotification(data.id, data.assignee_id, data.title).catch(() => {});
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
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  if (updates.ticket_id === '') {
    updates.ticket_id = null;
  }

  let notifyAssigneeId: string | null = null;

  if (updates.assignee_id) {
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('assignee_id')
      .eq('id', id)
      .single();

    if (currentTask && currentTask.assignee_id !== updates.assignee_id) {
      notifyAssigneeId = updates.assignee_id;
    }
  }

  let selectQuery = `*, projects (id, name, icon_url), profiles (id, full_name)`;

  const { data: ticketCheck } = await supabase
    .from('tickets')
    .select('id')
    .limit(1);

  if (ticketCheck) {
    selectQuery += `, tickets (id, title, status)`;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(selectQuery)
    .single();

  if (error) {
    if (error.message && error.message.includes('ticket_id')) {
      delete updates.ticket_id;
      const fallbackData = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`*, projects (id, name, icon_url), profiles (id, full_name)`)
        .single();
      if (fallbackData.error) {
        return NextResponse.json({ error: fallbackData.error.message }, { status: 500 });
      }
      return NextResponse.json(fallbackData.data);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (notifyAssigneeId && data) {
    createAssignmentNotification(data.id, notifyAssigneeId, data.title).catch(() => {});
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
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
