import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AdvancedAgronomistAnalyzer } from '@/lib/langchain-analyzer';
import { getReferenceData } from '@/lib/reference-data';
import { enhancedDocumentProcessor } from '@/lib/enhanced-document-processor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Check if system is properly configured
    const openAIConfigured = !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!openAIConfigured) {
      return NextResponse.json({ 
        error: 'AI analysis not configured. Please contact administrator to set up OpenAI API key.' 
      }, { status: 503 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ 
        error: 'Database not configured. Please contact administrator.' 
      }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sampleType = formData.get('sampleType') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine if user is anonymous
    const isAnonymous = !userId || userId === 'null' || userId === 'undefined' || userId === 'anonymous';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process the file using the enhanced analysis system
    const analysisResult = await processFile(file, sampleType, userId || 'anonymous');

    // Normalize the result for consistent API response
    const normalizedResult = normalizeAnalysisResult(analysisResult);

    // Save to database only if user is not anonymous
    let analysis = null;
    if (!isAnonymous) {
      try {
        const { data: dbAnalysis, error } = await supabase
          .from('analysis_reports')
          .insert({
            user_id: userId,
            sample_type: sampleType,
            file_names: [file.name],
            file_sizes: [file.size],
            input_data: {
              filename: file.name,
              fileSize: file.size,
              fileType: file.type,
              extractedValues: (analysisResult as any).extractedValues || {}
            },
            analysis_result: normalizedResult,
            confidence_score: normalizedResult.confidence,
            risk_level: normalizedResult.riskLevel,
            processing_time_ms: normalizedResult.processingTime,
            user_preferences: {
              language: 'en',
              units: 'metric',
              sampleType: sampleType
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          // Don't fail the request if database save fails, but log it
          console.warn('Failed to save analysis to database, continuing with analysis results');
        } else {
          analysis = dbAnalysis;
          console.log('Analysis saved to database with ID:', dbAnalysis.id);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Continue with analysis results even if database save fails
      }
    }

    return NextResponse.json({
      id: analysis?.id || `temp-${Date.now()}`,
      confidence: normalizedResult.confidence,
      issues: normalizedResult.issues,
      recommendations: normalizedResult.recommendations,
      summary: normalizedResult.summary,
      processingTime: normalizedResult.processingTime,
      extractedValues: (analysisResult as any).extractedValues,
      isAnonymous,
      storedInDatabase: !!analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file. Please try again.' },
      { status: 500 }
    );
  }
}

function normalizeAnalysisResult(result: any) {
  return {
    confidence: result.confidence || result.confidenceScore || 85,
    riskLevel: result.riskLevel || 'Medium',
    processingTime: result.processingTime || 2000,
    summary: result.summary || result.interpretation || 'Analysis completed successfully',
    issues: result.issues || [],
    recommendations: result.recommendations || result.improvementPlan || [],
    interpretation: result.interpretation || result.summary || 'Analysis completed',
    improvementPlan: result.improvementPlan || result.recommendations || [],
    metadata: result.metadata || {},
    ragContext: result.ragContext || [],
    scientificReferences: result.scientificReferences || []
  };
}

async function processFile(file: File, sampleType: string, userId: string) {
  const startTime = Date.now();
  
  try {
    console.log(`Starting enhanced analysis for ${file.name} (${sampleType} sample) for user: ${userId}`);
    
    // Check if OpenAI is configured - if not, return basic fallback analysis
    const openAIConfigured = !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    if (!openAIConfigured) {
      console.log('OpenAI not configured, using basic analysis');
      return generateFallbackAnalysis(file, sampleType, Date.now() - startTime);
    }
    
    // Initialize the analyzer
    const analyzer = new AdvancedAgronomistAnalyzer();
    const referenceData = getReferenceData(sampleType as 'soil' | 'leaf');
    
    let analysisResult;
    
    // Try enhanced document processing first
    try {
      console.log('Attempting enhanced document processing...');
      const extractedData = await enhancedDocumentProcessor.processFile(file);
      
      if (extractedData.structuredData && extractedData.structuredData.parameters) {
        // Convert structured data to format expected by analyzer
        const values: Record<string, string | number> = {};
        Object.entries(extractedData.structuredData.parameters).forEach(([key, param]) => {
          values[key] = param.value;
        });
        
        console.log('Structured data found, using advanced analysis...');
        analysisResult = await analyzer.analyzeDataAdvanced(
          sampleType as 'soil' | 'leaf',
          values,
          referenceData,
          {
            focus: 'yield',
            budget: 'medium',
            timeframe: 'short_term',
            language: 'en',
            plantationType: 'tenera',
            soilType: 'mineral'
          }
        );
        
        // Add metadata
        analysisResult.metadata = {
          ...analysisResult.metadata,
          enhancedProcessing: true,
          extractionMethod: extractedData.metadata.extractionMethod,
          structuredDataFound: true
        };
      } else {
        // Fallback to OCR analysis
        console.log('No structured data found, using OCR analysis...');
        const ocrResult = await analyzer.analyzeWithOCR(
          sampleType as 'soil' | 'leaf',
          extractedData.text,
          referenceData
        );
        analysisResult = ocrResult.analysis;
        (analysisResult as any).extractedValues = ocrResult.values;
      }
    } catch (enhancedError) {
      console.error('Enhanced processing failed, using fallback OCR:', enhancedError);
      
      // Fallback to basic OCR analysis
      let fileText = '';
      if (file.type.includes('text') || file.name.toLowerCase().endsWith('.txt')) {
        fileText = await file.text();
      } else {
        // For non-text files, create a basic analysis input
        fileText = `Analyzing ${file.name} (${file.type}, ${file.size} bytes)`;
      }
      
      const ocrResult = await analyzer.analyzeWithOCR(
        sampleType as 'soil' | 'leaf',
        fileText,
        referenceData
      );
      analysisResult = ocrResult.analysis;
      (analysisResult as any).extractedValues = ocrResult.values;
      (analysisResult as any).metadata = {
        enhancedProcessing: false,
        fallbackReason: enhancedError instanceof Error ? enhancedError.message : 'Unknown error'
      };
    }
    
    const processingTime = Date.now() - startTime;
    (analysisResult as any).processingTime = processingTime;
    
    console.log(`Analysis completed in ${processingTime}ms for user: ${userId}`);
    return analysisResult;
    
  } catch (error) {
    console.error('Analysis processing failed:', error);
    // Return fallback analysis as last resort
    return generateFallbackAnalysis(file, sampleType, Date.now() - startTime);
  }
}

function generateFallbackAnalysis(file: File, sampleType: string, processingTime: number) {
  console.log(`Generating fallback analysis for ${sampleType} sample`);
  
  const issues = [`Analysis of ${file.name} requires manual review`];
  const recommendations = [{
    category: 'File Processing',
    priority: 'Medium' as const,
    action: 'Please ensure file contains readable ${sampleType} analysis data',
    estimatedCost: 'No cost',
    timeframe: 'Immediate'
  }];
  
  return {
    confidence: 75,
    riskLevel: 'Medium',
    processingTime,
    summary: `Fallback analysis completed for ${file.name}. Manual review recommended.`,
    issues,
    recommendations,
    interpretation: `Unable to automatically process ${file.name}. The file may need manual analysis.`,
    improvementPlan: recommendations,
    metadata: {
      fallback: true,
      fileName: file.name,
      fileType: file.type
    }
  };
}