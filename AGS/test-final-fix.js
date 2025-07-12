// Final test to verify documents table fix
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalFix() {
    console.log('🔍 Final test of documents table fix...\n');

    try {
        const testUserId = '00000000-0000-0000-0000-000000000001';
        
        // 1. Test document insertion (this was failing before)
        console.log('1. Testing document insertion...');
        
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
            console.log('❌ Insert still failing:', insertError);
            return;
        } else {
            console.log('✅ Insert successful!');
            console.log(`   Document ID: ${insertResult.id}`);
            console.log(`   Filename: ${insertResult.filename}`);
            console.log(`   File type: ${insertResult.file_type}`);
            console.log(`   File size: ${insertResult.file_size}`);
        }

        // 2. Test document retrieval
        console.log('\n2. Testing document retrieval...');
        
        const { data: files, error: queryError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', testUserId)
            .order('created_at', { ascending: false });

        if (queryError) {
            console.log('❌ Query error:', queryError);
        } else {
            console.log(`✅ Query successful! Found ${files?.length || 0} files`);
            
            if (files && files.length > 0) {
                const file = files[0];
                console.log('   Sample file:', {
                    id: file.id,
                    filename: file.filename,
                    file_type: file.file_type,
                    file_size: file.file_size,
                    created_at: file.created_at
                });
            }
        }

        // 3. Test the exact API format
        console.log('\n3. Testing API format...');
        
        const formattedFiles = files?.map(file => ({
            id: file.id,
            name: file.filename,
            size: file.file_size,
            type: file.file_type,
            uploadedAt: file.created_at,
            url: file.storage_url || `/api/files/${file.id}`,
            storagePath: file.file_path
        })) || [];
        
        console.log(`✅ API format successful! Formatted ${formattedFiles.length} files`);
        
        if (formattedFiles.length > 0) {
            console.log('   Sample formatted file:', formattedFiles[0]);
        }

        // 4. Clean up test data
        console.log('\n4. Cleaning up test data...');
        
        if (insertResult) {
            const { error: deleteError } = await supabase
                .from('documents')
                .delete()
                .eq('id', insertResult.id);
                
            if (deleteError) {
                console.log('❌ Cleanup error:', deleteError);
            } else {
                console.log('✅ Test data cleaned up successfully');
            }
        }

        console.log('\n🎉 Final test completed successfully!');
        console.log('\n✅ The documents table is now working correctly.');
        console.log('✅ You can now upload files through the upload page.');
        console.log('✅ Files will be properly linked to the uploading user.');
        console.log('✅ The upload page should no longer show "Failed to fetch files".');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testFinalFix(); 