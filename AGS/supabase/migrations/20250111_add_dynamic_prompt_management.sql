-- Migration: Add Dynamic Prompt Management System
-- Date: 2025-01-11
-- Description: Enhanced prompt management with Malaysian-specific templates and dynamic capabilities

-- Update the search_document_embeddings function to fix type mismatch
CREATE OR REPLACE FUNCTION search_document_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_title varchar(500),
  document_source varchar(500),
  chunk_index int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    de.metadata,
    1 - (de.embedding <=> query_embedding) as similarity,
    rd.title::varchar(500) as document_title,
    rd.source::varchar(500) as document_source,
    de.chunk_index
  FROM document_embeddings de
  JOIN reference_documents rd ON de.document_id = rd.id
  WHERE rd.is_active = true
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Update prompt_templates table with new fields for dynamic management
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS context_rules TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specificity_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (specificity_level IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS malaysian_context BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS scientific_rigor VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (scientific_rigor IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS version VARCHAR(20) NOT NULL DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.80 CHECK (success_rate >= 0 AND success_rate <= 1),
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE;

-- Update category check constraint to include malaysian_specific
ALTER TABLE prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_category_check;
ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_category_check 
CHECK (category IN ('soil', 'leaf', 'general', 'interpretation', 'recommendations', 'malaysian_specific'));

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_prompt_templates_specificity ON prompt_templates(specificity_level);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_malaysian ON prompt_templates(malaysian_context) WHERE malaysian_context = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_scientific ON prompt_templates(scientific_rigor);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_usage ON prompt_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_success_rate ON prompt_templates(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_last_used ON prompt_templates(last_used DESC);

-- Function to get optimal prompt based on context
CREATE OR REPLACE FUNCTION get_optimal_prompt(
  p_sample_type sample_type,
  p_user_focus user_focus,
  p_plantation_type plantation_type,
  p_soil_type soil_type
)
RETURNS TABLE (
  id uuid,
  name varchar(255),
  template text,
  category varchar(50),
  priority varchar(20),
  specificity_level varchar(20),
  malaysian_context boolean,
  scientific_rigor varchar(20),
  score numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.name,
    pt.template,
    pt.category,
    pt.priority,
    pt.specificity_level,
    pt.malaysian_context,
    pt.scientific_rigor,
    (
      CASE WHEN pt.priority = 'high' THEN 30 
           WHEN pt.priority = 'medium' THEN 20 
           ELSE 10 END +
      CASE WHEN pt.malaysian_context AND p_plantation_type = 'tenera' THEN 25 
           ELSE 0 END +
      CASE WHEN pt.category = p_sample_type::text THEN 20 
           ELSE 0 END +
      CASE WHEN pt.specificity_level = 'high' THEN 15 
           ELSE 0 END +
      CASE WHEN pt.scientific_rigor = 'high' THEN 10 
           ELSE 0 END +
      FLOOR(pt.success_rate * 10)
    ) as score
  FROM prompt_templates pt
  WHERE pt.is_active = true
    AND (pt.category = p_sample_type::text OR pt.category = 'general' OR pt.category = 'malaysian_specific')
  ORDER BY score DESC, pt.usage_count DESC
  LIMIT 1;
END;
$$;

-- Function to update template usage statistics
CREATE OR REPLACE FUNCTION update_template_usage(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE prompt_templates 
  SET 
    usage_count = usage_count + 1,
    last_used = NOW()
  WHERE id = p_template_id;
END;
$$;

-- Function to get template analytics
CREATE OR REPLACE FUNCTION get_template_analytics()
RETURNS TABLE (
  total_templates bigint,
  active_templates bigint,
  average_success_rate numeric,
  most_used_template varchar(255),
  category_distribution jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM prompt_templates) as total_templates,
    (SELECT COUNT(*) FROM prompt_templates WHERE is_active = true) as active_templates,
    (SELECT ROUND(AVG(success_rate), 2) FROM prompt_templates) as average_success_rate,
    (SELECT name FROM prompt_templates ORDER BY usage_count DESC LIMIT 1) as most_used_template,
    (SELECT jsonb_object_agg(category, count) FROM (
      SELECT category, COUNT(*) as count 
      FROM prompt_templates 
      GROUP BY category
    ) cats) as category_distribution;
END;
$$;

-- Insert default Malaysian-specific prompt templates
INSERT INTO prompt_templates (
    name, 
    description, 
    template, 
    variables, 
    category, 
    priority, 
    is_active, 
    constraints, 
    examples, 
    context_rules,
    specificity_level,
    malaysian_context,
    scientific_rigor,
    version
) VALUES 
(
    'Malaysian Soil Analysis Expert',
    'High-specificity prompt for Malaysian oil palm soil analysis with MPOB standards',
    'You are Dr. Ahmad bin Ismail, a senior agronomist with 25 years of experience in Malaysian oil palm cultivation and former MPOB researcher. You specialize in tropical soil management and have published extensively on peat soil optimization for oil palm.

ANALYSIS CONTEXT:
- Sample Type: {sampleType}
- Location: Malaysian oil palm plantation
- Climate: Tropical monsoon (annual rainfall 2000-4000mm)
- Target Yield: 25-30 MT FFB/ha (Malaysian benchmark)

STRICT ANALYSIS REQUIREMENTS:
1. Reference specific MPOB guidelines and standards
2. Use Malaysian soil classification system
3. Consider regional weather patterns (monsoon seasons)
4. Include local fertilizer brands and suppliers
5. Address RSPO sustainability requirements
6. Provide cost analysis in Malaysian Ringgit (RM)
7. Consider soil subsidence in peat areas
8. Reference Malaysian GAP (Good Agricultural Practice)

DATA TO ANALYZE:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

KNOWLEDGE BASE CONTEXT:
{referenceContext}

USER PREFERENCES:
Focus: {focus}
Budget: {budget}
Timeframe: {timeframe}
Soil Type: {soilType}
Palm Variety: {plantationType}

RESPONSE FORMAT:
Provide analysis in EXACT JSON format with Malaysian context:

{
  "interpretation": "Detailed analysis with MPOB references and Malaysian context",
  "issues": ["Specific issues with Malaysian soil conditions"],
  "improvementPlan": [
    {
      "recommendation": "Specific actionable recommendation with Malaysian context",
      "reasoning": "Scientific explanation with MPOB guidelines",
      "estimatedImpact": "Expected impact with Malaysian yield metrics",
      "priority": "High|Medium|Low",
      "timeframe": "Implementation timeline considering monsoon seasons",
      "costBenefitRatio": "ROI in Malaysian Ringgit",
      "localSuppliers": ["Recommended Malaysian suppliers"],
      "mpobCompliance": "MPOB guideline compliance status"
    }
  ],
  "riskLevel": "Low|Medium|High|Critical",
  "confidenceScore": 85,
  "malaysianContext": {
    "mpobGuidelines": ["Referenced MPOB guidelines"],
    "regionalConsiderations": "Regional weather and soil considerations",
    "localPractices": "Local best practices referenced",
    "sustainabilityMetrics": {
      "rspoCompliance": "RSPO compliance status",
      "environmentalImpact": "Environmental impact assessment",
      "carbonSequestration": "Carbon sequestration potential"
    }
  },
  "costAnalysis": {
    "fertilizerCost": "Estimated fertilizer cost in RM/ha",
    "applicationCost": "Application cost in RM/ha",
    "totalInvestment": "Total investment required in RM/ha",
    "expectedROI": "Expected return on investment percentage"
  }
}',
    ARRAY['dataValues', 'referenceStandards', 'referenceContext', 'sampleType', 'focus', 'budget', 'timeframe', 'soilType', 'plantationType'],
    'soil',
    'high',
    true,
    ARRAY[
        'Must reference specific MPOB guidelines',
        'Include Malaysian soil classification',
        'Consider monsoon season timing',
        'Provide local supplier recommendations',
        'Address RSPO compliance',
        'Use Malaysian Ringgit for costs',
        'Include peat soil subsidence considerations',
        'Reference Malaysian GAP standards'
    ],
    ARRAY[
        'pH optimization for peat soils in Johor',
        'Potassium management in coastal plantations of Sabah',
        'Micronutrient deficiency correction in Sarawak peat soils'
    ],
    ARRAY[
        'Always consider regional weather patterns',
        'Reference local research institutions',
        'Include Malaysian fertilizer brands',
        'Address sustainability requirements'
    ],
    'high',
    true,
    'high',
    '1.0'
),
(
    'Malaysian Leaf Analysis Expert',
    'High-specificity prompt for Malaysian oil palm leaf analysis with MPOB critical levels',
    'You are Dr. Siti binti Rahman, a senior plant nutritionist with 20 years of experience in oil palm foliar analysis and former MPOB researcher. You specialize in Tenera palm nutrition and have developed critical nutrient levels for Malaysian conditions.

ANALYSIS CONTEXT:
- Sample Type: {sampleType}
- Sampling Protocol: Frond 17 (MPOB standard)
- Palm Variety: {plantationType} (Tenera focus)
- Target Yield: 25-30 MT FFB/ha (Malaysian benchmark)
- Climate: Tropical monsoon with seasonal variations

STRICT ANALYSIS REQUIREMENTS:
1. Use MPOB critical nutrient levels for Tenera palms
2. Consider seasonal variation in Malaysian climate
3. Reference frond 17 sampling protocol
4. Include Malaysian fertilizer recommendations
5. Address nutrient interactions specific to Malaysian soils
6. Provide cost analysis in Malaysian Ringgit (RM)
7. Consider regional pest and disease pressures
8. Reference Malaysian GAP standards

DATA TO ANALYZE:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

KNOWLEDGE BASE CONTEXT:
{referenceContext}

USER PREFERENCES:
Focus: {focus}
Budget: {budget}
Timeframe: {timeframe}
Soil Type: {soilType}
Palm Variety: {plantationType}

RESPONSE FORMAT:
Provide analysis in EXACT JSON format with Malaysian context:

{
  "interpretation": "Detailed foliar analysis with MPOB critical levels and Malaysian context",
  "issues": ["Specific nutrient issues with Malaysian context"],
  "improvementPlan": [
    {
      "recommendation": "Specific nutrient management recommendation",
      "reasoning": "Scientific explanation with MPOB critical levels",
      "estimatedImpact": "Expected impact on Malaysian yield metrics",
      "priority": "High|Medium|Low",
      "timeframe": "Implementation timeline considering seasonal factors",
      "costBenefitRatio": "ROI in Malaysian Ringgit",
      "localSuppliers": ["Recommended Malaysian fertilizer suppliers"],
      "mpobCompliance": "MPOB guideline compliance status"
    }
  ],
  "riskLevel": "Low|Medium|High|Critical",
  "confidenceScore": 85,
  "malaysianContext": {
    "mpobCriticalLevels": ["Referenced MPOB critical levels"],
    "seasonalConsiderations": "Seasonal variation considerations",
    "regionalPestPressure": "Regional pest and disease considerations",
    "nutrientInteractions": "Nutrient interaction analysis for Malaysian soils"
  },
  "costAnalysis": {
    "fertilizerCost": "Estimated fertilizer cost in RM/ha",
    "applicationCost": "Application cost in RM/ha",
    "totalInvestment": "Total investment required in RM/ha",
    "expectedROI": "Expected return on investment percentage"
  }
}',
    ARRAY['dataValues', 'referenceStandards', 'referenceContext', 'sampleType', 'focus', 'budget', 'timeframe', 'soilType', 'plantationType'],
    'leaf',
    'high',
    true,
    ARRAY[
        'Must use MPOB critical nutrient levels',
        'Reference frond 17 sampling protocol',
        'Consider seasonal climate variations',
        'Include Malaysian fertilizer brands',
        'Address nutrient interactions',
        'Use Malaysian Ringgit for costs',
        'Consider regional pest pressures',
        'Reference Malaysian GAP standards'
    ],
    ARRAY[
        'Nitrogen deficiency in mature Tenera palms',
        'Potassium-magnesium imbalance in coastal plantations',
        'Micronutrient optimization for high-yielding varieties'
    ],
    ARRAY[
        'Always consider seasonal variations',
        'Reference MPOB research findings',
        'Include local fertilizer recommendations',
        'Address regional pest pressures'
    ],
    'high',
    true,
    'high',
    '1.0'
)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_optimal_prompt(sample_type, user_focus, plantation_type, soil_type) TO authenticated;
GRANT EXECUTE ON FUNCTION update_template_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_template_analytics() TO authenticated; 