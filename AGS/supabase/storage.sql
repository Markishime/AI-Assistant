-- Oil Palm AI Assistant - Supabase Storage Configuration
-- Storage buckets and policies for file uploads and document management

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Uploads bucket for temporary file storage during processing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'uploads',
    'uploads',
    false, -- Not public, requires authentication
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/json'
    ]
);

-- Reference documents bucket for RAG knowledge base
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reference-documents',
    'reference-documents',
    false, -- Admin access only
    104857600, -- 100MB limit for research papers
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
    ]
);

-- Reports bucket for storing generated PDF reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports',
    'reports',
    false, -- User access to their own reports
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'application/json'
    ]
);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Uploads bucket policies
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their uploads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'uploads' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their uploads" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'uploads' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their uploads" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Admins can manage all uploads
CREATE POLICY "Admins can manage uploads" ON storage.objects
    FOR ALL USING (
        bucket_id = 'uploads' AND (
            auth.jwt() ->> 'role' = 'admin' OR 
            auth.jwt() ->> 'user_role' = 'admin'
        )
    );

-- Reference documents policies
CREATE POLICY "Anyone can view reference documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reference-documents' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can manage reference documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'reference-documents' AND (
            auth.jwt() ->> 'role' = 'admin' OR 
            auth.jwt() ->> 'user_role' = 'admin'
        )
    );

-- Reports bucket policies
CREATE POLICY "Users can access their reports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'reports' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Admins can view all reports" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reports' AND (
            auth.jwt() ->> 'role' = 'admin' OR 
            auth.jwt() ->> 'user_role' = 'admin'
        )
    );

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old upload files (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_old_uploads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Delete files older than 24 hours from uploads bucket
    FOR file_record IN 
        SELECT name, id 
        FROM storage.objects 
        WHERE bucket_id = 'uploads' 
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        -- Delete from storage
        DELETE FROM storage.objects WHERE id = file_record.id;
        deleted_count := deleted_count + 1;
    END LOOP;
    
    -- Log cleanup activity
    INSERT INTO admin_logs (
        admin_user_id, 
        action, 
        table_name, 
        new_values, 
        created_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid, -- System user
        'cleanup_uploads',
        'storage.objects',
        jsonb_build_object('deleted_count', deleted_count),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get file usage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_files', COUNT(*),
        'total_size_bytes', COALESCE(SUM(metadata->>'size')::bigint, 0),
        'by_bucket', jsonb_object_agg(
            bucket_id, 
            jsonb_build_object(
                'count', bucket_count,
                'size_bytes', bucket_size
            )
        )
    ) INTO result
    FROM (
        SELECT 
            bucket_id,
            COUNT(*) as bucket_count,
            COALESCE(SUM(metadata->>'size')::bigint, 0) as bucket_size
        FROM storage.objects
        GROUP BY bucket_id
    ) bucket_stats;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTIONS FOR FILE MANAGEMENT
-- ============================================================================

-- Function to generate secure file path for uploads
CREATE OR REPLACE FUNCTION generate_upload_path(
    user_id UUID,
    file_name TEXT,
    file_type TEXT DEFAULT 'general'
)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || file_type || '/' || 
           EXTRACT(YEAR FROM NOW()) || '/' ||
           EXTRACT(MONTH FROM NOW()) || '/' ||
           gen_random_uuid()::text || '_' || file_name;
END;
$$ LANGUAGE plpgsql;

-- Function to validate file upload
CREATE OR REPLACE FUNCTION validate_file_upload(
    bucket_name TEXT,
    file_size BIGINT,
    mime_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    bucket_info RECORD;
    result JSONB;
BEGIN
    -- Get bucket configuration
    SELECT * INTO bucket_info 
    FROM storage.buckets 
    WHERE id = bucket_name;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Bucket not found'
        );
    END IF;
    
    -- Check file size limit
    IF file_size > bucket_info.file_size_limit THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'File size exceeds limit of ' || 
                    (bucket_info.file_size_limit / 1048576)::text || 'MB'
        );
    END IF;
    
    -- Check MIME type
    IF bucket_info.allowed_mime_types IS NOT NULL AND 
       NOT (mime_type = ANY(bucket_info.allowed_mime_types)) THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'File type not allowed. Allowed types: ' || 
                    array_to_string(bucket_info.allowed_mime_types, ', ')
        );
    END IF;
    
    RETURN jsonb_build_object('valid', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
