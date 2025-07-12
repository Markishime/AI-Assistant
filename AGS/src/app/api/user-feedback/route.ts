import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();
    
    const {
      analysisId,
      recommendationId,
      rating,
      helpful,
      comment,
      category,
      improvementSuggestions,
      implemented,
      results
    } = feedbackData;

    console.log('Received feedback data:', feedbackData);

    // Validate required fields
    if (!recommendationId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid feedback data' },
        { status: 400 }
      );
    }

    // Handle temporary IDs for anonymous users (UUID validation)
    let processedAnalysisId = analysisId;
    
    // Check if analysisId is a temporary ID (starts with 'temp-')
    if (analysisId && analysisId.startsWith('temp-')) {
      // For temporary IDs, set analysis_report_id to null since these are not real database records
      processedAnalysisId = null;
      console.log('Processing temporary analysis ID:', analysisId, '-> setting to null for database');
    }

    // Store feedback in database with simplified structure
    const insertData = {
      user_id: null, // Allow anonymous feedback
      analysis_report_id: processedAnalysisId, // null for temporary IDs, UUID for real analysis reports
      recommendation_id: recommendationId,
      rating,
      helpful,
      feedback_text: comment || null,
      category: category || 'usefulness',
      improvement_suggestions: improvementSuggestions || [],
      implemented: implemented || false,
      implementation_results: results || null,
      created_at: new Date().toISOString()
    };

    console.log('Inserting data:', insertData);

    const { data, error } = await supabase
      .from('user_feedback')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback', details: error.message },
        { status: 500 }
      );
    }

    console.log('Successfully inserted feedback:', data);

    // Update analytics (with error handling)
    try {
      await updateFeedbackAnalytics(recommendationId, rating, helpful, category || 'usefulness');
    } catch (analyticsError) {
      console.error('Analytics update failed:', analyticsError);
      // Don't fail the request if analytics update fails
    }

    return NextResponse.json({
      success: true,
      feedback: data,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('User feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');
    const recommendationId = searchParams.get('recommendationId');

    let query = supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (analysisId) {
      query = query.eq('analysis_report_id', analysisId);
    }

    if (recommendationId) {
      query = query.eq('recommendation_id', recommendationId);
    }

    const { data: feedback, error } = await query.limit(100);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Calculate aggregated metrics
    const metrics = calculateFeedbackMetrics(feedback);

    return NextResponse.json({
      success: true,
      feedback,
      metrics,
      totalCount: feedback.length
    });

  } catch (error) {
    console.error('Get feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateFeedbackAnalytics(
  recommendationId: string,
  rating: number,
  helpful: boolean | null,
  category: string
) {
  try {
    // Get existing analytics or create new
    const { data: existingAnalytics } = await supabase
      .from('recommendation_analytics')
      .select('*')
      .eq('recommendation_id', recommendationId)
      .single();

    if (existingAnalytics) {
      // Update existing analytics
      const totalRatings = existingAnalytics.total_ratings + 1;
      const newAverageRating = (
        (existingAnalytics.average_rating * existingAnalytics.total_ratings) + rating
      ) / totalRatings;

      const helpfulCount = existingAnalytics.helpful_count + (helpful === true ? 1 : 0);
      const unhelpfulCount = existingAnalytics.unhelpful_count + (helpful === false ? 1 : 0);

      await supabase
        .from('recommendation_analytics')
        .update({
          total_ratings: totalRatings,
          average_rating: newAverageRating,
          helpful_count: helpfulCount,
          unhelpful_count: unhelpfulCount,
          category_breakdown: {
            ...existingAnalytics.category_breakdown,
            [category]: (existingAnalytics.category_breakdown[category] || 0) + 1
          },
          updated_at: new Date().toISOString()
        })
        .eq('recommendation_id', recommendationId);
    } else {
      // Create new analytics record
      await supabase
        .from('recommendation_analytics')
        .insert({
          recommendation_id: recommendationId,
          total_ratings: 1,
          average_rating: rating,
          helpful_count: helpful === true ? 1 : 0,
          unhelpful_count: helpful === false ? 1 : 0,
          category_breakdown: { [category]: 1 },
          created_at: new Date().toISOString()
        });
    }

    // Store improvement suggestions for ML training
    await storeImprovementData(recommendationId, category, rating);

  } catch (error) {
    console.error('Analytics update error:', error);
  }
}

async function storeImprovementData(
  recommendationId: string,
  category: string,
  rating: number
) {
  try {
    // Store data for ML model training
    await supabase
      .from('ml_training_data')
      .insert({
        data_type: 'user_feedback',
        recommendation_id: recommendationId,
        feedback_category: category,
        rating,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'user_feedback_system',
          version: '1.0'
        }
      });
  } catch (error) {
    console.error('ML training data storage error:', error);
  }
}

function calculateFeedbackMetrics(feedback: any[]) {
  if (feedback.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      helpfulPercentage: 0,
      categoryBreakdown: {},
      implementationRate: 0
    };
  }

  const totalRatings = feedback.length;
  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings;
  
  const helpfulCount = feedback.filter(f => f.helpful === true).length;
  const helpfulPercentage = (helpfulCount / totalRatings) * 100;

  const implementedCount = feedback.filter(f => f.implemented === true).length;
  const implementationRate = (implementedCount / totalRatings) * 100;

  const categoryBreakdown = feedback.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  return {
    averageRating: Math.round(averageRating * 100) / 100,
    totalRatings,
    helpfulPercentage: Math.round(helpfulPercentage),
    categoryBreakdown,
    implementationRate: Math.round(implementationRate)
  };
} 