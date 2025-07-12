const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runDocumentsFix() {
  console.log('🔧 Running SQL fix for documents RLS policies...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '❌');
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌');
    console.error('\nPlease add the missing variables to your .env.local file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase', 'fix-documents-rls.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL fix content:');
    console.log('📋 Please execute this SQL manually in your Supabase SQL Editor:');
    console.log('\n' + sqlContent);
    console.log('\n🔗 Direct link: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql');
    
    // Test current state
    console.log('\n🧪 Testing current documents table access...');
    const { data: testData, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Current error:', testError);
      console.log('📋 This confirms the RLS policy issue needs to be fixed');
    } else {
      console.log('✅ Documents table is currently accessible');
    }

    // Check documents table structure
    console.log('\n📊 Checking documents table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'documents' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }));

    if (columnsError) {
      console.log('ℹ️ Could not check table structure directly');
      console.log('📋 Expected columns: id, user_id, filename, original_name, file_size, file_type, file_path, upload_status, metadata, created_at, updated_at');
    } else if (columns) {
      console.log('✅ Table structure:', columns);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runDocumentsFix().then(() => {
  console.log('\n✅ Documents fix process completed');
  console.log('\n📋 Next steps:');
  console.log('1. Copy the SQL content above');
  console.log('2. Go to your Supabase SQL Editor');
  console.log('3. Paste and execute the SQL script');
  console.log('4. Test the upload functionality in your app');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Process failed:', error);
  process.exit(1);
}); 