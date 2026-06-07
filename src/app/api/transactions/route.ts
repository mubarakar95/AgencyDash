import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  let query = supabase
    .from('transactions')
    .select('*, clients(name, company)')
    .order('date', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();

  if (!body.client_id || !body.amount) {
    return NextResponse.json({ error: 'client_id and amount are required' }, { status: 400 });
  }

  const currency = body.currency || 'INR';
  const exchangeRate = body.exchange_rate || 1;
  const inrAmount = currency === 'USD' ? Math.round(body.amount * exchangeRate * 100) / 100 : body.amount;

  const insertPayload: any = {
    client_id: body.client_id,
    type: body.type || 'payment',
    amount: inrAmount,
    description: body.description || null,
    payment_method: body.payment_method || null,
    reference_id: body.reference_id || null,
    date: body.date || new Date().toISOString().slice(0, 10),
    currency,
  };
  if (currency === 'USD') {
    insertPayload.original_amount = body.amount;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertPayload)
    .select('*, clients(name, company)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
