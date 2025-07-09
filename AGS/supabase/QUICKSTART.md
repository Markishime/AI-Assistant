# 🚀 Quick Start Guide - Supabase Setup

Get your Oil Palm AI Assistant database up and running in minutes!

## ⚠️ Important: Manual Setup Required

Due to Supabase security policies, the database schema must be set up manually. The automated script will guide you through the process.

## Step 1: Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `jpejthpcxhzoznauitkw`
3. Navigate to **Settings** → **API**
4. Copy the `service_role` key (keep it secret!)

## Step 2: Add the Service Role Key

Open your `.env.local` file and replace `your-service-role-key-here` with your actual key:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWp0aHBjeGh6b3puYXVpdGt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ2OTIwMiwiZXhwIjoyMDY3MDQ1MjAyfQ.YOUR_ACTUAL_KEY_HERE
```

## Step 3: Manual Database Setup

### 🗄️ Execute Database Schema

1. **Open SQL Editor**
   - Go to: https://app.supabase.com/project/jpejthpcxhzoznauitkw/sql
   
2. **Run the Schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

### 📁 Create Storage Buckets

1. **Go to Storage**
   - Go to: https://app.supabase.com/project/jpejthpcxhzoznauitkw/storage/buckets

2. **Create these buckets:**
   - `uploads` (50MB limit, Private)
   - `reference-documents` (100MB limit, Private)  
   - `reports` (10MB limit, Private)

## Step 4: Run Verification Script

After manual setup, verify everything works:

```bash
npm run supabase:setup
```

The script will now check your setup instead of trying to execute SQL automatically.

That's it! 🎉

## 🛠️ Alternative Setup Methods

### Using PowerShell Script
```powershell
.\supabase\setup.ps1
```

### Using Batch File
```cmd
supabase\setup.bat
```

### Manual Setup
See `supabase/MANUAL_SETUP.md` for detailed step-by-step instructions.

## ✅ Verification

After setup, you should see:

- ✅ 6 database tables created
- ✅ 3 storage buckets configured
- ✅ RLS policies enabled
- ✅ Initial prompts seeded

## 🔧 Troubleshooting

### Common Issues:

**"Permission denied" error:**
- Double-check your service role key
- Make sure you copied the entire key

**"Network error" or "Connection failed":**
- Check your internet connection
- Verify your Supabase project URL

**"Function does not exist" error:**
- Your Supabase project might need extensions enabled
- Try running the setup again

### Get Help:

1. **Test your connection first:**
   ```powershell
   npm run supabase:test
   ```

2. **Check your environment variables:**
   ```powershell
   cat .env.local
   ```

3. **Manual verification:**
   - Go to your Supabase dashboard
   - Check if tables appear in **Table Editor**
   - Check if buckets appear in **Storage**

## 🌴 Next Steps

Once setup is complete:

1. **Upload reference documents** to the `reference-documents` bucket
2. **Test the application** with sample soil/leaf data
3. **Monitor the system** using the admin dashboard
4. **Customize prompts** for your specific needs

Your Oil Palm AI Assistant is now ready to help optimize palm cultivation! 🌴

## 📚 Additional Resources

- **Database Schema:** `supabase/schema.sql`
- **Storage Config:** `supabase/storage.sql`
- **Manual Setup:** `supabase/MANUAL_SETUP.md`
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
