-- Complete Supabase Setup for Oil Palm Agricultural Intelligence System (AGS)
-- This script sets up all tables, triggers, RLS policies, and sample data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- USER PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    organization TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ms', 'zh', 'ta')),
    default_plantation_type TEXT CHECK (default_plantation_type IN ('smallholder', 'estate', 'cooperative')),
    default_soil_type TEXT CHECK (default_soil_type IN ('peat', 'mineral', 'coastal')),
    default_focus TEXT CHECK (default_focus IN ('yield_optimization', 'cost_reduction', 'sustainability', 'disease_prevention')),
    total_land_size DECIMAL(10,2),
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MODULES TABLE (FOR MODULAR DASHBOARD)
-- =============================================
CREATE TABLE modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROMPT MANAGEMENT TABLE
-- =============================================
CREATE TABLE prompt_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('analysis', 'recommendation', 'diagnostic', 'educational')),
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYSES TABLE (FOR STORING USER ANALYSES)
-- =============================================
CREATE TABLE analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt_used TEXT,
    response_data JSONB,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYSIS REPORTS TABLE (FOR FILE-BASED ANALYSES)
-- =============================================
CREATE TABLE analysis_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sample_type TEXT NOT NULL CHECK (sample_type IN ('soil', 'leaf')),
    input_data JSONB NOT NULL,
    analysis_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    processing_time_ms INTEGER,
    user_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENTS TABLE (FOR USER UPLOADED FILES)
-- =============================================
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER FEEDBACK TABLE
-- =============================================
CREATE TABLE user_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
    recommendation_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    helpful BOOLEAN,
    feedback_text TEXT,
    category TEXT CHECK (category IN ('accuracy', 'usefulness', 'clarity', 'completeness', 'other')),
    improvement_suggestions TEXT[] DEFAULT ARRAY[]::TEXT[],
    implemented BOOLEAN DEFAULT false,
    implementation_results TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REFERENCE DOCUMENTS TABLE
-- =============================================
CREATE TABLE reference_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    storage_path TEXT,
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT EMBEDDINGS TABLE
-- =============================================
CREATE TABLE document_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES reference_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADMIN LOGS TABLE
-- =============================================
CREATE TABLE admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'module', 'prompt', 'user', etc.
    target_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MODULAR SYSTEM TABLES
-- =============================================

-- Analysis Modules Table
CREATE TABLE analysis_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('soil', 'leaf', 'environmental', 'economic', 'sustainability')),
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    malaysian_context JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Types Table
CREATE TABLE document_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('research', 'technical', 'regulatory', 'commercial')),
    file_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    processing_rules JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference Sources Table
CREATE TABLE reference_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('database', 'api', 'file', 'web')),
    url TEXT,
    access_config JSONB DEFAULT '{}',
    update_frequency TEXT DEFAULT 'manual' CHECK (update_frequency IN ('real-time', 'daily', 'weekly', 'monthly', 'manual')),
    data_format TEXT,
    trust_score DECIMAL(3,2) DEFAULT 0.5 CHECK (trust_score >= 0 AND trust_score <= 1),
    malaysian_focus BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback Enhancement Table
CREATE TABLE recommendation_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Training Data Table
CREATE TABLE ml_training_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    data_type TEXT NOT NULL,
    recommendation_id TEXT,
    feedback_category TEXT,
    rating INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Scientific References Table
CREATE TABLE scientific_references (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[] DEFAULT ARRAY[]::TEXT[],
    journal TEXT,
    year INTEGER,
    doi TEXT,
    url TEXT,
    summary TEXT,
    key_findings TEXT[] DEFAULT ARRAY[]::TEXT[],
    application_notes TEXT,
    confidence_level TEXT DEFAULT 'Medium' CHECK (confidence_level IN ('High', 'Medium', 'Low')),
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    malaysian_context BOOLEAN DEFAULT false,
    peer_reviewed BOOLEAN DEFAULT false,
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reference_documents_updated_at
    BEFORE UPDATE ON reference_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Modular System Tables Policies
ALTER TABLE analysis_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scientific_references ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Modules Policies (readable by all authenticated users, manageable by admins)
CREATE POLICY "Authenticated users can view modules" ON modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Prompt Templates Policies
CREATE POLICY "Authenticated users can view active prompts" ON prompt_templates
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage prompts" ON prompt_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Analyses Policies
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analyses" ON analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Analysis Reports Policies (simplified for anonymous access)
CREATE POLICY "Allow anonymous to create analysis reports" ON analysis_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view own reports" ON analysis_reports  
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow service role full access" ON analysis_reports
    FOR ALL USING (auth.role() = 'service_role');

-- Documents Policies
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all documents" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User Feedback Policies (simplified)  
CREATE POLICY "Allow anonymous to create feedback" ON user_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow service role full access feedback" ON user_feedback
    FOR ALL USING (auth.role() = 'service_role');

-- Reference Documents Policies
CREATE POLICY "Authenticated users can view documents" ON reference_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents" ON reference_documents
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage documents" ON reference_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Document Embeddings Policies
CREATE POLICY "Authenticated users can view embeddings" ON document_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage embeddings" ON document_embeddings
    FOR ALL USING (auth.role() = 'service_role');

-- Admin Logs Policies
CREATE POLICY "Admins can view logs" ON admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create logs" ON admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization);

-- Indexes for modules
CREATE INDEX idx_modules_enabled ON modules(is_enabled);
CREATE INDEX idx_modules_order ON modules(display_order);

-- Indexes for analyses
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_status ON analyses(status);

-- Indexes for document embeddings (for vector search)
CREATE INDEX idx_document_embeddings_document_id ON document_embeddings(document_id);

-- Indexes for analysis_reports
CREATE INDEX idx_analysis_reports_user_id ON analysis_reports(user_id);
CREATE INDEX idx_analysis_reports_created_at ON analysis_reports(created_at DESC);
CREATE INDEX idx_analysis_reports_sample_type ON analysis_reports(sample_type);
CREATE INDEX idx_analysis_reports_risk_level ON analysis_reports(risk_level);

-- Indexes for documents
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_upload_status ON documents(upload_status);

-- Performance indexes for modular system
CREATE INDEX idx_analysis_modules_category ON analysis_modules(category);
CREATE INDEX idx_analysis_modules_active ON analysis_modules(is_active);
CREATE INDEX idx_document_types_category ON document_types(category);
CREATE INDEX idx_document_types_active ON document_types(is_active);
CREATE INDEX idx_reference_sources_type ON reference_sources(type);
CREATE INDEX idx_reference_sources_active ON reference_sources(is_active);
CREATE INDEX idx_reference_sources_malaysian ON reference_sources(malaysian_focus);
CREATE INDEX idx_recommendation_analytics_id ON recommendation_analytics(recommendation_id);
CREATE INDEX idx_ml_training_data_type ON ml_training_data(data_type);
CREATE INDEX idx_scientific_references_active ON scientific_references(is_active);
CREATE INDEX idx_scientific_references_malaysian ON scientific_references(malaysian_context);
CREATE INDEX idx_scientific_references_keywords ON scientific_references USING GIN(keywords);

-- =============================================
-- SEARCH FUNCTIONS
-- =============================================

-- Function to search document embeddings using pgvector
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  source text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity,
    COALESCE(document_embeddings.metadata->>'source', 'Unknown') AS source
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================
-- HELPER FUNCTIONS  
-- =============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    admin_id UUID,
    action_text TEXT,
    target_type_text TEXT DEFAULT NULL,
    target_id_text TEXT DEFAULT NULL,
    details_json JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
    VALUES (admin_id, action_text, target_type_text, target_id_text, details_json)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- =============================================

-- Run these commands in the Supabase SQL Editor after the main setup:
/*
-- Create storage bucket for reference documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reference-documents',
    'reference-documents',
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for reference documents
CREATE POLICY "Authenticated users can view reference documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'reference-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload reference documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reference-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete reference documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'reference-documents' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
*/

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'AGS Database Setup Complete!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create demo users in Supabase Auth Dashboard';
    RAISE NOTICE '2. Run storage bucket commands in SQL Editor';
    RAISE NOTICE '3. Configure your environment variables';
    RAISE NOTICE '4. Test the authentication flow';
END $$; 