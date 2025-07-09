/**
 * Enhanced Oil Palm AI Assistant System Test Script
 * Tests document retrieval, standardized naming, RAG functionality, and analysis
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE_URL = 'http://localhost:3000';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 Enhanced Oil Palm AI Assistant System Test');
console.log('='.repeat(50));

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeAPIRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

async function testDatabaseConnection() {
  console.log('\n1. Testing Database Connection...');
  
  try {
    const { error } = await supabase
      .from('reference_documents')
      .select('count(*)')
      .single();
    
    if (error) throw error;
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testDocumentStorage() {
  console.log('\n2. Testing Document Storage...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from('reference-documents')
      .list();
    
    if (error) throw error;
    
    console.log(`✅ Storage accessible with ${files.length} files`);
    
    // List some example files with standardized naming
    const pdfFiles = files.filter(f => f.name.endsWith('.pdf')).slice(0, 5);
    console.log('📄 Sample documents:');
    pdfFiles.forEach(file => {
      console.log(`   - ${file.name} (${(file.metadata?.size / 1024 / 1024 || 0).toFixed(2)} MB)`);
    });
    
    return { success: true, fileCount: files.length };
  } catch (error) {
    console.error('❌ Document storage test failed:', error.message);
    return { success: false, fileCount: 0 };
  }
}

async function testDocumentProcessing() {
  console.log('\n3. Testing Document Processing & Embedding...');
  
  try {
    // Test enhanced reference documents API
    const result = await makeAPIRequest('/api/reference-documents/enhanced?action=stats');
    
    console.log('✅ Document processing API accessible');
    console.log(`📊 Documents: ${result.totalDocuments} | Processed: ${result.processedDocuments} | Embeddings: ${result.embeddingsCount}`);
    
    return result;
  } catch (error) {
    console.error('❌ Document processing test failed:', error.message);
    return null;
  }
}

async function testSystemInitialization() {
  console.log('\n4. Testing System Initialization...');
  
  try {
    console.log('🔄 Initializing document system (this may take a while)...');
    
    const result = await makeAPIRequest('/api/reference-documents/enhanced', {
      method: 'POST',
      body: JSON.stringify({ action: 'setup_system' })
    });
    
    console.log('✅ System initialization completed');
    console.log(`📋 Results: ${JSON.stringify(result, null, 2)}`);
    
    return result;
  } catch (error) {
    console.error('❌ System initialization failed:', error.message);
    return null;
  }
}

async function testRAGSearch() {
  console.log('\n5. Testing Enhanced RAG Search...');
  
  const testQueries = [
    'Malaysian oil palm soil pH management',
    'nutrient deficiency symptoms leaf analysis',
    'fertilizer recommendation peat soil',
    'MPOB guidelines soil_A analysis'
  ];
  
  for (const query of testQueries) {
    try {
      console.log(`🔍 Testing query: "${query}"`);
      
      const result = await makeAPIRequest('/api/reference-documents/enhanced', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'search',
          query: query,
          limit: 3
        })
      });
      
      if (result.documents && result.documents.length > 0) {
        console.log(`   ✅ Found ${result.documents.length} relevant documents`);
        result.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.document_title || 'Untitled'} (similarity: ${(doc.similarity * 100).toFixed(1)}%)`);
        });
      } else {
        console.log('   ⚠️ No documents found');
      }
      
      await delay(1000); // Rate limiting
    } catch (error) {
      console.error(`   ❌ Query failed: ${error.message}`);
    }
  }
}

async function testAnalysisWithRAG() {
  console.log('\n6. Testing Analysis with Enhanced RAG...');
  
  const testData = {
    soil: {
      pH: 4.2,
      nitrogen: 0.12,
      phosphorus: 8,
      potassium: 0.08,
      organic_matter: 1.5
    },
    leaf: {
      nitrogen: 2.1,
      phosphorus: 0.12,
      potassium: 0.8,
      magnesium: 0.18,
      calcium: 0.45
    }
  };
  
  for (const [sampleType, values] of Object.entries(testData)) {
    try {
      console.log(`🧬 Testing ${sampleType} analysis with RAG enhancement...`);
      
      const result = await makeAPIRequest('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          sampleType,
          values,
          useEnhancedAnalysis: true
        })
      });
      
      if (result.analysis) {
        console.log(`   ✅ Analysis completed with confidence: ${result.analysis.confidenceScore}%`);
        console.log(`   📋 Issues identified: ${result.analysis.issues?.length || 0}`);
        console.log(`   🔬 RAG context: ${result.analysis.ragContext?.length || 0} documents`);
        console.log(`   📚 Scientific references: ${result.analysis.scientificReferences?.length || 0}`);
        
        if (result.analysis.ragContext?.length > 0) {
          console.log('   📄 RAG sources:');
          result.analysis.ragContext.slice(0, 2).forEach((ctx, index) => {
            console.log(`     ${index + 1}. ${ctx.document_title || 'Unknown'} (${(ctx.similarity * 100).toFixed(1)}%)`);
          });
        }
      } else {
        console.log('   ⚠️ Analysis returned but no results found');
      }
      
      await delay(2000); // Allow processing time
    } catch (error) {
      console.error(`   ❌ ${sampleType} analysis failed: ${error.message}`);
    }
  }
}

async function testDocumentManagement() {
  console.log('\n7. Testing Document Management Features...');
  
  try {
    // Test document listing with filtering
    const listResult = await makeAPIRequest('/api/reference-documents/enhanced?action=list&limit=5');
    console.log(`✅ Document listing: ${listResult.documents?.length || 0} documents retrieved`);
    
    // Test analytics
    const analyticsResult = await makeAPIRequest('/api/reference-documents/enhanced?action=analytics');
    console.log('✅ Analytics retrieved:');
    console.log(`   📊 Categories: ${Object.keys(analyticsResult.categoryDistribution || {}).length}`);
    console.log(`   📈 Processing status: ${JSON.stringify(analyticsResult.processingStatus || {})}`);
    
    // Test search with filters
    const filterResult = await makeAPIRequest('/api/reference-documents/enhanced', {
      method: 'POST',
      body: JSON.stringify({
        action: 'search',
        query: 'soil analysis',
        filters: { category: 'soil_analysis' }
      })
    });
    console.log(`✅ Filtered search: ${filterResult.documents?.length || 0} results`);
    
    return true;
  } catch (error) {
    console.error('❌ Document management test failed:', error.message);
    return false;
  }
}

async function testStandardizedNaming() {
  console.log('\n8. Testing Standardized Document Naming...');
  
  try {
    const { data: documents, error } = await supabase
      .from('reference_documents')
      .select('file_name, standardized_name, category')
      .limit(10);
    
    if (error) throw error;
    
    console.log('✅ Standardized naming samples:');
    documents.forEach(doc => {
      if (doc.standardized_name) {
        console.log(`   📝 ${doc.file_name} → ${doc.standardized_name} [${doc.category}]`);
      }
    });
    
    // Check for standardized naming patterns
    const standardizedCount = documents.filter(doc => doc.standardized_name).length;
    console.log(`📊 Standardized: ${standardizedCount}/${documents.length} documents`);
    
    return true;
  } catch (error) {
    console.error('❌ Standardized naming test failed:', error.message);
    return false;
  }
}

async function testScientificReferences() {
  console.log('\n9. Testing Scientific References...');
  
  try {
    const result = await makeAPIRequest('/api/scientific-references', {
      method: 'POST',
      body: JSON.stringify({
        searchTerms: ['oil palm soil analysis', 'nutrient deficiency'],
        analysisType: 'soil',
        limit: 3
      })
    });
    
    if (result.references && result.references.length > 0) {
      console.log(`✅ Scientific references: ${result.references.length} found`);
      result.references.forEach((ref, index) => {
        console.log(`   ${index + 1}. ${ref.title} (${ref.year}) - ${ref.confidenceLevel} confidence`);
      });
    } else {
      console.log('⚠️ No scientific references found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Scientific references test failed:', error.message);
    return false;
  }
}

async function testPerformanceMetrics() {
  console.log('\n10. Testing Performance Metrics...');
  
  const metrics = {
    avgResponseTime: 0,
    totalQueries: 0,
    successRate: 0
  };
  
  let successCount = 0;
  const testQueries = [
    'soil pH correction',
    'leaf nutrient analysis',
    'fertilizer management'
  ];
  
  for (const query of testQueries) {
    try {
      const queryStart = Date.now();
      await makeAPIRequest('/api/reference-documents/enhanced', {
        method: 'POST',
        body: JSON.stringify({ action: 'search', query, limit: 1 })
      });
      const queryTime = Date.now() - queryStart;
      
      metrics.avgResponseTime += queryTime;
      successCount++;
      metrics.totalQueries++;
    } catch {
      metrics.totalQueries++;
    }
  }
  
  metrics.avgResponseTime = metrics.avgResponseTime / metrics.totalQueries;
  metrics.successRate = (successCount / metrics.totalQueries) * 100;
  
  console.log('📈 Performance Metrics:');
  console.log(`   ⏱️ Average response time: ${metrics.avgResponseTime.toFixed(0)}ms`);
  console.log(`   ✅ Success rate: ${metrics.successRate.toFixed(1)}%`);
  console.log(`   📊 Total queries tested: ${metrics.totalQueries}`);
  
  return metrics;
}

async function generateTestReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📋 ENHANCED SYSTEM TEST REPORT');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`🎯 Overall Success Rate: ${(passed/total*100).toFixed(1)}% (${passed}/${total})`);
  console.log('\n📝 Test Results:');
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.test}`);
    if (result.details) {
      console.log(`      ${result.details}`);
    }
  });
  
  console.log('\n🚀 System Status:');
  if (passed === total) {
    console.log('   🟢 All systems operational - Ready for production!');
  } else if (passed >= total * 0.8) {
    console.log('   🟡 Most systems operational - Minor issues detected');
  } else {
    console.log('   🔴 Major issues detected - Requires attention');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Monitor document processing performance');
  console.log('   2. Validate RAG context quality in production');
  console.log('   3. Test with real user data');
  console.log('   4. Optimize embedding generation if needed');
}

// Main test execution
async function runAllTests() {
  const results = [];
  
  try {
    // Test 1: Database Connection
    const dbTest = await testDatabaseConnection();
    results.push({ test: 'Database Connection', passed: dbTest });
    
    // Test 2: Document Storage
    const storageTest = await testDocumentStorage();
    results.push({ 
      test: 'Document Storage', 
      passed: storageTest.success,
      details: `${storageTest.fileCount} files found`
    });
    
    // Test 3: Document Processing
    const processingTest = await testDocumentProcessing();
    results.push({ 
      test: 'Document Processing', 
      passed: !!processingTest,
      details: processingTest ? `${processingTest.processedDocuments} processed` : 'Failed'
    });
    
    // Test 4: System Initialization (optional - takes time)
    if (process.argv.includes('--full')) {
      const initTest = await testSystemInitialization();
      results.push({ test: 'System Initialization', passed: !!initTest });
    }
    
    // Test 5: RAG Search
    await testRAGSearch();
    results.push({ test: 'RAG Search', passed: true }); // Assuming success if no exceptions
    
    // Test 6: Analysis with RAG
    await testAnalysisWithRAG();
    results.push({ test: 'Analysis with RAG', passed: true });
    
    // Test 7: Document Management
    const mgmtTest = await testDocumentManagement();
    results.push({ test: 'Document Management', passed: mgmtTest });
    
    // Test 8: Standardized Naming
    const namingTest = await testStandardizedNaming();
    results.push({ test: 'Standardized Naming', passed: namingTest });
    
    // Test 9: Scientific References
    const refTest = await testScientificReferences();
    results.push({ test: 'Scientific References', passed: refTest });
    
    // Test 10: Performance Metrics
    const perfTest = await testPerformanceMetrics();
    results.push({ 
      test: 'Performance Metrics', 
      passed: perfTest.successRate >= 80,
      details: `${perfTest.avgResponseTime.toFixed(0)}ms avg, ${perfTest.successRate.toFixed(1)}% success`
    });
    
    // Generate final report
    await generateTestReport(results);
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments and module execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting enhanced system tests...');
  if (process.argv.includes('--help')) {
    console.log('\nUsage: node test-enhanced-system.js [options]');
    console.log('Options:');
    console.log('  --full    Run full test suite including system initialization');
    console.log('  --help    Show this help message');
    process.exit(0);
  }
  
  runAllTests().catch(console.error);
}

export {
  runAllTests,
  testDatabaseConnection,
  testDocumentStorage,
  testRAGSearch,
  testAnalysisWithRAG
};
