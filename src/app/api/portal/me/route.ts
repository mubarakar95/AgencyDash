import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot access portal' }, { status: 403 });
    }

    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const clientId = clientRecord?.id;

    if (!clientId) {
      return NextResponse.json({ profile: { id: user.id, email: user.email, role: profile?.role }, client_id: null });
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, email, company, phone')
      .eq('id', clientId)
      .single();

    return NextResponse.json({
      profile: { id: user.id, email: user.email, role: profile?.role },
      client: clientData,
      client_id: clientId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}