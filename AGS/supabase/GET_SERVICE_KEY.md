# 🔧 Get Your Supabase Service Role Key

You need to add your actual Supabase service role key to complete the setup.

## 📋 Steps to Get Your Service Role Key:

1. **Go to your Supabase Dashboard:**
   - Open: https://app.supabase.com
   - Select your project: `jpejthpcxhzoznauitkw`

2. **Navigate to Settings:**
   - Click on **Settings** (gear icon in sidebar)
   - Click on **API**

3. **Copy the Service Role Key:**
   - Find the section labeled **Project API keys**
   - Copy the `service_role` key (it's a long JWT token)
   - **⚠️ Keep this secret!** Don't share it publicly.

4. **Update your .env.local file:**
   - Replace `your-service-role-key-here` with your actual key:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWp0aHBjeGh6b3puYXVpdGt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ2OTIwMiwiZXhwIjoyMDY3MDQ1MjAyfQ.YOUR_ACTUAL_KEY_HERE
```

## 🧪 Test Your Setup:

After updating the key, run:

```powershell
npm run supabase:test
```

You should see:
- ✅ Anonymous client connected successfully
- ✅ Service role client connected successfully
- ✅ Storage access working

## 🚀 Run the Full Setup:

Once the test passes, run:

```powershell
npm run supabase:setup
```

## 🔒 Security Note:

The service role key has **full admin access** to your database. Only use it in:
- Server-side code (API routes)
- Setup scripts
- Admin tools

**Never expose it in client-side code or commit it to version control!**

---

**Need help?** Check the troubleshooting section in `supabase/QUICKSTART.md`
