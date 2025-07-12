# Documents Table Complete Fix

## Issue Summary
The upload API was failing with multiple errors:
1. `column documents.created_at does not exist`
2. `Could not find the 'file_path' column of 'documents' in the schema cache`

## Root Cause
The `documents` table was created with an incomplete schema, missing several required columns that the upload API expects.

## Required Columns
The upload API expects the following columns in the `documents` table:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Foreign key to auth.users |
| `filename` | TEXT | Yes | Generated filename |
| `original_name` | TEXT | Yes | Original uploaded filename |
| `file_size` | INTEGER | Yes | File size in bytes |
| `file_type` | TEXT | Yes | MIME type |
| `file_path` | TEXT | Yes | Storage path in Supabase |
| `storage_url` | TEXT | No | Public URL for the file |
| `upload_status` | TEXT | Yes | Status: pending/processing/completed/failed |
| `metadata` | JSONB | Yes | Additional file metadata |
| `created_at` | TIMESTAMP | Yes | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

## Solution

### 1. Run the Complete Fix Script
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Complete fix for documents table - adds missing storage_url column
-- Run this in your Supabase SQL Editor

-- Check if documents table exists and add missing columns
DO $$
BEGIN
    -- Check if documents table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
        -- Add storage_url column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'storage_url') THEN
            ALTER TABLE documents ADD COLUMN storage_url TEXT;
            RAISE NOTICE 'Added missing storage_url column to documents table';
        ELSE
            RAISE NOTICE 'storage_url column already exists';
        END IF;
        
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at') THEN
            ALTER TABLE documents ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added missing created_at column to documents table';
        ELSE
            RAISE NOTICE 'created_at column already exists';
        END IF;
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'updated_at') THEN
            ALTER TABLE documents ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added missing updated_at column to documents table';
        ELSE
            RAISE NOTICE 'updated_at column already exists';
        END IF;
        
        -- Add file_path column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_path') THEN
            ALTER TABLE documents ADD COLUMN file_path TEXT;
            RAISE NOTICE 'Added missing file_path column to documents table';
        ELSE
            RAISE NOTICE 'file_path column already exists';
        END IF;
        
    ELSE
        -- Create the complete documents table if it doesn't exist
        CREATE TABLE documents (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_type TEXT NOT NULL,
            file_path TEXT NOT NULL,
            storage_url TEXT,
            upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes for performance
        CREATE INDEX idx_documents_user_id ON documents(user_id);
        CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
        CREATE INDEX idx_documents_upload_status ON documents(upload_status);
        
        -- Enable RLS
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created complete documents table with all required columns';
    END IF;
END $$;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Check if policies exist and create them if they don't
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view own documents') THEN
        CREATE POLICY "Users can view own documents" ON documents
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created "Users can view own documents" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can create documents') THEN
        CREATE POLICY "Users can create documents" ON documents
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created "Users can create documents" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update own documents') THEN
        CREATE POLICY "Users can update own documents" ON documents
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created "Users can update own documents" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete own documents') THEN
        CREATE POLICY "Users can delete own documents" ON documents
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created "Users can delete own documents" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Admins can manage all documents') THEN
        CREATE POLICY "Admins can manage all documents" ON documents
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
        RAISE NOTICE 'Created "Admins can manage all documents" policy';
    END IF;
END $$;

-- Create storage bucket for documents if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'documents') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'documents',
            'documents',
            false,
            10485760, -- 10MB limit
            ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
        );
        RAISE NOTICE 'Created documents storage bucket';
    ELSE
        RAISE NOTICE 'Documents storage bucket already exists';
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_documents_updated_at') THEN
        CREATE TRIGGER update_documents_updated_at
            BEFORE UPDATE ON documents
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger for documents table';
    ELSE
        RAISE NOTICE 'updated_at trigger already exists for documents table';
    END IF;
END $$;
```

### 2. Verify the Fix
Run the test script to verify the fix:

```bash
node test-documents-fix.js
```

### 3. Test Upload Functionality
1. Go to the upload page in your application
2. Try uploading a CSV or Excel file
3. Verify the file appears in the documents page
4. Check that the file can be used for analysis

## What the Fix Does

### 1. Column Management
- **Adds missing columns**: `storage_url`, `created_at`, `updated_at`, `file_path`
- **Handles existing tables**: Safely adds columns to existing tables
- **Creates complete tables**: If the table doesn't exist, creates it with all required columns

### 2. Security Setup
- **Enables RLS**: Row Level Security for data protection
- **Creates policies**: User-specific access policies
- **Admin access**: Special policies for admin users

### 3. Performance Optimization
- **Creates indexes**: For efficient querying by user_id, created_at, and upload_status
- **Adds triggers**: Automatic updated_at timestamp management

### 4. Storage Configuration
- **Creates bucket**: Documents storage bucket with appropriate settings
- **File limits**: 10MB file size limit
- **File types**: Supports PDF, CSV, Excel, and text files

## Troubleshooting

### If the SQL script fails:
1. **Check permissions**: Ensure you have admin access to the Supabase project
2. **Verify extensions**: Make sure `uuid-ossp` extension is enabled
3. **Check syntax**: Ensure you're running the script in the correct database

### If uploads still fail:
1. **Check browser console**: Look for detailed error messages
2. **Verify storage bucket**: Ensure the documents bucket was created
3. **Check permissions**: Verify user has necessary permissions

### If files don't appear:
1. **Check authentication**: Ensure user is properly logged in
2. **Verify RLS policies**: Check that policies are working correctly
3. **Check network**: Look for API errors in the network tab

### Common Error Messages:

#### `column documents.created_at does not exist`
- **Cause**: The `created_at` column is missing from the table
- **Solution**: Run the fix script to add the missing column

#### `Could not find the 'file_path' column of 'documents' in the schema cache`
- **Cause**: The `file_path` column is missing or the schema cache is stale
- **Solution**: Run the fix script and restart your application

#### `storage_url column does not exist`
- **Cause**: The `storage_url` column is missing from the table
- **Solution**: Run the fix script to add the missing column

## Related Files

- `src/app/api/upload/route.ts` - Upload API endpoint
- `src/app/documents/page.tsx` - Documents page
- `supabase/complete_setup.sql` - Database setup (incomplete documents table)
- `supabase/schema.sql` - Main schema file (missing documents table)

## Notes

- The fix is designed to be safe and non-destructive
- It handles both existing and non-existing tables
- It preserves existing data while adding missing columns
- The script is idempotent - it can be run multiple times safely
- All RLS policies are created with proper security considerations 