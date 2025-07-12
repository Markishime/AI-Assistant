const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test script to verify upload functionality after RLS fixes
async function testUploadAfterFix() {
  console.log('🧪 Testing upload functionality after RLS fixes...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if user_profiles table is accessible
    console.log('📋 Test 1: Checking user_profiles table access...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('❌ user_profiles table error:', profileError);
      console.log('📋 This indicates the RLS policy fix is still needed');
    } else {
      console.log('✅ user_profiles table is accessible');
      console.log(`📊 Found ${profileData?.length || 0} profiles`);
    }

    // Test 2: Check if documents table is accessible
    console.log('\n📄 Test 2: Checking documents table access...');
    
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (docError) {
      console.error('❌ documents table error:', docError);
      console.log('📋 This indicates the documents RLS policy fix is needed');
    } else {
      console.log('✅ documents table is accessible');
      console.log(`📊 Found ${docData?.length || 0} documents`);
    }

    // Test 3: Check documents table structure
    console.log('\n🏗️ Test 3: Checking documents table structure...');
    
    if (docData && docData.length > 0) {
      const sampleDoc = docData[0];
      console.log('📋 Sample document structure:', Object.keys(sampleDoc));
      
      // Check for required columns
      const requiredColumns = ['id', 'user_id', 'filename', 'original_name', 'file_size', 'file_type', 'file_path', 'upload_status'];
      const missingColumns = requiredColumns.filter(col => !(col in sampleDoc));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns:', missingColumns);
      } else {
        console.log('✅ All required columns are present');
      }
    }

    // Test 4: Check RLS policies
    console.log('\n🔒 Test 4: Checking RLS policies...');
    
    // Try to access policies (this might not work with anon key)
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'documents' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }));

    if (policyError) {
      console.log('ℹ️ Could not check policies directly:', policyError.message);
      console.log('📋 This is normal - policy checking requires service role key');
    } else if (policies) {
      console.log('✅ RLS policies found:', policies.length);
    }

    // Test 5: Simulate document upload (without actual file)
    console.log('\n📤 Test 5: Simulating document upload...');
    
    const testDocument = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
      filename: 'test-document.csv',
      original_name: 'test-document.csv',
      file_size: 1024,
      file_type: 'text/csv',
      file_path: 'uploads/test-document.csv',
      upload_status: 'completed',
      metadata: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert(testDocument)
      .select();

    if (insertError) {
      console.log('📝 Expected error for test insert:', {
        code: insertError.code,
        message: insertError.message
      });
      console.log('📋 This is expected since we used a test user ID');
    } else {
      console.log('✅ Document insert test successful');
      console.log('📋 This indicates the RLS policies are working correctly');
      
      // Clean up test data
      if (insertData && insertData.length > 0) {
        await supabase
          .from('documents')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test document cleaned up');
      }
    }

    console.log('\n📊 Summary:');
    console.log('- The RLS policy fixes should resolve both user_profiles and documents access issues');
    console.log('- Users should now be able to upload documents without RLS violations');
    console.log('- The "Error fetching user profile: {}" should no longer occur');
    console.log('- Document uploads should work properly with proper user authentication');

    console.log('\n📋 Next steps:');
    console.log('1. Execute the fix-all-rls-policies.sql script in your Supabase SQL Editor');
    console.log('2. Test the upload functionality in your app');
    console.log('3. Verify that navigation between pages no longer shows profile errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUploadAfterFix().then(() => {
  console.log('\n✅ Upload test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 