import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { id } = await params;

    if (!userId || userId === 'null' || userId === 'undefined') {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the specific analysis result
    const { data: analysis, error } = await supabase
      .from('analysis_reports')
      .select(`
        id,
        sample_type,
        input_data,
        analysis_result,
        confidence_score,
        risk_level,
        processing_time_ms,
        created_at,
        user_preferences
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Return the raw database format for the ScientificReportDisplay component
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error in analysis fetch API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
} 