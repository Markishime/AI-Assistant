import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'soil' | 'leaf' | 'general' | 'interpretation' | 'recommendations';
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  constraints: string[];
  examples: string[];
  created_at: string;
  updated_at: string;
}

const defaultPrompts: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Malaysia Soil Analysis Prompt',
    description: 'Specialized prompt for analyzing soil samples from Malaysian oil palm plantations',
    template: `You are an expert agronomist specialized in oil palm production in Malaysia. Analyze the provided soil test data with focus on Malaysian growing conditions, peat soil management, and regional best practices.

ANALYSIS DATA:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

KNOWLEDGE BASE CONTEXT:
{referenceContext}

CONSTRAINTS:
- Must reference Malaysian Oil Palm Board (MPOB) guidelines
- Consider tropical climate impacts on nutrient availability
- Address peat soil specific challenges if applicable
- Provide fertilizer recommendations in Malaysian standard units (kg/ha)
- Reference local suppliers and fertilizer brands when relevant
- Consider RSPO sustainability requirements

RESPONSE FORMAT:
Provide detailed, Malaysia-specific analysis in JSON format with interpretation, issues, improvement plan with priority levels, risk assessment, and confidence score.`,
    variables: ['dataValues', 'referenceStandards', 'referenceContext'],
    category: 'soil',
    priority: 'high',
    is_active: true,
    constraints: [
      'Must include MPOB guideline references',
      'Fertilizer rates in kg/ha',
      'Consider peat soil conditions',
      'RSPO compliance mentions',
      'Local climate considerations'
    ],
    examples: [
      'pH optimization for peat soils in Peninsular Malaysia',
      'Potassium management in coastal plantations',
      'Micronutrient deficiency correction in Sabah/Sarawak'
    ]
  },
  {
    name: 'Malaysia Leaf Analysis Prompt',
    description: 'Specialized prompt for analyzing leaf samples from Malaysian oil palm plantations',
    template: `You are an expert agronomist specialized in oil palm foliar analysis in Malaysia. Analyze the provided leaf nutrient data according to Malaysian standards and frond sampling protocols.

ANALYSIS DATA:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

KNOWLEDGE BASE CONTEXT:
{referenceContext}

CONSTRAINTS:
- Use MPOB established critical levels for leaf nutrients
- Consider frond 17 sampling standard
- Account for seasonal variation in Malaysian climate
- Provide recommendations aligned with Malaysia GAP
- Reference local fertilizer products and application methods
- Consider yield targets for Malaysian plantations (25-30 MT FFB/ha)

RESPONSE FORMAT:
Provide detailed, Malaysia-specific foliar analysis in JSON format with interpretation, nutrient status assessment, corrective recommendations, and confidence evaluation.`,
    variables: ['dataValues', 'referenceStandards', 'referenceContext'],
    category: 'leaf',
    priority: 'high',
    is_active: true,
    constraints: [
      'MPOB critical levels reference required',
      'Frond 17 sampling protocol',
      'Seasonal adjustment factors',
      'Malaysian GAP compliance',
      'Yield target considerations (25-30 MT FFB/ha)'
    ],
    examples: [
      'Nitrogen deficiency in mature palms',
      'Potassium-magnesium imbalance correction',
      'Micronutrient optimization for high-yielding varieties'
    ]
  },
  {
    name: 'High-Investment Recommendations',
    description: 'Detailed recommendations for clients with high investment capacity',
    template: `Provide comprehensive, high-investment recommendations focusing on:

INVESTMENT CAPACITY: HIGH
TARGET: Maximum yield optimization and sustainability

RECOMMENDATIONS FOCUS:
- Premium fertilizer products and precision application
- Advanced soil/plant monitoring systems
- Sustainability certifications (RSPO, ISPO)
- Technology integration (IoT, drones, sensors)
- Long-term soil health improvement
- Research-backed innovative practices

CONSTRAINTS:
- Budget considerations: RM 3,000-5,000 per hectare annually
- ROI expectations: 15-25% yield improvement
- Timeline: 12-36 months for full implementation
- Sustainability requirements: Must align with RSPO principles

Provide specific product recommendations, implementation timelines, and expected ROI calculations.`,
    variables: ['analysisData', 'currentYield', 'plantationSize'],
    category: 'recommendations',
    priority: 'high',
    is_active: true,
    constraints: [
      'Budget: RM 3,000-5,000/ha annually',
      '15-25% yield improvement target',
      '12-36 month implementation timeline',
      'RSPO compliance required'
    ],
    examples: [
      'Precision fertilizer application systems',
      'Advanced soil monitoring technology',
      'Premium organic amendments'
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const active_only = url.searchParams.get('active_only') === 'true';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get prompts from database first
    let query = supabase.from('prompt_templates').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data: prompts, error } = await query.order('priority', { ascending: false });

    if (error) {
      console.warn('Database query failed, using default prompts:', error);
      // Return default prompts if database fails
      const filteredDefaults = defaultPrompts.filter(p => 
        (!category || p.category === category) &&
        (!active_only || p.is_active)
      );
      
      return NextResponse.json(filteredDefaults.map((p, index) => ({
        ...p,
        id: `default_${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    }

    // If no prompts in database, initialize with defaults
    if (!prompts || prompts.length === 0) {
      await initializeDefaultPrompts(supabase);
      return NextResponse.json(defaultPrompts.map((p, index) => ({
        ...p,
        id: `default_${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    }

    return NextResponse.json(prompts);

  } catch (error) {
    console.error('Error fetching prompt templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const promptData = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('prompt_templates')
      .insert([{
        ...promptData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating prompt template:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...promptData } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('prompt_templates')
      .update({
        ...promptData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating prompt template:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt template' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initializeDefaultPrompts(supabase: any) {
  try {
    const promptsWithIds = defaultPrompts.map(p => ({
      ...p,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    await supabase.from('prompt_templates').insert(promptsWithIds);
    console.log('Initialized default prompt templates');
  } catch (error) {
    console.error('Failed to initialize default prompts:', error);
  }
}
