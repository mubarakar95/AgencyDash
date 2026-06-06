import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task_id');
  const taskIds = searchParams.get('task_ids');
  const action = searchParams.get('action');

  if (action === 'counts') {
    const { data, error } = await supabase
      .from('task_comments')
      .select('task_id, id')
      .in('task_id', taskIds ? taskIds.split(',') : []);

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        return NextResponse.json({});
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((c: { task_id: string }) => {
      counts[c.task_id] = (counts[c.task_id] || 0) + 1;
    });
    return NextResponse.json(counts);
  }

  if (action === 'views') {
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({});
    }

    const { data, error } = await supabase
      .from('task_comment_views')
      .select('task_id, last_viewed_at')
      .eq('user_id', userId);

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        return NextResponse.json({});
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const views: Record<string, string> = {};
    (data || []).forEach((v: { task_id: string; last_viewed_at: string }) => {
      views[v.task_id] = v.last_viewed_at;
    });
    return NextResponse.json(views);
  }

  let query = supabase
    .from('task_comments')
    .select('*')
    .order('created_at', { ascending: true });

  if (taskId) {
    query = query.eq('task_id', taskId);
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

  if (body.image_urls && !Array.isArray(body.image_urls)) {
    body.image_urls = [];
  }

  const { data, error } = await supabase.from('task_comments').insert(body).select().single();

  if (error) {
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Task comments table not created yet. Please run the migration SQL in your Supabase Dashboard.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { action, task_id, user_id } = body;

  if (action === 'mark_viewed' && task_id && user_id) {
    const { data: existing } = await supabase
      .from('task_comment_views')
      .select('id')
      .eq('task_id', task_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('task_comment_views')
        .update({ last_viewed_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('task_comment_views')
        .insert({ task_id, user_id, last_viewed_at: new Date().toISOString() });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
