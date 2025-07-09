-- Migration: Add prompt management system
-- Date: 2025-01-10
-- Description: Add prompt_templates table and policies for dynamic prompt management

-- Enhanced prompt management system for dynamic prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL CHECK (category IN ('soil', 'leaf', 'general', 'interpretation', 'recommendations')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    constraints TEXT[] DEFAULT '{}',
    examples TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Indexes for prompt templates
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_priority ON prompt_templates(priority);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_at ON prompt_templates(created_at DESC);

-- Function to update updated_at for prompt templates
CREATE OR REPLACE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for prompt_templates
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to active prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Allow authenticated read access to all prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Allow admin management of prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Allow system operations on prompt templates" ON prompt_templates;

-- Allow all users to read active prompt templates
CREATE POLICY "Allow read access to active prompt templates" ON prompt_templates
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all prompt templates
CREATE POLICY "Allow authenticated read access to all prompt templates" ON prompt_templates
    FOR SELECT TO authenticated USING (true);

-- Allow service role and admin users to manage prompt templates
CREATE POLICY "Allow admin management of prompt templates" ON prompt_templates
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE role = 'admin'
        )
    );

-- Allow system operations (for API initialization)
CREATE POLICY "Allow system operations on prompt templates" ON prompt_templates
    FOR ALL TO service_role USING (true);

-- Insert default prompt templates
INSERT INTO prompt_templates (name, description, template, variables, category, priority, is_active, constraints, examples) VALUES
(
    'Malaysia Soil Analysis Prompt',
    'Specialized prompt for analyzing soil samples from Malaysian oil palm plantations',
    'You are an expert agronomist specialized in oil palm production in Malaysia. Analyze the provided soil test data with focus on Malaysian growing conditions, peat soil management, and regional best practices.

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
Provide detailed, Malaysia-specific analysis in JSON format with interpretation, issues, improvement plan with priority levels, risk assessment, and confidence score.',
    ARRAY['dataValues', 'referenceStandards', 'referenceContext'],
    'soil',
    'high',
    true,
    ARRAY['Must include MPOB guideline references', 'Fertilizer rates in kg/ha', 'Consider peat soil conditions', 'RSPO compliance mentions', 'Local climate considerations'],
    ARRAY['pH optimization for peat soils in Peninsular Malaysia', 'Potassium management in coastal plantations', 'Micronutrient deficiency correction in Sabah/Sarawak']
),
(
    'Malaysia Leaf Analysis Prompt',
    'Specialized prompt for analyzing leaf samples from Malaysian oil palm plantations',
    'You are an expert agronomist specialized in oil palm foliar analysis in Malaysia. Analyze the provided leaf nutrient data according to Malaysian standards and frond sampling protocols.

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
Provide detailed, Malaysia-specific foliar analysis in JSON format with interpretation, nutrient status assessment, corrective recommendations, and confidence evaluation.',
    ARRAY['dataValues', 'referenceStandards', 'referenceContext'],
    'leaf',
    'high',
    true,
    ARRAY['MPOB critical levels reference required', 'Frond 17 sampling protocol', 'Seasonal adjustment factors', 'Malaysian GAP compliance', 'Yield target considerations (25-30 MT FFB/ha)'],
    ARRAY['Nitrogen deficiency in mature palms', 'Potassium-magnesium imbalance correction', 'Micronutrient optimization for high-yielding varieties']
)
ON CONFLICT (id) DO NOTHING;
