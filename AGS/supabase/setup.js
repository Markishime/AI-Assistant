#!/usr/bin/env node

/**
 * Oil Palm AI Assistant - Supabase Setup Script
 * This script initializes the Supabase database and storage for the project
 */

import { createClient } from '@supabase/supabase-js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '❌');
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌');
    console.error('\nPlease add the missing variables to your .env.local file');
    console.error('You can find these in your Supabase project dashboard under Settings > API');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🏗️  Setting up Supabase database...');
    
    try {
        console.log('📄 Manual database setup required...');
        console.log('\n⚠️  Supabase requires manual SQL execution for security reasons.');
        console.log('\n📋 Please follow these steps:');
        console.log('1. Open your Supabase project dashboard');
        console.log('2. Go to the SQL Editor');
        console.log('3. Copy the contents of supabase/schema.sql');
        console.log('4. Paste and execute the SQL script');
        console.log('\n� Direct link: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql');
        
        // Test if basic tables exist to verify setup
        console.log('\n🔍 Checking if schema is already set up...');
        
        // Try to access the prompts table directly
        const { error: promptsError } = await supabase
            .from('prompts')
            .select('id')
            .limit(1);
        
        if (promptsError && promptsError.code === '42P01') {
            // Table doesn't exist - schema not set up
            console.log('❌ Database schema not found - please run the SQL script manually');
            console.log('\n📋 Manual Setup Required:');
            console.log('1. Copy the contents of supabase/schema.sql');
            console.log('2. Go to your Supabase SQL Editor');
            console.log('3. Paste and execute the SQL script');
            console.log('4. Re-run this setup script to continue');
            return false;
        } else if (promptsError) {
            console.log('⚠️  Error checking schema:', promptsError.message);
            console.log('📋 Please ensure you have executed the schema.sql file manually');
            return false;
        } else {
            console.log('✅ Database schema appears to be already set up!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        return false;
    }
}

async function setupStorage() {
    console.log('🗄️  Setting up Supabase storage...');
    
    try {
        console.log('📄 Checking storage configuration...');
        
        // Check if storage buckets exist
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();
        
        if (bucketsError) {
            console.log('⚠️  Cannot access storage - manual setup may be required');
            console.log('\n📋 Please manually create storage buckets:');
            console.log('1. Go to Storage in your Supabase dashboard');
            console.log('2. Create these buckets:');
            console.log('   - uploads (50MB limit, private)');
            console.log('   - reference-documents (100MB limit, private)');
            console.log('   - reports (10MB limit, private)');
            return false;
        }
        
        const expectedBuckets = ['uploads', 'reference-documents', 'reports'];
        const existingBuckets = buckets.map(b => b.name);
        const missingBuckets = expectedBuckets.filter(b => !existingBuckets.includes(b));
        
        if (missingBuckets.length === 0) {
            console.log('✅ All storage buckets already exist');
            return true;
        } else {
            console.log('⚠️  Missing storage buckets:', missingBuckets);
            console.log('\n📋 Please manually create the missing buckets in your Supabase dashboard');
            console.log('🔗 Direct link: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/storage/buckets');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error setting up storage:', error);
        return false;
    }
}

async function seedInitialData() {
    console.log('🌱 Seeding initial data...');
    
    try {
        // Check if prompts already exist
        const { data: existingPrompts, error: promptCheckError } = await supabase
            .from('prompts')
            .select('*')
            .limit(1);
        
        if (promptCheckError) {
            console.error('❌ Cannot access prompts table:', promptCheckError.message);
            console.log('📋 Please ensure the database schema is set up first');
            return false;
        }
        
        if (existingPrompts && existingPrompts.length > 0) {
            console.log('✅ Initial data already exists, skipping seeding');
            return true;
        }
        
        // Insert default prompts only if table is empty
        const { error: promptError } = await supabase
            .from('prompts')
            .insert([
                {
                    version: '1.0',
                    title: 'Oil Palm Soil Analysis',
                    description: 'Comprehensive soil analysis for oil palm cultivation',
                    template: `You are an expert Malaysian oil palm agronomist. Analyze the provided soil data and provide detailed recommendations for optimal palm cultivation.

Consider:
- Soil pH and nutrient levels
- Organic matter content
- Regional climate factors
- Sustainable practices
- Malaysian oil palm guidelines

Provide recommendations in JSON format with immediate, short-term, and long-term actions.`,
                    sample_type: 'soil',
                    language: 'en',
                    user_focus: 'balanced',
                    is_active: true
                },
                {
                    version: '1.0',
                    title: 'Oil Palm Leaf Analysis',
                    description: 'Comprehensive leaf analysis for oil palm nutrition',
                    template: `You are an expert Malaysian oil palm agronomist. Analyze the provided leaf analysis data and provide detailed nutritional recommendations.

Consider:
- Nutrient deficiencies and excesses
- Leaf sampling protocols
- Fertilizer recommendations
- Yield optimization
- Cost-effective solutions

Provide recommendations in JSON format with immediate, short-term, and long-term actions.`,
                    sample_type: 'leaf',
                    language: 'en',
                    user_focus: 'balanced',
                    is_active: true
                }
            ]);
        
        if (promptError) {
            console.error('❌ Error seeding prompts:', promptError.message);
            return false;
        }
        
        console.log('✅ Initial prompts seeded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error seeding initial data:', error);
        return false;
    }
}

async function verifySetup() {
    console.log('🔍 Verifying setup...');
    
    try {
        // Check if the main tables exist by trying to query them
        const tablesToCheck = [
            { name: 'prompts', description: 'Dynamic prompts table' },
            { name: 'analysis_reports', description: 'Analysis reports table' },
            { name: 'feedback', description: 'User feedback table' },
            { name: 'reference_documents', description: 'Reference documents table' },
            { name: 'user_profiles', description: 'User profiles table' },
            { name: 'admin_logs', description: 'Admin logs table' }
        ];
        
        console.log('📊 Checking database tables...');
        const tableResults = [];
        
        for (const table of tablesToCheck) {
            try {
                const { error } = await supabase
                    .from(table.name)
                    .select('*')
                    .limit(1);
                
                if (error && error.code === '42P01') {
                    // Table doesn't exist
                    tableResults.push({ name: table.name, exists: false, error: 'Table not found' });
                } else if (error) {
                    // Other error (might be RLS or permissions, but table exists)
                    tableResults.push({ name: table.name, exists: true, error: error.message });
                } else {
                    // No error, table exists and is accessible
                    tableResults.push({ name: table.name, exists: true, error: null });
                }
            } catch (err) {
                tableResults.push({ name: table.name, exists: false, error: err.message });
            }
        }
        
        // Display results
        const existingTables = tableResults.filter(t => t.exists);
        const missingTables = tableResults.filter(t => !t.exists);
        
        console.log(`✅ Tables found: ${existingTables.map(t => t.name).join(', ')}`);
        
        if (missingTables.length > 0) {
            console.log(`❌ Missing tables: ${missingTables.map(t => t.name).join(', ')}`);
            console.log('\n📋 Please execute the database schema manually:');
            console.log('1. Go to your Supabase SQL Editor');
            console.log('2. Copy and paste the contents of supabase/schema.sql');
            console.log('3. Execute the script');
            return false;
        }
        
        // Check storage buckets
        console.log('\n🗄️  Checking storage buckets...');
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();
        
        if (bucketsError) {
            console.log('⚠️  Cannot access storage:', bucketsError.message);
            console.log('📋 Please create storage buckets manually in your Supabase dashboard');
        } else {
            const expectedBuckets = ['uploads', 'reference-documents', 'reports'];
            const existingBuckets = buckets.map(b => b.name);
            const foundBuckets = expectedBuckets.filter(b => existingBuckets.includes(b));
            const missingBuckets = expectedBuckets.filter(b => !existingBuckets.includes(b));
            
            console.log(`✅ Storage buckets found: ${foundBuckets.join(', ')}`);
            
            if (missingBuckets.length > 0) {
                console.log(`⚠️  Missing buckets: ${missingBuckets.join(', ')}`);
                console.log('📋 Please create the missing buckets in your Supabase dashboard');
            }
        }
        
        // Test basic operations
        console.log('\n🧪 Testing basic operations...');
        try {
            const { data: activePrompts, error: promptsError } = await supabase
                .from('prompts')
                .select('id, title, is_active')
                .eq('is_active', true)
                .limit(2);
            
            if (promptsError) {
                console.log('⚠️  Cannot query prompts:', promptsError.message);
            } else {
                console.log(`✅ Found ${activePrompts?.length || 0} active prompts`);
            }
        } catch (error) {
            console.log('⚠️  Error testing prompts table:', error.message);
        }
        
        const allTablesExist = missingTables.length === 0;
        const bucketsAccessible = !bucketsError;
        
        if (allTablesExist && bucketsAccessible) {
            console.log('\n🎉 Setup verification completed successfully!');
            return true;
        } else {
            console.log('\n⚠️  Setup partially complete - please address the issues above');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error verifying setup:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Supabase setup for Oil Palm AI Assistant...\n');
    
    const steps = [
        { name: 'Database Setup', fn: setupDatabase },
        { name: 'Storage Setup', fn: setupStorage },
        { name: 'Initial Data Seeding', fn: seedInitialData },
        { name: 'Setup Verification', fn: verifySetup }
    ];
    
    for (const step of steps) {
        console.log(`\n--- ${step.name} ---`);
        const success = await step.fn();
        if (!success) {
            console.error(`❌ ${step.name} failed. Stopping setup.`);
            process.exit(1);
        }
    }
    
    console.log('\n🎉 Supabase setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Upload reference documents to the reference-documents bucket');
    console.log('2. Test the application with some sample data');
    console.log('3. Monitor the admin logs for any issues');
    console.log('\nYour Oil Palm AI Assistant is ready to use! 🌴');
}

main().catch(console.error);
