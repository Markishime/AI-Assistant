import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get analysis reports count
    const { count: reportsCount, error: reportsError } = await supabase
      .from('analysis_reports')
      .select('*', { count: 'exact', head: true });

    if (reportsError) {
      console.error('Error fetching reports count:', reportsError);
    }

    // Get feedback count
    const { count: feedbackCount, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true });

    if (feedbackError) {
      console.error('Error fetching feedback count:', feedbackError);
    }

    // Get active prompts count
    const { count: activePromptsCount, error: promptsError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (promptsError) {
      console.error('Error fetching prompts count:', promptsError);
    }

    // Calculate stats
    const stats = {
      totalUsers: users?.length || 0,
      totalReports: reportsCount || 0,
      totalFeedback: feedbackCount || 0,
      activePrompts: activePromptsCount || 0,
      avgRating: 0,
      avgConfidence: 0,
      recentActivity: 0
    };

    return NextResponse.json({
      users: users || [],
      stats
    });

  } catch (error) {
    console.error('Error in dashboard stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 