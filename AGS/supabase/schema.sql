-- This schema creates the necessary tables and policies for the Malaysian oil palm agronomist assistant

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types for better data validation
CREATE TYPE sample_type AS ENUM ('soil', 'leaf');
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE priority_level AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE user_focus AS ENUM ('sustainability', 'cost', 'yield', 'balanced');
CREATE TYPE language_code AS ENUM ('en', 'ms');
CREATE TYPE plantation_type AS ENUM ('tenera', 'dura', 'pisifera');
CREATE TYPE soil_type AS ENUM ('mineral', 'peat', 'coastal');


CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    sample_type sample_type NOT NULL,
    language language_code NOT NULL DEFAULT 'en',
    user_focus user_focus DEFAULT 'balanced',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure only one active prompt per sample type and language
    CONSTRAINT unique_active_prompt UNIQUE (sample_type, language, is_active) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for performance
CREATE INDEX idx_prompts_sample_type ON prompts(sample_type);
CREATE INDEX idx_prompts_language ON prompts(language);
CREATE INDEX idx_prompts_active ON prompts(is_active) WHERE is_active = true;
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    sample_type sample_type NOT NULL,
    file_names TEXT[] NOT NULL, -- Array of uploaded file names
    file_sizes INTEGER[] NOT NULL, -- Array of file sizes in bytes
    input_data JSONB NOT NULL, -- Raw extracted data from files
    analysis_result JSONB NOT NULL, -- Complete analysis output
    user_preferences JSONB, -- User priority settings
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    risk_level risk_level,
    processing_method VARCHAR(50) DEFAULT 'standard', -- 'standard', 'enhanced'
    processing_time_ms INTEGER, -- Processing time in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata for analytics
    land_size DECIMAL(10,2), -- hectares
    historical_yield DECIMAL[] -- tons/ha for previous years
);

-- Indexes for efficient querying
CREATE INDEX idx_reports_user_id ON analysis_reports(user_id);
CREATE INDEX idx_reports_sample_type ON analysis_reports(sample_type);
CREATE INDEX idx_reports_risk_level ON analysis_reports(risk_level);
CREATE INDEX idx_reports_created_at ON analysis_reports(created_at DESC);
CREATE INDEX idx_reports_confidence_score ON analysis_reports(confidence_score DESC);

-- GIN index for JSONB columns for fast searches
CREATE INDEX idx_reports_input_data_gin ON analysis_reports USING gin(input_data);
CREATE INDEX idx_reports_analysis_result_gin ON analysis_reports USING gin(analysis_result);
CREATE INDEX idx_reports_user_preferences_gin ON analysis_reports USING gin(user_preferences);

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES analysis_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    comment TEXT,
    suggestions TEXT,
    recommendation_followed BOOLEAN,
    yield_improvement DECIMAL(5,2), -- Actual yield improvement if available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate feedback for same report by same user
    CONSTRAINT unique_user_report_feedback UNIQUE (report_id, user_id)
);

-- Indexes for feedback analysis
CREATE INDEX idx_feedback_report_id ON feedback(report_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);


CREATE TABLE reference_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source VARCHAR(255), -- e.g., 'MPOB', 'Journal', 'Research Paper'
    document_type VARCHAR(100), -- e.g., 'guideline', 'research', 'standard'
    file_path TEXT, -- Path in Supabase storage
    content_hash VARCHAR(64), -- SHA-256 hash for duplicate detection
    metadata JSONB, -- Additional document metadata
    language language_code DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for document management
CREATE INDEX idx_ref_docs_source ON reference_documents(source);
CREATE INDEX idx_ref_docs_type ON reference_documents(document_type);
CREATE INDEX idx_ref_docs_language ON reference_documents(language);
CREATE INDEX idx_ref_docs_active ON reference_documents(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX idx_ref_docs_content_hash ON reference_documents(content_hash);


CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES reference_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of content
    embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small dimensions
    metadata JSONB DEFAULT '{}', -- Additional chunk metadata
    token_count INTEGER, -- Approximate token count
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique chunks per document
    CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index),
    CONSTRAINT unique_content_hash UNIQUE (content_hash)
);

-- Indexes for document embeddings
CREATE INDEX idx_doc_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX idx_doc_embeddings_chunk_index ON document_embeddings(chunk_index);
CREATE INDEX idx_doc_embeddings_content_hash ON document_embeddings(content_hash);

CREATE INDEX idx_doc_embeddings_vector ON document_embeddings 
USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);


CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    role VARCHAR(100), -- e.g., 'agronomist', 'plantation_manager', 'researcher'
    location VARCHAR(255), -- Location in Malaysia
    preferred_language language_code DEFAULT 'en',
    default_plantation_type plantation_type DEFAULT 'tenera',
    default_soil_type soil_type DEFAULT 'mineral',
    default_focus user_focus DEFAULT 'balanced',
    total_land_size DECIMAL(10,2), -- Total hectares managed
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for user profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL, -- e.g., 'prompt_updated', 'user_created'
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit trail queries
CREATE INDEX idx_admin_logs_admin_user ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Prompts policies
CREATE POLICY "Anyone can view active prompts" ON prompts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all prompts" ON prompts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Analysis reports policies
CREATE POLICY "Users can view their own reports" ON analysis_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON analysis_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON analysis_reports
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Feedback policies
CREATE POLICY "Users can view feedback for their reports" ON feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM analysis_reports WHERE id = feedback.report_id
        )
    );

CREATE POLICY "Users can insert feedback" ON feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- Reference documents policies
CREATE POLICY "Anyone can view active reference documents" ON reference_documents
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage reference documents" ON reference_documents
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Allow system operations for document ingestion
CREATE POLICY "System can manage reference documents" ON reference_documents
    FOR ALL USING (auth.role() = 'anon');

-- Document embeddings policies (follows reference documents access)
CREATE POLICY "Anyone can view document embeddings for active documents" ON document_embeddings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reference_documents rd 
            WHERE rd.id = document_embeddings.document_id 
            AND rd.is_active = true
        )
    );

CREATE POLICY "Admins can manage document embeddings" ON document_embeddings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Allow system operations for document embeddings
CREATE POLICY "System can manage document_embeddings" ON document_embeddings
    FOR ALL USING (auth.role() = 'anon');

-- User profiles policies
CREATE POLICY "Users can view and edit their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Admin logs policies
CREATE POLICY "Admins can view admin logs" ON admin_logs
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

CREATE POLICY "Admins can insert admin logs" ON admin_logs
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- RLS Policies for prompt_templates
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Allow all users to read active prompt templates
CREATE POLICY "Allow read access to active prompt templates" ON prompt_templates
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all prompt templates
CREATE POLICY "Allow authenticated read access to all prompt templates" ON prompt_templates
    FOR SELECT TO authenticated USING (true);

-- Allow service role and admin users to manage prompt templates
CREATE POLICY "Allow admin management of prompt_templates" ON prompt_templates
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE role = 'admin'
        )
    );

-- Allow system operations (for API initialization)
CREATE POLICY "Allow system operations on prompt templates" ON prompt_templates
    FOR ALL TO service_role USING (true);


-- Function to get active prompt for sample type and language
CREATE OR REPLACE FUNCTION get_active_prompt(
    p_sample_type sample_type,
    p_language language_code DEFAULT 'en'
)
RETURNS TABLE (
    id UUID,
    template TEXT,
    version VARCHAR(20),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.template, p.version, p.description
    FROM prompts p
    WHERE p.sample_type = p_sample_type
    AND p.language = p_language
    AND p.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_reports', COUNT(*),
        'avg_confidence_score', ROUND(AVG(confidence_score), 2),
        'risk_distribution', jsonb_object_agg(risk_level, risk_count),
        'sample_type_distribution', jsonb_object_agg(sample_type, sample_count),
        'last_report_date', MAX(created_at)
    ) INTO result
    FROM (
        SELECT 
            confidence_score,
            risk_level,
            sample_type,
            created_at,
            COUNT(*) OVER (PARTITION BY risk_level) as risk_count,
            COUNT(*) OVER (PARTITION BY sample_type) as sample_count
        FROM analysis_reports 
        WHERE user_id = user_uuid
    ) t;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Function to search document embeddings by similarity
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
  document_title text,
  document_source text,
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
    rd.title as document_title,
    rd.source as document_source,
    de.chunk_index
  FROM document_embeddings de
  JOIN reference_documents rd ON de.document_id = rd.id
  WHERE rd.is_active = true
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats()
RETURNS TABLE (
  total_documents bigint,
  active_documents bigint,
  total_embeddings bigint,
  avg_chunks_per_document numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM reference_documents) as total_documents,
    (SELECT COUNT(*) FROM reference_documents WHERE is_active = true) as active_documents,
    (SELECT COUNT(*) FROM document_embeddings) as total_embeddings,
    (SELECT ROUND(AVG(chunk_count), 2) FROM (
      SELECT COUNT(*) as chunk_count 
      FROM document_embeddings 
      GROUP BY document_id
    ) chunks) as avg_chunks_per_document;
END;
$$;



-- Insert default prompts
INSERT INTO prompts (title, description, template, sample_type, language, is_active) VALUES 
(
    'Default Soil Analysis Prompt (English)',
    'Standard prompt for soil analysis with Malaysian oil palm focus',
    'You are an expert Malaysian oil palm agronomist. Analyze this soil test data and provide specific recommendations for Malaysian conditions.

SAMPLE TYPE: {sampleType}
DATA: {dataValues}
REFERENCE STANDARDS: {referenceStandards}
KNOWLEDGE BASE: {referenceContext}

Focus on Malaysian soil conditions (pH 5.5-6.5, tropical climate) and provide actionable recommendations with cost considerations.

Respond with ONLY valid JSON in this format:
{
  "interpretation": "Detailed soil analysis interpretation",
  "issues": ["List of identified issues"],
  "improvementPlan": [
    {
      "recommendation": "Specific recommendation",
      "reasoning": "Scientific explanation",
      "estimatedImpact": "Expected impact",
      "priority": "High|Medium|Low"
    }
  ],
  "riskLevel": "Low|Medium|High|Critical",
  "confidenceScore": 85
}',
    'soil',
    'en',
    true
),
(
    'Default Leaf Analysis Prompt (English)',
    'Standard prompt for leaf tissue analysis with Malaysian oil palm focus',
    'You are an expert Malaysian oil palm agronomist. Analyze this leaf tissue test data and provide specific recommendations.

SAMPLE TYPE: {sampleType}
DATA: {dataValues}
REFERENCE STANDARDS: {referenceStandards}
KNOWLEDGE BASE: {referenceContext}

Focus on Tenera palm nutrition standards (N >2.5%, P >0.15%, K >1.0%) and Malaysian growing conditions.

Respond with ONLY valid JSON in the specified format.',
    'leaf',
    'en',
    true
);

-- Insert sample reference documents
INSERT INTO reference_documents (title, description, source, document_type, language) VALUES
(
    'MPOB Oil Palm Fertilizer Recommendations',
    'Official fertilizer application guidelines from Malaysian Palm Oil Board',
    'MPOB',
    'guideline',
    'en'
),
(
    'Nutrient Management Best Practices for Oil Palm',
    'Comprehensive guide on nutrient management for sustainable oil palm cultivation',
    'Research',
    'best_practice',
    'en'
),
(
    'RSPO Principles and Criteria for Sustainable Palm Oil Production',
    'Sustainability guidelines for responsible palm oil production',
    'RSPO',
    'standard',
    'en'
);

-- Create admin user function (to be called after user registration)
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, created_at)
    VALUES (NEW.id, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enhanced prompt management system for dynamic prompt templates
CREATE TABLE prompt_templates (
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
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX idx_prompt_templates_priority ON prompt_templates(priority);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_prompt_templates_created_at ON prompt_templates(created_at DESC);

-- Function to update updated_at for prompt templates
CREATE OR REPLACE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
