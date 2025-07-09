# Oil Palm AI Assistant - Supabase Setup Guide

This guide helps you set up the Supabase database and storage for the Malaysian Oil Palm AI Assistant.

## 🚀 Quick Start

### Prerequisites

1. Supabase account (free tier supported)
2. A new Supabase project created
3. Database access credentials

### Automated Setup (Recommended)

1. **Get your service role key:**
   - See detailed instructions in `GET_SERVICE_KEY.md`

2. **Add it to your .env.local:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
   ```

3. **Run the setup:**
   ```powershell
   npm run supabase:setup
   ```

### Manual Setup

If you prefer manual setup, see `MANUAL_SETUP.md` for detailed step-by-step instructions.

## 📊 What Gets Created

### Database Tables

1. **prompts** - Dynamic AI prompts with versioning
   - Allows runtime prompt updates without code changes
   - Supports multiple languages (English, Malay)
   - Version control and rollback capabilities

2. **analysis_reports** - Complete analysis results storage
   - Stores input data and generated recommendations
   - Tracks processing methods and performance metrics
   - Links to user profiles for personalization

3. **feedback** - User feedback collection
   - Captures ratings and comments on reports
   - Enables continuous improvement of AI outputs
   - Tracks feedback trends over time

4. **reference_documents** - RAG knowledge base metadata
   - Tracks uploaded reference documents
   - Enables document versioning and updates
   - Links to ChromaDB vector store

5. **user_profiles** - Enhanced user information
   - Plantation details and preferences
   - Historical data and patterns
   - Customization settings

6. **admin_logs** - System audit and monitoring
   - Tracks all administrative actions
   - Monitors system performance
   - Security and compliance logging

### Storage Buckets

1. **uploads** (50MB limit)
   - Temporary storage for user-uploaded files
   - Automatic cleanup after 24 hours
   - Supports: PDF, Excel, CSV, Images

2. **reference-documents** (100MB limit)
   - RAG knowledge base documents
   - MPOB guidelines and research papers
   - Admin-only upload access

3. **reports** (10MB limit)
   - Generated PDF analysis reports
   - User-specific access control
   - Download and sharing capabilities

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Admin users have elevated permissions
- Secure file upload/download policies

### Authentication Integration
- Seamless integration with your auth system
- JWT-based access control
- Role-based permissions

## 🛠️ Available Scripts

```powershell
# Test Supabase connection
npm run supabase:test

# Run full database setup
npm run supabase:setup

# Verify existing setup
npm run supabase:verify
```

## 📁 File Structure

```
supabase/
├── README.md              # This file
├── QUICKSTART.md          # Quick start guide
├── MANUAL_SETUP.md        # Manual setup instructions
├── GET_SERVICE_KEY.md     # How to get service role key
├── schema.sql             # Database schema and policies
├── storage.sql            # Storage buckets and policies
├── setup.js              # Automated setup script
├── setup.ps1             # PowerShell setup script
├── setup.bat             # Batch setup script
└── test-connection.js     # Connection test utility
```

## 🌐 Environment Variables

Required in your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔧 Integration with Application

### API Routes
The setup automatically integrates with your existing API routes:
- `/api/upload-enhanced` - Enhanced file processing with report storage
- `/api/analyze` - Direct analysis with prompt management
- `/api/reference-documents` - Document management

### Frontend Components
Ready for integration with:
- Admin dashboard for prompt management
- User dashboard for report history
- Feedback collection system
- Document upload interface

## 📈 Monitoring and Analytics

### Admin Dashboard Features
- Prompt performance analytics
- User engagement metrics
- System performance monitoring
- Error tracking and debugging

### User Analytics
- Usage patterns and trends
- Feedback sentiment analysis
- Report generation statistics
- Popular features tracking

## 🌍 Multi-Language Support

The database supports:
- **English (en)** - Primary language
- **Malay (ms)** - Local language support

Each prompt can have multiple language variants for better accessibility.

## 🔄 Backup and Maintenance

### Automated Backups
- Daily database backups (Supabase managed)
- Point-in-time recovery available
- Cross-region replication options

### Maintenance Tasks
- Regular cleanup of temporary files
- Performance optimization queries
- Index maintenance and updates

## 🆘 Troubleshooting

### Common Issues

1. **Permission denied errors**
   - Check service role key is correct
   - Verify RLS policies are enabled

2. **Connection timeouts**
   - Check network connectivity
   - Verify Supabase project status

3. **Storage upload failures**
   - Check file size limits
   - Verify MIME type restrictions

4. **Missing tables/functions**
   - Re-run the setup script
   - Check for SQL syntax errors

### Getting Help

1. Check the error logs in Supabase dashboard
2. Review the troubleshooting section in `QUICKSTART.md`
3. Test with the connection utility: `npm run supabase:test`

## 🎯 Next Steps

After successful setup:

1. **Upload Reference Documents**
   - Add MPOB guidelines to reference-documents bucket
   - Upload research papers and best practices
   - Configure ChromaDB integration

2. **Test the Application**
   - Upload sample soil/leaf analysis files
   - Verify analysis results are stored
   - Test feedback collection system

3. **Admin Configuration**
   - Set up admin user accounts
   - Configure prompt templates
   - Review security policies

4. **Production Deployment**
   - Configure production environment variables
   - Set up monitoring and alerts
   - Review backup and recovery procedures

Your Oil Palm AI Assistant database is now ready for advanced agronomic analysis! 🌴

## 📚 Additional Resources

- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL Documentation:** [postgresql.org/docs](https://www.postgresql.org/docs/)
- **RLS Security Guide:** [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- **Size Limit**: 100MB
- **Retention**: Permanent (manually managed)

#### reports
- **Purpose**: Generated analysis reports and PDF downloads
- **Access**: Users can only access their own reports
- **File Types**: PDF, JSON
- **Size Limit**: 10MB
- **Retention**: Permanent per user

### 5. Database Tables Created

#### prompts
- Stores dynamic AI prompts with versioning
- Supports multiple languages (English, Malay)
- Admin-editable via web interface
- Only one active prompt per sample type + language

#### analysis_reports
- Complete analysis history with metadata
- Links to uploaded files and user preferences
- Performance metrics (confidence score, processing time)
- JSONB fields for flexible data storage

#### feedback
- User ratings and comments on analysis quality
- Tracks recommendation effectiveness
- Continuous improvement data collection

#### reference_documents
- Manages RAG knowledge base
- Document metadata and source tracking
- Version control and activation status

#### user_profiles
- Extended user information for personalization
- Default preferences (language, soil type, etc.)
- Professional context (role, experience, location)

#### admin_logs
- Audit trail for administrative actions
- Security and compliance tracking

### 6. Security Features

#### Row Level Security (RLS)
- Users can only access their own data
- Admins have elevated permissions
- Secure file access patterns

#### Storage Policies
- User isolation for uploads and reports
- Admin-only access to reference documents
- Automatic cleanup of temporary files

#### Data Validation
- Custom PostgreSQL types for data integrity
- File upload validation (size, type)
- Business logic constraints

### 7. Admin Interface Setup

The system includes admin functions for:

- **Prompt Management**: Update AI prompts without code deployment
- **Document Management**: Upload/manage RAG knowledge base
- **User Analytics**: Monitor system usage and performance
- **Feedback Analysis**: Review user ratings and improve outputs

### 8. API Integration

The Next.js API routes automatically integrate with Supabase:

```typescript
// Example: Store analysis report
const { data, error } = await supabase
  .from('analysis_reports')
  .insert({
    user_id: userId,
    sample_type: 'soil',
    input_data: extractedData,
    analysis_result: analysis,
    confidence_score: analysis.confidenceScore
  });
```

### 9. Maintenance Tasks

#### Automated Cleanup
- Old upload files (24 hours): `SELECT cleanup_old_uploads();`
- Scheduled via Supabase Edge Functions or external cron

#### Performance Monitoring
- Storage usage: `SELECT get_storage_stats();`
- User analytics: `SELECT get_user_analytics(user_id);`

#### Backup Strategy
- Regular database backups via Supabase dashboard
- Reference documents backup (admin responsibility)

### 10. Scaling Considerations

#### Free Tier Limits (Supabase)
- 500MB database storage
- 1GB file storage
- 50MB file upload limit
- 50,000 monthly active users

#### Upgrade Triggers
- Storage approaching limits
- High user volume
- Need for custom domains
- Enhanced security requirements

### 11. Malaysian Oil Palm Specific Features

#### Knowledge Base Integration
- MPOB guidelines and standards
- Regional soil type classifications
- Tenera palm nutritional requirements
- RSPO sustainability criteria

#### Localization Support
- English/Malay language prompts
- Malaysian agricultural terminology
- Regional benchmarking data

#### Industry-Specific Analytics
- Yield forecasting (tons/ha)
- Nutrient balance calculations
- Regional performance comparisons
- Sustainability metrics

This setup provides a production-ready foundation for the Malaysian Oil Palm AI Assistant with comprehensive data management, security, and scalability features.
