import { NextRequest, NextResponse } from 'next/server';
import { enhancedDocumentProcessor } from '@/lib/enhanced-document-processor';
import { AdvancedAgronomistAnalyzer } from '@/lib/langchain-analyzer';
import { getReferenceData } from '@/lib/reference-data';
import { SupabaseManager } from '@/lib/supabase-manager';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sampleType = formData.get('sampleType') as 'soil' | 'leaf';
    const useEnhancedProcessor = formData.get('useEnhanced') === 'true';
    const userId = formData.get('userId') as string; // For report storage

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes) - Enhanced: ${useEnhancedProcessor}`);

    // Initialize Supabase manager for database operations
    const supabaseManager = new SupabaseManager();

    let analysisResult;
    
    if (useEnhancedProcessor) {
      // Use the enhanced document processor with LangChain
      try {
        const extractedData = await enhancedDocumentProcessor.processFile(file);
        
        console.log('Enhanced processor extraction complete:', {
          textLength: extractedData.text.length,
          hasStructuredData: !!extractedData.structuredData,
          extractionMethod: extractedData.metadata.extractionMethod,
          processingTime: extractedData.metadata.processingTime
        });

        // If we have structured data, convert it to the format expected by LangChainAnalyzer
        if (extractedData.structuredData && extractedData.structuredData.parameters) {
          const values: Record<string, string | number> = {};
          
          // Convert the structured parameters to simple key-value pairs
          Object.entries(extractedData.structuredData.parameters).forEach(([key, param]) => {
            values[key] = param.value;
          });

          // Get reference data for the sample type
          const referenceData = getReferenceData(sampleType);
          
          // Get dynamic prompt from Supabase (analyzer will use it if available)
          const customPrompt = await supabaseManager.getActivePrompt(sampleType, 'en');
          
          // Analyze using LangChain advanced analysis with enhanced RAG and scientific references
          const analyzer = new AdvancedAgronomistAnalyzer();
          analysisResult = await analyzer.analyzeDataAdvanced(
            sampleType, 
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
          
          // Add metadata from enhanced processing
          analysisResult.metadata = {
            ...analysisResult.metadata,
            enhancedProcessing: true,
            extractionMethod: extractedData.metadata.extractionMethod,
            processingTime: extractedData.metadata.processingTime,
            structuredDataFound: true,
            promptVersion: customPrompt?.version || 'default'
          };
        } else {
          // Fallback to OCR analysis if no structured data found
          const analyzer = new AdvancedAgronomistAnalyzer();
          const ocrResult = await analyzer.analyzeWithOCR(sampleType, extractedData.text, getReferenceData(sampleType));
          
          analysisResult = ocrResult.analysis;
          analysisResult.metadata = {
            ...analysisResult.metadata,
            enhancedProcessing: true,
            extractionMethod: extractedData.metadata.extractionMethod,
            processingTime: extractedData.metadata.processingTime,
            structuredDataFound: false,
            extractedValues: ocrResult.values
          };
        }
      } catch (enhancedError) {
        console.error('Enhanced processing failed, falling back to standard analysis:', enhancedError);
        
        // Fallback to standard processing
        const analyzer = new AdvancedAgronomistAnalyzer();
        const ocrResult = await analyzer.analyzeWithOCR(sampleType, await file.text(), getReferenceData(sampleType));
        analysisResult = ocrResult.analysis;
        analysisResult.metadata = {
          ...analysisResult.metadata,
          enhancedProcessing: false,
          fallbackReason: enhancedError instanceof Error ? enhancedError.message : 'Unknown error'
        };
      }
    } else {
      // Use standard processing (existing logic)
      const analyzer = new AdvancedAgronomistAnalyzer();
      
      if (file.type.includes('image') || file.name.toLowerCase().endsWith('.pdf')) {
        const ocrResult = await analyzer.analyzeWithOCR(sampleType, await file.text(), getReferenceData(sampleType));
        analysisResult = ocrResult.analysis;
      } else {
        // For Excel files, extract text first then analyze
        const fileContent = await file.text();
        const ocrResult = await analyzer.analyzeWithOCR(sampleType, fileContent, getReferenceData(sampleType));
        analysisResult = ocrResult.analysis;
      }
    }

    // Store the analysis report in Supabase (if userId is provided)
    if (userId && analysisResult) {
      try {
        await supabaseManager.storeAnalysisReport(
          userId,
          sampleType,
          [file.name],
          [file.size],
          {},
          analysisResult,
          undefined, // userPriorities
          analysisResult.metadata?.processingTime || 0
        );
        
        console.log('Analysis report saved to Supabase');
      } catch (error) {
        console.error('Failed to save analysis report:', error);
        // Don't fail the request if report storage fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sampleType,
        fileName: file.name,
        fileSize: file.size,
        processingMethod: useEnhancedProcessor ? 'enhanced' : 'standard'
      },
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Enhanced upload processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
}
