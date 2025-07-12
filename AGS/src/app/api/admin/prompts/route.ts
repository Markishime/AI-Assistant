import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to check admin (stub, replace with real auth check if needed)
async function isAdmin(request: Request) {
  // TODO: Implement real admin check
  return true;  
}

export async function GET(request: Request) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('prompts_templates').select('*').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prompts: data });
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const supabase = createClient(supabaseUrl, supabaseKey);
  const body = await request.json();
  const { data, error } = await supabase.from('prompts').insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prompt: data[0] });
}

export async function PUT(request: Request) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const supabase = createClient(supabaseUrl, supabaseKey);
  const body = await request.json();
  const { id, ...update } = body;
  const { data, error } = await supabase.from('prompts').update(update).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prompt: data[0] });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = await request.json();
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
