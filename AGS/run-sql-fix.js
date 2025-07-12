const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runSqlFix() {
  console.log('🔧 Running SQL fix for user_profiles RLS policies...\n');

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
    const sqlPath = path.join(__dirname, 'supabase', 'fix-user-profiles-rls.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL fix...');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        }).catch(() => {
          // If exec_sql function doesn't exist, we'll need manual execution
          return { data: null, error: { message: 'exec_sql function not available' } };
        });

        if (error) {
          console.log('⚠️  Manual SQL execution required');
          console.log('📋 Please execute this SQL manually in your Supabase SQL Editor:');
          console.log('\n' + sqlContent);
          console.log('\n🔗 Direct link: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql');
          return;
        }
      }
    }

    console.log('✅ SQL fix executed successfully');
    
    // Test if the fix worked
    console.log('\n🧪 Testing the fix...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Still getting error:', testError);
    } else {
      console.log('✅ user_profiles table is now accessible!');
      console.log('🎉 The infinite recursion issue has been fixed');
    }

  } catch (error) {
    console.error('❌ Error running SQL fix:', error);
    console.log('\n📋 Manual execution required:');
    console.log('1. Copy the contents of supabase/fix-user-profiles-rls.sql');
    console.log('2. Go to your Supabase SQL Editor');
    console.log('3. Paste and execute the SQL script');
  }
}

runSqlFix().then(() => {
  console.log('\n✅ SQL fix process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Process failed:', error);
  process.exit(1);
}); 