import { NextRequest, NextResponse } from 'next/server';
import { supabaseManager } from '@/lib/supabase-manager';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const reports = await supabaseManager.getReports({ limit, offset });
    
    return NextResponse.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
