-- Migration: Add pgvector and document embeddings support
-- This migration adds the vector extension, document embeddings table, and related functions

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create document embeddings table
CREATE TABLE IF NOT EXISTS document_embeddings (
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
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_chunk_index ON document_embeddings(chunk_index);
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_content_hash ON document_embeddings(content_hash);

-- Vector similarity index using HNSW (Hierarchical Navigable Small World)
-- This enables fast similarity search with pgvector
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_vector ON document_embeddings 
USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Enable RLS
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document embeddings
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
CREATE POLICY "System can manage document embeddings" ON document_embeddings
    FOR ALL USING (auth.role() = 'anon');

-- RLS Policies for reference documents - add system access
CREATE POLICY "System can manage reference documents" ON reference_documents
    FOR ALL USING (auth.role() = 'anon');

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
