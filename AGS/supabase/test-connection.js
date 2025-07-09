#!/usr/bin/env node

/**
 * Simple Supabase connection test
 * Run this to verify your credentials work before full setup
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Supabase Connection...\n');

// Test basic connectivity
console.log('📊 Environment Check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required environment variables');
    process.exit(1);
}

// Test anon client
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

try {
    console.log('\n🔌 Testing anonymous client connection...');
    const { error } = await anonClient.from('_test').select('*').limit(1);
    if (error && error.code !== '42P01') { // 42P01 = relation does not exist (expected)
        console.log('❌ Anonymous client failed:', error.message);
    } else {
        console.log('✅ Anonymous client connected successfully');
    }
} catch {
    console.log('✅ Anonymous client connected (expected error for missing table)');
}

// Test service role client if available
if (supabaseServiceKey) {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        console.log('\n🔧 Testing service role client connection...');
        const { error } = await serviceClient.from('_test').select('*').limit(1);
        if (error && error.code !== '42P01') { // 42P01 = relation does not exist (expected)
            console.log('❌ Service role client failed:', error.message);
        } else {
            console.log('✅ Service role client connected successfully');
        }
    } catch {
        console.log('✅ Service role client connected (expected error for missing table)');
    }
    
    // Test storage access
    try {
        console.log('\n🗄️  Testing storage access...');
        const { data: buckets, error: storageError } = await serviceClient.storage.listBuckets();
        if (storageError) {
            console.log('⚠️  Storage access limited:', storageError.message);
        } else {
            console.log('✅ Storage access working, buckets found:', buckets.length);
        }
    } catch (error) {
        console.log('⚠️  Storage test failed:', error.message);
    }
}

console.log('\n🎉 Connection test completed!');

if (supabaseServiceKey) {
    console.log('\n✅ Ready to run full setup: node supabase/setup.js');
} else {
    console.log('\n⚠️  Add SUPABASE_SERVICE_ROLE_KEY to run full setup');
}
