import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ErrorData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const errorData: ErrorData = await request.json();

    // Get user ID if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Insert error log into database
    const { error } = await supabase
      .from('error_logs')
      .insert({
        user_id: user?.id || null,
        error_message: errorData.message,
        error_stack: errorData.stack,
        component_stack: errorData.componentStack,
        user_agent: errorData.userAgent,
        page_url: errorData.url,
        timestamp: errorData.timestamp,
        severity: 'error',
        source: 'frontend'
      });

    if (error) {
      console.error('Failed to log error to database:', error);
      // Don't fail the request if logging fails
    }

    // In production, you might also want to send to external services
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external monitoring service
      // await sendToMonitoringService(errorData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in error logging endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

// Helper function for external monitoring services
async function sendToMonitoringService(errorData: ErrorData) {
  // Implement integration with services like Sentry, LogRocket, etc.
  // Example:
  // await fetch('https://api.sentry.io/...', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.SENTRY_TOKEN}` },
  //   body: JSON.stringify(errorData)
  // });
} 