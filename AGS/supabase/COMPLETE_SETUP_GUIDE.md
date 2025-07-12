# Complete AGS Supabase Setup Guide

This guide will help you set up a complete Supabase project for the Oil Palm Agricultural Intelligence System (AGS) from scratch.

## Prerequisites

1. Supabase account
2. New Supabase project created
3. Node.js environment for testing

## Step 1: Database Setup

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the complete setup script**: Copy and paste the entire content from `complete_setup.sql`
4. **Execute the script** - this will create all tables, triggers, policies, and seed data

## Step 2: Create Demo Users

Since demo users need to be created through Supabase Auth (not SQL), follow these steps:

1. **Go to Authentication > Users in your Supabase dashboard**
2. **Create the following users manually:**

   **Admin User:**
   - Email: `admin@demo.com`
   - Password: `admin123`
   - After creation, go to SQL Editor and run:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE id = (
       SELECT id FROM auth.users WHERE email = 'admin@demo.com'
   );
   ```

   **Regular User:**
   - Email: `user@demo.com`
   - Password: `user123`
   - (Default role 'user' will be set automatically)

   **Manager User:**
   - Email: `manager@demo.com`
   - Password: `manager123`
   - After creation, go to SQL Editor and run:
   ```sql
   UPDATE user_profiles SET role = 'manager' WHERE id = (
       SELECT id FROM auth.users WHERE email = 'manager@demo.com'
   );
   ```

## Step 3: Storage Setup

1. **Go to Storage in your Supabase dashboard**
2. **Create a new bucket:**
   - Name: `reference-documents`
   - Public: `false`
   - File size limit: `52428800` (50MB)
   - Allowed MIME types: `application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Set storage policies** by running this in SQL Editor:
```sql
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
```

## Step 4: Environment Configuration

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For external services
OPENAI_API_KEY=your_openai_key
```

## Step 5: Test the Setup

1. **Start your application**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Try logging in with `admin@demo.com` / `admin123`
   - Try logging in with `user@demo.com` / `user123`
   - Try registering a new user

3. **Test admin features:**
   - Login as admin
   - Go to `/admin` page
   - Try toggling modules on/off
   - Check prompt management

## Database Schema Overview

The setup creates these main tables:

### Core Tables
- `user_profiles` - Extended user information linked to Supabase Auth
- `modules` - Modular dashboard components that can be enabled/disabled
- `prompt_templates` - AI prompt management for admins
- `analyses` - User analysis history
- `user_feedback` - User feedback on analyses

### Document Management
- `reference_documents` - Uploaded document metadata
- `document_embeddings` - Vector embeddings for RAG functionality

### Admin & Logging
- `admin_logs` - Audit trail for admin actions

### Key Features
- **Row Level Security (RLS)** - All tables have proper security policies
- **Automatic Triggers** - User profile creation, updated_at timestamps
- **Role-based Access** - Admin, Manager, User roles with different permissions
- **Modular Dashboard** - Admin can enable/disable features in real-time

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Demo users can login
- [ ] Admin can access `/admin` page
- [ ] Regular users cannot access admin features
- [ ] Module toggles work (admin feature)
- [ ] User registration works
- [ ] User profiles are created automatically
- [ ] Document upload works (if implemented)

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Make sure the complete SQL script ran successfully
   - Check that all tables were created

2. **Authentication errors**
   - Verify environment variables are correct
   - Check that demo users were created in Supabase Auth dashboard

3. **Permission denied errors**
   - RLS policies might not be set correctly
   - Check user roles in `user_profiles` table

4. **Storage upload errors**
   - Verify storage bucket was created
   - Check storage policies were applied

### Debug Queries

Check if tables exist:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Check user profiles:
```sql
SELECT * FROM user_profiles;
```

Check modules:
```sql
SELECT * FROM modules ORDER BY display_order;
```

Check RLS policies:
```sql
SELECT schemaname, tablename, policyname FROM pg_policies;
```

## Next Steps

After successful setup:
1. Customize the modules based on your needs
2. Add your own prompt templates
3. Configure external API integrations (OpenAI, weather services, etc.)
4. Upload reference documents for RAG functionality
5. Customize the UI/UX to match your branding

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify all environment variables
3. Test individual components in isolation
4. Check browser console for JavaScript errors 