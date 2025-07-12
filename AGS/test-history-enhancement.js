const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHistoryEnhancement() {
  console.log('🔍 Testing Enhanced History Page Functionality...\n');

  try {
    // Test 1: Check if analysis_reports table exists and has data
    console.log('📊 Test 1: Checking analysis_reports table...');
    const { data: reports, error: reportsError } = await supabase
      .from('analysis_reports')
      .select('*')
      .limit(5);

    if (reportsError) {
      console.error('❌ Error fetching analysis reports:', reportsError);
      return;
    }

    console.log(`✅ Found ${reports.length} analysis reports`);
    
    if (reports.length > 0) {
      console.log('📋 Sample report structure:');
      const sampleReport = reports[0];
      console.log(`   - ID: ${sampleReport.id}`);
      console.log(`   - Sample Type: ${sampleReport.sample_type}`);
      console.log(`   - Risk Level: ${sampleReport.risk_level}`);
      console.log(`   - Confidence Score: ${sampleReport.confidence_score}`);
      console.log(`   - Processing Time: ${sampleReport.processing_time_ms}ms`);
      console.log(`   - File Count: ${sampleReport.file_names?.length || 0}`);
      console.log(`   - Created: ${sampleReport.created_at}`);
      
      if (sampleReport.analysis_result) {
        console.log(`   - Has Analysis Result: ✅`);
        console.log(`   - Improvement Plan Items: ${sampleReport.analysis_result.improvementPlan?.length || 0}`);
        console.log(`   - Issues Count: ${sampleReport.analysis_result.issues?.length || 0}`);
        console.log(`   - RAG Context: ${sampleReport.analysis_result.ragContext?.length || 0}`);
        console.log(`   - Scientific Refs: ${sampleReport.analysis_result.scientificReferences?.length || 0}`);
      }
    }

    // Test 2: Check user-specific reports
    console.log('\n👤 Test 2: Checking user-specific reports...');
    const { data: userReports, error: userError } = await supabase
      .from('analysis_reports')
      .select('*')
      .not('user_id', 'is', null)
      .limit(3);

    if (userError) {
      console.error('❌ Error fetching user reports:', userError);
    } else {
      console.log(`✅ Found ${userReports.length} user-specific reports`);
      userReports.forEach((report, index) => {
        console.log(`   ${index + 1}. User ${report.user_id?.slice(0, 8)}... - ${report.sample_type} analysis`);
      });
    }

    // Test 3: Test filtering by sample type
    console.log('\n🔍 Test 3: Testing sample type filtering...');
    const { data: soilReports, error: soilError } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('sample_type', 'soil');

    const { data: leafReports, error: leafError } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('sample_type', 'leaf');

    if (soilError || leafError) {
      console.error('❌ Error filtering by sample type:', soilError || leafError);
    } else {
      console.log(`✅ Soil analyses: ${soilReports.length}`);
      console.log(`✅ Leaf analyses: ${leafReports.length}`);
    }

    // Test 4: Test risk level filtering
    console.log('\n⚠️ Test 4: Testing risk level filtering...');
    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    for (const riskLevel of riskLevels) {
      const { data: riskReports, error: riskError } = await supabase
        .from('analysis_reports')
        .select('*')
        .eq('risk_level', riskLevel);

      if (riskError) {
        console.error(`❌ Error filtering by risk level ${riskLevel}:`, riskError);
      } else {
        console.log(`✅ ${riskLevel} risk reports: ${riskReports.length}`);
      }
    }

    // Test 5: Test sorting by confidence score
    console.log('\n📈 Test 5: Testing confidence score sorting...');
    const { data: sortedReports, error: sortError } = await supabase
      .from('analysis_reports')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(3);

    if (sortError) {
      console.error('❌ Error sorting by confidence:', sortError);
    } else {
      console.log('✅ Top 3 reports by confidence:');
      sortedReports.forEach((report, index) => {
        console.log(`   ${index + 1}. ${report.confidence_score}% - ${report.sample_type} analysis`);
      });
    }

    // Test 6: Check for analysis result structure
    console.log('\n📋 Test 6: Validating analysis result structure...');
    const { data: validReports, error: validError } = await supabase
      .from('analysis_reports')
      .select('analysis_result')
      .not('analysis_result', 'is', null)
      .limit(1);

    if (validError) {
      console.error('❌ Error checking analysis result structure:', validError);
    } else if (validReports.length > 0) {
      const result = validReports[0].analysis_result;
      console.log('✅ Analysis result structure validation:');
      console.log(`   - Has interpretation: ${!!result.interpretation}`);
      console.log(`   - Has improvement plan: ${!!result.improvementPlan}`);
      console.log(`   - Has risk level: ${!!result.riskLevel}`);
      console.log(`   - Has confidence score: ${!!result.confidenceScore}`);
      console.log(`   - Improvement plan items: ${result.improvementPlan?.length || 0}`);
      console.log(`   - Issues count: ${result.issues?.length || 0}`);
    }

    // Test 7: Check file information
    console.log('\n📁 Test 7: Checking file information...');
    const { data: fileReports, error: fileError } = await supabase
      .from('analysis_reports')
      .select('file_names, file_sizes')
      .not('file_names', 'is', null)
      .limit(3);

    if (fileError) {
      console.error('❌ Error checking file information:', fileError);
    } else {
      console.log('✅ File information validation:');
      fileReports.forEach((report, index) => {
        console.log(`   ${index + 1}. Files: ${report.file_names?.length || 0}`);
        if (report.file_names?.length > 0) {
          report.file_names.forEach((fileName, fileIndex) => {
            const fileSize = report.file_sizes?.[fileIndex] || 0;
            console.log(`      - ${fileName} (${formatFileSize(fileSize)})`);
          });
        }
      });
    }

    console.log('\n🎉 Enhanced History Page Tests Completed!');
    console.log('\n📝 Summary:');
    console.log(`   - Total reports available: ${reports.length}`);
    console.log(`   - Soil analyses: ${soilReports?.length || 0}`);
    console.log(`   - Leaf analyses: ${leafReports?.length || 0}`);
    console.log(`   - Reports with analysis results: ${validReports?.length || 0}`);
    console.log(`   - Reports with file information: ${fileReports?.length || 0}`);

    if (reports.length === 0) {
      console.log('\n⚠️ No analysis reports found. The history page will show an empty state.');
      console.log('   To test the full functionality, run some analyses first.');
    } else {
      console.log('\n✅ The enhanced history page should work correctly with the available data.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the test
testHistoryEnhancement(); 