// Test script to simulate upload API GET request
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadAPI() {
    console.log('🔍 Testing upload API GET request...\n');

    try {
        // Test with a dummy user ID first
        const testUserId = '00000000-0000-0000-0000-000000000001';
        
        console.log('1. Testing with dummy user ID:', testUserId);
        
        const { data: files, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', testUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.log('❌ Database query error:', error);
        } else {
            console.log('✅ Database query successful');
            console.log(`   Found ${files?.length || 0} files for user`);
            
            if (files && files.length > 0) {
                console.log('   Sample file:', {
                    id: files[0].id,
                    filename: files[0].filename,
                    file_size: files[0].file_size,
                    created_at: files[0].created_at
                });
            }
        }

        // Test the exact query that the API makes
        console.log('\n2. Testing exact API query...');
        
        const { data: apiFiles, error: apiError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', testUserId)
            .order('created_at', { ascending: false });

        if (apiError) {
            console.log('❌ API query error:', apiError);
        } else {
            console.log('✅ API query successful');
            
            // Format files like the API does
            const formattedFiles = apiFiles?.map(file => ({
                id: file.id,
                name: file.filename,
                size: file.file_size,
                type: file.file_type,
                uploadedAt: file.created_at,
                url: file.storage_url || `/api/files/${file.id}`,
                storagePath: file.file_path
            })) || [];
            
            console.log(`   Formatted ${formattedFiles.length} files`);
            
            if (formattedFiles.length > 0) {
                console.log('   Sample formatted file:', formattedFiles[0]);
            }
        }

        // Test with null user ID (like the API does)
        console.log('\n3. Testing with null user ID...');
        
        const { data: nullFiles, error: nullError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', null)
            .order('created_at', { ascending: false });

        if (nullError) {
            console.log('❌ Null user ID query error:', nullError);
        } else {
            console.log('✅ Null user ID query successful (returns empty array)');
            console.log(`   Found ${nullFiles?.length || 0} files`);
        }

        // Test table structure
        console.log('\n4. Testing table structure...');
        
        // Try to insert a test document
        const testDoc = {
            user_id: testUserId,
            filename: 'test.csv',
            original_name: 'test.csv',
            file_size: 1024,
            file_type: 'text/csv',
            file_path: 'test/path.csv',
            storage_url: 'https://example.com/test.csv',
            upload_status: 'completed',
            metadata: { test: true }
        };
        
        const { data: insertResult, error: insertError } = await supabase
            .from('documents')
            .insert(testDoc)
            .select()
            .single();

        if (insertError) {
            console.log('❌ Insert test error:', insertError);
        } else {
            console.log('✅ Insert test successful');
            console.log(`   Inserted document ID: ${insertResult.id}`);
            
            // Clean up
            await supabase.from('documents').delete().eq('id', insertResult.id);
            console.log('   Test document cleaned up');
        }

        console.log('\n🎉 Upload API test complete!');
        
        if (error || apiError || insertError) {
            console.log('\n⚠️  Issues found:');
            console.log('1. Some database operations failed');
            console.log('2. Check the error messages above');
        } else {
            console.log('\n✅ All tests passed! The upload API should work correctly.');
        }

    } catch (err) {
        console.error('❌ Test failed:', err);
    }
}

testUploadAPI(); 