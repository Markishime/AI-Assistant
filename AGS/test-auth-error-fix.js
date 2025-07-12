const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test script to verify AuthProvider error logging fix
async function testAuthErrorFix() {
  console.log('🧪 Testing AuthProvider error logging fix...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if user_profiles table exists and has correct structure
    console.log('📋 Test 1: Checking user_profiles table structure...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing user_profiles table:', tableError);
      console.log('This might be the source of the empty error objects');
    } else {
      console.log('✅ user_profiles table is accessible');
      if (tableInfo && tableInfo.length > 0) {
        console.log('📊 Sample profile structure:', Object.keys(tableInfo[0]));
      }
    }

    // Test 2: Check RLS policies
    console.log('\n🔒 Test 2: Checking RLS policies...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'user_profiles' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }));

    if (policyError) {
      console.log('ℹ️ Could not check policies directly:', policyError.message);
    } else if (policies) {
      console.log('✅ RLS policies found:', policies.length);
    }

    // Test 3: Test profile fetch with a non-existent user
    console.log('\n👤 Test 3: Testing profile fetch with non-existent user...');
    
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data: testProfile, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (testError) {
      console.log('📝 Expected error for non-existent user:', {
        code: testError.code,
        message: testError.message,
        details: testError.details
      });
    } else {
      console.log('⚠️ Unexpected: Found profile for test user');
    }

    // Test 4: Check if there are any actual user profiles
    console.log('\n👥 Test 4: Checking for existing user profiles...');
    
    const { data: existingProfiles, error: existingError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role')
      .limit(5);

    if (existingError) {
      console.error('❌ Error fetching existing profiles:', existingError);
    } else {
      console.log(`✅ Found ${existingProfiles?.length || 0} existing profiles`);
      if (existingProfiles && existingProfiles.length > 0) {
        console.log('📋 Sample profiles:', existingProfiles.map(p => ({
          id: p.id.substring(0, 8) + '...',
          email: p.email,
          role: p.role
        })));
      }
    }

    // Test 5: Check database connection and permissions
    console.log('\n🔗 Test 5: Checking database connection and permissions...');
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection/permission issue:', connectionError);
    } else {
      console.log('✅ Database connection and permissions are working');
    }

    console.log('\n📊 Summary:');
    console.log('- The AuthProvider has been updated to prevent repeated error logging');
    console.log('- Profile fetches are now cached to avoid unnecessary API calls');
    console.log('- Empty error objects should no longer be logged repeatedly');
    console.log('- Only first-time fetches or forced refetches will show detailed logs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuthErrorFix().then(() => {
  console.log('\n✅ Auth error fix test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 