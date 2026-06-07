import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getInrAmount(amount: number, currency: string, exchangeRate: number): number {
  if (currency === 'USD') return Math.round(amount * exchangeRate * 100) / 100;
  return amount;
}

function buildTransactionPayload(clientId: string, type: string, amount: number, invoiceNumber: string, referenceId: string, currency: string, exchangeRate: number) {
  const inrAmount = getInrAmount(amount, currency, exchangeRate);
  const payload: any = {
    client_id: clientId,
    type,
    amount: inrAmount,
    description: type === 'payment' ? `Payment for ${invoiceNumber}` : `Invoice ${invoiceNumber}`,
    reference_id: referenceId,
    date: new Date().toISOString().slice(0, 10),
    currency,
  };
  if (currency === 'USD') {
    payload.original_amount = amount;
  }
  return payload;
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(id, name, company, email, address), projects(id, name)')
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

  if (!body.invoice_number) {
    const count = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true });

    const num = (count.count || 0) + 1;
    body.invoice_number = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(num).padStart(4, '0')}`;
  }

  if (body.line_items && Array.isArray(body.line_items)) {
    body.amount = body.line_items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  }

  if (body.client_id === '') body.client_id = null;
  if (body.project_id === '') body.project_id = null;

  const { data, error } = await supabase.from('invoices').insert(body).select('*, clients(id, name, company, email, address), projects(id, name)').single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const currency = body.currency || 'INR';
  const exchangeRate = body.exchange_rate || 1;

  const discount = Number(body.discount || 0);
  const redeemedAmount = Number(body.redeemed_amount || 0);
  const netAmount = data.amount - discount - redeemedAmount;

  // Create invoice transaction (adds to invoiced total, uses net amount)
  if (body.client_id && data.amount) {
    await supabase.from('transactions').insert(
      buildTransactionPayload(body.client_id, 'invoice', Math.max(netAmount, 0), data.invoice_number, data.id, currency, exchangeRate)
    );
  }

  // If marked paid on creation, add payment transaction too (uses net amount)
  if (body.status === 'paid' && body.client_id) {
    const paymentAmount = Math.max(netAmount, 0);
    await supabase.from('transactions').insert(
      buildTransactionPayload(body.client_id, 'payment', paymentAmount, data.invoice_number, data.id, currency, exchangeRate)
    );
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

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, client_id, status, invoice_number, amount, currency, exchange_rate, discount, redeemed_amount')
    .eq('id', id)
    .single();

  if (updates.line_items && Array.isArray(updates.line_items)) {
    updates.amount = updates.line_items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  }

  if (updates.client_id === '') updates.client_id = null;
  if (updates.project_id === '') updates.project_id = null;

  const { data, error } = await supabase
    .from('invoices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, clients(id, name, company, email, address), projects(id, name)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const prevClientId = existing?.client_id;
  const newClientId = updates.client_id ?? prevClientId;
  const prevAmount = existing?.amount;
  const newAmount = updates.amount ?? prevAmount;
  const prevCurrency = existing?.currency || 'INR';
  const newCurrency = updates.currency || prevCurrency;
  const prevExchangeRate = existing?.exchange_rate || 1;
  const newExchangeRate = updates.exchange_rate ?? prevExchangeRate;
  const invoiceNumber = existing?.invoice_number;

  const prevDiscount = Number(existing?.discount || 0);
  const prevRedeemed = Number(existing?.redeemed_amount || 0);
  const newDiscount = Number(updates.discount ?? prevDiscount);
  const newRedeemed = Number(updates.redeemed_amount ?? prevRedeemed);

  const prevInrAmount = getInrAmount(prevAmount || 0, prevCurrency, prevExchangeRate);
  const newInrAmount = getInrAmount(newAmount || 0, newCurrency, newExchangeRate);

  const prevNetAmount = prevInrAmount - prevDiscount - prevRedeemed;
  const newNetAmount = newInrAmount - newDiscount - newRedeemed;

  // -- Handle invoice transaction (tracks invoiced amount) --

  // Amount/currency/rate/discount/redeemed changed: update the invoice transaction
  if (prevNetAmount !== newNetAmount && prevClientId) {
    const txnUpdate: any = { amount: Math.max(newNetAmount, 0), currency: newCurrency };
    if (newCurrency === 'USD') {
      txnUpdate.original_amount = newAmount;
    } else {
      txnUpdate.original_amount = null;
    }
    await supabase
      .from('transactions')
      .update(txnUpdate)
      .eq('reference_id', id)
      .eq('type', 'invoice');
  }

  // Client changed: move transactions to the new client
  if (updates.client_id !== undefined && prevClientId !== newClientId) {
    await supabase
      .from('transactions')
      .update({ client_id: newClientId })
      .eq('reference_id', id)
      .eq('type', 'invoice');
    await supabase
      .from('transactions')
      .update({ client_id: newClientId })
      .eq('reference_id', id)
      .eq('type', 'payment');
  }

  // -- Handle payment transaction (tracks paid amount) --

  // Marked paid: add payment transaction (uses net amount)
  if (updates.status === 'paid' && existing?.status !== 'paid' && newClientId) {
    const paymentAmount = Math.max(newNetAmount, 0);
    await supabase.from('transactions').insert(
      buildTransactionPayload(newClientId, 'payment', paymentAmount, invoiceNumber, id, newCurrency, newExchangeRate)
    );
  }

  // Unmarked paid: remove payment transaction
  if (existing?.status === 'paid' && updates.status && updates.status !== 'paid') {
    await supabase
      .from('transactions')
      .delete()
      .eq('reference_id', id)
      .eq('type', 'payment');
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

  // Delete linked transactions first
  await supabase.from('transactions').delete().eq('reference_id', id);

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
