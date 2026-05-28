import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const clientId = clientRecord?.id;
    if (!clientId) {
      return NextResponse.json([]);
    }

    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', clientId);

    const projectIds = (projects || []).map((p: any) => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('*, projects(id, name)')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}