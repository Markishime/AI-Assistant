import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Define analytics event schema directly here
const analyticsEventSchema = z.object({
  eventName: z.string(),
  eventCategory: z.string(), 
  eventAction: z.string(),
  eventLabel: z.string().optional(),
  eventValue: z.number().optional(),
  customDimensions: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.number(),
  page: z.string(),
  userAgent: z.string(),
});

interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  customDimensions?: { [key: string]: any };
  userId?: string;
  sessionId: string;
  timestamp: number;
  page: string;
  userAgent: string;
}

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();
    const validatedData = analyticsEventSchema.parse(body);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const analyticsData = validatedData as AnalyticsEvent;

      // Extract useful information from user agent
      const deviceInfo = extractDeviceInfo(analyticsData.userAgent);
      
      // Store analytics event
      const { error: insertError } = await supabase
        .from('analytics_events')
        .insert({
          session_id: analyticsData.sessionId,
          user_id: analyticsData.userId || null,
          event_name: analyticsData.eventName,
          event_category: analyticsData.eventCategory,
          event_action: analyticsData.eventAction,
          event_label: analyticsData.eventLabel,
          event_value: analyticsData.eventValue,
          custom_dimensions: analyticsData.customDimensions || {},
          page_url: analyticsData.page,
          user_agent: analyticsData.userAgent,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          timestamp: new Date(analyticsData.timestamp).toISOString(),
        });

      if (insertError) {
        console.error('Error inserting analytics event:', insertError);
        return NextResponse.json(
          { error: 'Failed to store analytics event' },
          { status: 500 }
        );
      }

      // Update session data if it's a new session or significant event
      if (analyticsData.eventName === 'page_view' || analyticsData.eventName === 'session_start') {
        await updateSessionData(supabase, analyticsData, deviceInfo);
      }

      // Process real-time analytics for dashboard
      await processRealtimeAnalytics(supabase, analyticsData);

      return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateSessionData(supabase: any, analyticsData: AnalyticsEvent, deviceInfo: any) {
  try {
    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', analyticsData.sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date(analyticsData.timestamp).toISOString(),
          page_views: existingSession.page_views + (analyticsData.eventName === 'page_view' ? 1 : 0),
          events_count: existingSession.events_count + 1,
        })
        .eq('session_id', analyticsData.sessionId);
    } else {
      // Create new session
      await supabase
        .from('user_sessions')
        .insert({
          session_id: analyticsData.sessionId,
          user_id: analyticsData.userId || null,
          start_time: new Date(analyticsData.timestamp).toISOString(),
          last_activity: new Date(analyticsData.timestamp).toISOString(),
          page_views: analyticsData.eventName === 'page_view' ? 1 : 0,
          events_count: 1,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          user_agent: analyticsData.userAgent,
        });
    }
  } catch (error) {
    console.error('Error updating session data:', error);
  }
}

async function processRealtimeAnalytics(supabase: any, analyticsData: AnalyticsEvent) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Update daily metrics
    const { data: existingMetric } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('date', today)
      .eq('metric_type', analyticsData.eventCategory)
      .single();

    if (existingMetric) {
      await supabase
        .from('daily_analytics')
        .update({
          value: existingMetric.value + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMetric.id);
    } else {
      await supabase
        .from('daily_analytics')
        .insert({
          date: today,
          metric_type: analyticsData.eventCategory,
          metric_name: analyticsData.eventAction,
          value: 1,
        });
    }

    // Track popular pages
    if (analyticsData.eventName === 'page_view') {
      const { data: existingPage } = await supabase
        .from('page_analytics')
        .select('*')
        .eq('page_url', analyticsData.page)
        .eq('date', today)
        .single();

      if (existingPage) {
        await supabase
          .from('page_analytics')
          .update({
            views: existingPage.views + 1,
            unique_users: existingPage.unique_users + (analyticsData.userId ? 1 : 0),
          })
          .eq('id', existingPage.id);
      } else {
        await supabase
          .from('page_analytics')
          .insert({
            page_url: analyticsData.page,
            date: today,
            views: 1,
            unique_users: analyticsData.userId ? 1 : 0,
          });
      }
    }

    // Track feature usage
    if (analyticsData.eventCategory === 'feature') {
      const { data: existingFeature } = await supabase
        .from('feature_analytics')
        .select('*')
        .eq('feature_name', analyticsData.eventLabel)
        .eq('date', today)
        .single();

      if (existingFeature) {
        await supabase
          .from('feature_analytics')
          .update({
            usage_count: existingFeature.usage_count + 1,
            unique_users: existingFeature.unique_users + (analyticsData.userId ? 1 : 0),
          })
          .eq('id', existingFeature.id);
      } else {
        await supabase
          .from('feature_analytics')
          .insert({
            feature_name: analyticsData.eventLabel,
            action: analyticsData.eventAction,
            date: today,
            usage_count: 1,
            unique_users: analyticsData.userId ? 1 : 0,
          });
      }
    }

  } catch (error) {
    console.error('Error processing real-time analytics:', error);
  }
}

function extractDeviceInfo(userAgent: string) {
  const deviceInfo = {
    deviceType: 'unknown',
    browser: 'unknown',
    os: 'unknown',
  };

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceInfo.deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
  } else {
    deviceInfo.deviceType = 'desktop';
  }

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    deviceInfo.browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    deviceInfo.browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    deviceInfo.browser = 'Opera';
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    deviceInfo.os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    deviceInfo.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    deviceInfo.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    deviceInfo.os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceInfo.os = 'iOS';
  }

  return deviceInfo;
}

// GET endpoint for analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const url = new URL(request.url);
    const metric = url.searchParams.get('metric');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let query = supabase.from('analytics_events').select('*');

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    if (metric) {
      query = query.eq('event_category', metric);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process data for dashboard
    const processedData = processAnalyticsData(data || []);

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processAnalyticsData(events: any[]) {
  const summary = {
    totalEvents: events.length,
    uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
    uniqueSessions: new Set(events.map(e => e.session_id)).size,
    topPages: {} as { [key: string]: number },
    topEvents: {} as { [key: string]: number },
    deviceTypes: {} as { [key: string]: number },
    browsers: {} as { [key: string]: number },
    dailyStats: {} as { [key: string]: number },
  };

  events.forEach(event => {
    // Top pages
    if (event.page_url) {
      summary.topPages[event.page_url] = (summary.topPages[event.page_url] || 0) + 1;
    }

    // Top events
    const eventKey = `${event.event_category}:${event.event_action}`;
    summary.topEvents[eventKey] = (summary.topEvents[eventKey] || 0) + 1;

    // Device types
    if (event.device_type) {
      summary.deviceTypes[event.device_type] = (summary.deviceTypes[event.device_type] || 0) + 1;
    }

    // Browsers
    if (event.browser) {
      summary.browsers[event.browser] = (summary.browsers[event.browser] || 0) + 1;
    }

    // Daily stats
    const date = event.timestamp.split('T')[0];
    summary.dailyStats[date] = (summary.dailyStats[date] || 0) + 1;
  });

  return summary;
} 