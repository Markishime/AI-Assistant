# 🚀 Quick Start Guide - Supabase Auth


## 🎯 What's New

### 🔐 **Authentication**
- **Supabase Auth** instead of Firebase
- **Role-based routing**: Admin → `/admin/dashboard`, Users → `/dashboard`
- **Google OAuth** integration
- **Enhanced user profiles** with agricultural preferences

### 🎨 **Enhanced UI**
- **Modern dashboards** with performance metrics
- **Personalized welcome** messages
- **Quick action buttons** for common tasks
- **Real-time status** indicators

## 🚀 Getting Started

### 1. **Environment Setup** ⚠️
Create a `.env.local` file with required API keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration (Required for AI Analysis)
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. **Database Migration** ✅
The migration has been applied and tested successfully.

### 3. **Start Development Server**
```bash
npm run dev
```

### 4. **Test the System**
```bash
# Test auth configuration
npm run test:auth

# Test AI analysis system
curl http://localhost:3000/api/analyze/status

# Test full system
npm run test:system
```

## 🤖 AI Analysis Features

### **File Analysis System**
- **Soil Analysis**: pH, nutrients, organic matter analysis
- **Leaf Analysis**: Disease detection, nutrient deficiency identification
- **Enhanced Processing**: OCR + AI interpretation
- **Scientific References**: Contextual agricultural research

### **Supported File Types**
- **Images**: PNG, JPG, JPEG (field photos, lab reports)
- **Documents**: PDF (lab reports, field notes)
- **Data Files**: CSV, Excel (structured test data)

### **Configuration Status**
Check `/api/analyze/status` to verify:
- OpenAI API configuration
- Supabase connectivity
- Analysis system readiness

### **Testing Analysis**
Use the sample file: `public/sample_soil_analysis.csv`
1. Go to `/analyze`
2. Select "Soil Analysis"
3. Upload the sample CSV file
4. Review the AI-generated analysis and recommendations

## 👥 User Roles

### **Admin Users**
- Access: `/admin/dashboard`
- Features: System management, user overview, analytics
- Capabilities: View all users, system health monitoring

### **Regular Users**
- Access: `/dashboard`
- Features: Personal analytics, plantation management
- Capabilities: Upload documents, run analyses

## 🔧 Available Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Testing
npm run test:auth             # Test Supabase auth configuration
npm run test:system           # Test full system functionality
npm run supabase:test         # Test Supabase connection

# Migration
npm run migrate:auth          # Run migration verification
```

## 📁 Key Files

```
lib/supabase-auth.ts              # Main auth configuration
src/app/login/page.tsx            # Enhanced login page
src/app/register/page.tsx         # Enhanced registration
src/app/dashboard/page.tsx        # User dashboard
src/app/admin/dashboard/page.tsx  # Admin dashboard
src/app/auth/callback/page.tsx    # OAuth callback handler
```

## 🎨 UI Features

### **User Dashboard**
- Welcome banner with quick actions
- Performance metrics (accuracy, time saved)
- Recent analyses with status indicators
- Plantation overview
- Quick action buttons

### **Admin Dashboard**
- System health monitoring
- User management overview
- Recent activity feed
- Performance statistics
- Administrative tools

## 🔒 Security Features

- **Row Level Security (RLS)** for data protection
- **Role-based access control**
- **Secure OAuth flow**
- **Session management**
- **Input validation**

## 🆘 Troubleshooting

### **Common Issues**

1. **Login not working**
   - Check Supabase Auth settings
   - Verify environment variables
   - Run `npm run test:auth`

2. **Role detection issues**
   - Check user profile creation
   - Verify database migration
   - Test with `npm run supabase:test`

3. **OAuth redirect errors**
   - Check Google Cloud Console settings
   - Verify Supabase redirect URLs
   - Test callback page accessibility

### **Debug Commands**
```bash
npm run test:auth              # Test auth configuration
npm run supabase:test          # Test database connection
npm run migrate:auth           # Verify migration status
```

## 📚 Documentation

- **Full Guide**: `AUTH_MIGRATION_GUIDE.md`
- **Database Schema**: `supabase/migrations/20250111_add_user_profiles.sql`
- **API Reference**: Supabase documentation

## 🎉 Ready to Use!

Your enhanced Oil Palm AGS system is now ready with:
- ✅ Modern authentication
- ✅ Role-based access
- ✅ Enhanced UI/UX
- ✅ Security features
- ✅ Malaysian context support

**Start developing**: `npm run dev`

---

🌴 **Oil Palm AGS** - AI-Powered Agriculture System 