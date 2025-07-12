// Quick test to check documents table structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
    console.log('🔍 Quick test of documents table...\n');

    try {
        // Test basic query to see what error we get
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .limit(1);

        if (error) {
            console.log('❌ Documents table error:', error);
            
            // If it's a column error, let's try to identify which columns exist
            if (error.code === 'PGRST204') {
                console.log('\n🔧 Attempting to identify existing columns...');
                
                // Try a minimal query with just id
                const { data: idTest, error: idError } = await supabase
                    .from('documents')
                    .select('id')
                    .limit(1);
                
                if (idError) {
                    console.log('❌ Even basic id query failed:', idError);
                } else {
                    console.log('✅ Basic id query works, table exists but missing columns');
                }
            }
        } else {
            console.log('✅ Documents table query successful');
            console.log('   Found', data?.length || 0, 'documents');
        }

    } catch (err) {
        console.error('❌ Test failed:', err);
    }
}

quickTest(); 