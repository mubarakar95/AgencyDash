import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULTS = {
  agency_name: 'My Agency',
  agency_address: null,
  agency_contact: null,
  agency_email: null,
  bank_name: null,
  bank_account_name: null,
  bank_account_number: null,
  bank_ifsc: null,
  gst_number: null,
  default_exchange_rate: 83,
};

const ALLOWED_FIELDS = [
  'agency_name', 'agency_address', 'agency_contact', 'agency_email',
  'bank_name', 'bank_account_name', 'bank_account_number', 'bank_ifsc',
  'gst_number', 'default_exchange_rate',
];

export async function GET() {
  if (!supabase) {
    return NextResponse.json(DEFAULTS);
  }

  const { data, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || DEFAULTS);
}

export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();

  const updates: Record<string, any> = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('agency_settings')
    .upsert({ id: 1, ...updates }, { onConflict: 'id' })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || DEFAULTS);
}
