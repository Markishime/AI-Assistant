import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all prompts with their usage statistics
    const { data: prompts, error } = await supabase
      .from('dynamic_prompts')
      .select(`
        id,
        name,
        category,
        prompt_text,
        usage_count,
        last_used,
        created_at,
        updated_at,
        metadata
      `)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }

    // Calculate metrics for each prompt
    const promptMetrics = await Promise.all(
      (prompts || []).map(async (prompt) => {
        // Get analyses that used this prompt
        const { data: analyses } = await supabase
      .from('analysis_reports')
          .select('confidence_score, created_at')
          .eq('prompt_id', prompt.id)
          .limit(100);

        // Calculate performance metrics
        let avgConfidence = 0;
        let performanceScore = 0;
        let malaysianContextScore = 0;

        if (analyses && analyses.length > 0) {
          // Average confidence score
          avgConfidence = analyses.reduce((sum, analysis) => 
            sum + (analysis.confidence_score || 0), 0) / analyses.length;

          // Performance score based on confidence and usage
          performanceScore = Math.min(
            (avgConfidence * 0.7) + (Math.min(prompt.usage_count || 0, 100) * 0.3),
            100
          );
        } else {
          // Default scores for unused prompts
          avgConfidence = 50;
          performanceScore = 30;
        }

        // Calculate Malaysian context score from prompt content
        malaysianContextScore = calculatePromptMalaysianScore(prompt.prompt_text || '');

        return {
          id: prompt.id,
          name: prompt.name,
          category: prompt.category,
          usage_count: prompt.usage_count || 0,
          avg_confidence: Math.round(avgConfidence),
          last_used: prompt.last_used || prompt.created_at,
          performance_score: Math.round(performanceScore),
          malaysian_context_score: Math.round(malaysianContextScore * 100),
          created_at: prompt.created_at,
          updated_at: prompt.updated_at
        };
      })
    );

    // Calculate overall statistics
    const totalPrompts = promptMetrics.length;
    const activePrompts = promptMetrics.filter(p => p.usage_count > 0).length;
    const avgPerformance = totalPrompts > 0 ? 
      promptMetrics.reduce((sum, p) => sum + p.performance_score, 0) / totalPrompts : 0;
    const avgMalaysianScore = totalPrompts > 0 ? 
      promptMetrics.reduce((sum, p) => sum + p.malaysian_context_score, 0) / totalPrompts : 0;

    // Get top performing prompts
    const topPrompts = promptMetrics
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, 5);

    // Get recently used prompts
    const recentPrompts = promptMetrics
      .filter(p => p.last_used)
      .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())
      .slice(0, 5);

    return NextResponse.json({
      metrics: promptMetrics,
      summary: {
        totalPrompts,
        activePrompts,
        avgPerformance: Math.round(avgPerformance),
        avgMalaysianScore: Math.round(avgMalaysianScore),
        topPrompts,
        recentPrompts
      }
    });

  } catch (error) {
    console.error('Error fetching prompt analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt analytics' },
      { status: 500 }
    );
  }
}

function calculatePromptMalaysianScore(promptText: string): number {
  const content = promptText.toLowerCase();
  let score = 0;

  // Check for Malaysian-specific terms
  const malaysianTerms = [
    'malaysia', 'malaysian', 'peninsular malaysia', 'sabah', 'sarawak',
    'johor', 'pahang', 'perak', 'kedah', 'selangor', 'negeri sembilan',
    'melaka', 'kelantan', 'terengganu', 'perlis', 'putrajaya', 'kuala lumpur'
  ];

  for (const term of malaysianTerms) {
    if (content.includes(term)) {
      score += 0.15;
      break; // Only count once
    }
  }

  // Check for Malaysian institutions
  const institutions = [
    'mpob', 'upm', 'felda', 'felcra', 'sime darby', 'genting plantations',
    'universiti putra malaysia', 'malaysian palm oil board',
    'federal land development authority'
  ];

  for (const institution of institutions) {
    if (content.includes(institution)) {
      score += 0.1;
      break;
    }
  }

  // Check for Malaysian certifications
  const certifications = ['rspo', 'mspo', 'ispo', 'roundtable sustainable palm oil'];
  for (const cert of certifications) {
    if (content.includes(cert)) {
      score += 0.08;
      break;
    }
  }

  // Check for Malaysian soil types
  const soilTypes = ['ultisols', 'oxisols', 'inceptisols', 'entisols', 'histosols', 'peat soil'];
  for (const soil of soilTypes) {
    if (content.includes(soil)) {
      score += 0.07;
      break;
    }
  }

  // Check for Malaysian climate terms
  const climateTerms = ['tropical rainforest', 'equatorial', 'monsoon', 'humid tropical'];
  for (const climate of climateTerms) {
    if (content.includes(climate)) {
      score += 0.06;
      break;
    }
  }

  // Check for Malaysian diseases and pests
  const diseases = ['ganoderma', 'basal stem rot', 'rhinoceros beetle', 'bagworm'];
  for (const disease of diseases) {
    if (content.includes(disease)) {
      score += 0.05;
      break;
    }
  }

  // Check for Malaysian research context
  const researchTerms = ['plantation', 'smallholder', 'estate', 'mill', 'fresh fruit bunch', 'ffb'];
  for (const term of researchTerms) {
    if (content.includes(term)) {
      score += 0.03;
      break;
    }
  }

  // Check for Malaysian units and standards
  const malaysianUnits = ['ringgit', 'rm', 'hectare', 'ha', 'tonnes per hectare'];
  for (const unit of malaysianUnits) {
    if (content.includes(unit)) {
      score += 0.02;
      break;
    }
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, promptId, data } = body;

    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'update_prompt':
        const { error: updateError } = await supabase
          .from('dynamic_prompts')
          .update({
            name: data.name,
            category: data.category,
            prompt_text: data.prompt_text,
            updated_at: new Date().toISOString()
          })
          .eq('id', promptId);

        if (updateError) {
          return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });

      case 'delete_prompt':
        const { error: deleteError } = await supabase
          .from('dynamic_prompts')
          .delete()
          .eq('id', promptId);

        if (deleteError) {
          return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });

      case 'create_prompt':
        const { error: createError } = await supabase
          .from('dynamic_prompts')
          .insert({
            name: data.name,
            category: data.category,
            prompt_text: data.prompt_text,
            usage_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in prompt analytics POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 