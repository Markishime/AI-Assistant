# Manual Supabase Setup Guide

This guide provides step-by-step instructions for manually setting up the Supabase database and storage for the Oil Palm AI Assistant.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **New Project**: Create a new project in your Supabase dashboard
3. **API Keys**: Note down your project URL and API keys

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 2: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Database Schema Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/schema.sql` and paste it
5. Click **Run** to execute the schema

### What this creates:
- **prompts**: Dynamic AI prompts with versioning
- **analysis_reports**: Stored analysis results
- **feedback**: User feedback for improvement
- **reference_documents**: Metadata for RAG documents
- **user_profiles**: Enhanced user profiles
- **admin_logs**: System audit logs

## Step 4: Storage Setup

1. In the SQL Editor, create another new query
2. Copy the contents of `supabase/storage.sql` and paste it
3. Click **Run** to execute the storage configuration

### Storage buckets created:
- **uploads**: Temporary user file uploads (50MB limit)
- **reference-documents**: RAG knowledge base (100MB limit)
- **reports**: Generated PDF reports (10MB limit)

## Step 5: Row Level Security (RLS)

The schema automatically sets up RLS policies for:
- Users can only access their own data
- Admins have full access to all data
- Public read access for reference documents
- Secure file upload/download permissions

## Step 6: Initial Data Seeding

### Add Default Prompts

Go to **Table Editor** > **prompts** and add these records:

**Soil Analysis Prompt:**
```json
{
  "version": "1.0",
  "title": "Oil Palm Soil Analysis",
  "description": "Comprehensive soil analysis for oil palm cultivation",
  "template": "You are an expert Malaysian oil palm agronomist. Analyze the provided soil data and provide detailed recommendations for optimal palm cultivation.\n\nConsider:\n- Soil pH and nutrient levels\n- Organic matter content\n- Regional climate factors\n- Sustainable practices\n- Malaysian oil palm guidelines\n\nProvide recommendations in JSON format with immediate, short-term, and long-term actions.",
  "sample_type": "soil",
  "language": "en",
  "user_focus": "balanced",
  "is_active": true
}
```

**Leaf Analysis Prompt:**
```json
{
  "version": "1.0",
  "title": "Oil Palm Leaf Analysis",
  "description": "Comprehensive leaf analysis for oil palm nutrition",
  "template": "You are an expert Malaysian oil palm agronomist. Analyze the provided leaf analysis data and provide detailed nutritional recommendations.\n\nConsider:\n- Nutrient deficiencies and excesses\n- Leaf sampling protocols\n- Fertilizer recommendations\n- Yield optimization\n- Cost-effective solutions\n\nProvide recommendations in JSON format with immediate, short-term, and long-term actions.",
  "sample_type": "leaf",
  "language": "en",
  "user_focus": "balanced",
  "is_active": true
}
```

## Step 7: Test the Setup

### Database Test
1. Go to **Table Editor**
2. Try inserting and querying data in the `prompts` table
3. Check that RLS policies are working correctly

### Storage Test
1. Go to **Storage**
2. Try uploading a test file to the `uploads` bucket
3. Verify the file size and type restrictions work

## Step 8: Upload Reference Documents

1. Go to **Storage** > **reference-documents**
2. Upload your oil palm reference documents:
   - MPOB guidelines
   - Research papers
   - Best practices documents
   - Disease guides

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check your service role key is correct
   - Verify RLS policies are set up properly

2. **"Function does not exist" errors**
   - Ensure all schema functions were created
   - Check for SQL syntax errors in the setup

3. **Storage upload failures**
   - Verify bucket policies are correct
   - Check file size and type restrictions

4. **Environment variable issues**
   - Ensure all required vars are in `.env.local`
   - Check for typos in variable names

### Manual Verification

Run these queries in SQL Editor to verify setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('prompts', 'analysis_reports', 'feedback', 'reference_documents', 'user_profiles', 'admin_logs');

-- Check storage buckets
SELECT name, public FROM storage.buckets;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Next Steps

1. **Test the Application**: Upload sample data and run analysis
2. **Monitor Logs**: Check admin_logs for any issues
3. **Optimize Performance**: Add indexes as needed based on usage patterns
4. **Backup Strategy**: Set up regular backups of your database
5. **Security Review**: Regularly audit RLS policies and permissions

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the error logs in your Supabase dashboard
3. Verify your environment variables are correct
4. Test with the automated setup script first

Your Oil Palm AI Assistant is now ready to use! 🌴
