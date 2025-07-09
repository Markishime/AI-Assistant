import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAgronomistAnalyzer } from '@/lib/langchain-analyzer';
import { getReferenceData } from '@/lib/reference-data';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sampleType = formData.get('sampleType') as 'soil' | 'leaf';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes) - Standard processing`);

    const analyzer = new AdvancedAgronomistAnalyzer();
    const referenceData = getReferenceData(sampleType);
    
    let analysisResult;
    
    if (file.type.includes('image') || file.name.toLowerCase().endsWith('.pdf')) {
      // For images and PDFs, use OCR analysis
      const ocrResult = await analyzer.analyzeWithOCR(sampleType, await file.text(), referenceData);
      analysisResult = ocrResult.analysis;
    } else {
      // For other files (Excel, CSV), extract text and use advanced analysis
      const fileContent = await file.text();
      
      // Try to extract values from the content
      const values: Record<string, string | number> = {};
      // Simple extraction for demo - in production, you'd parse Excel/CSV properly
      const lines = fileContent.split('\n');
      lines.forEach(line => {
        const parts = line.split(/[,\t]/);
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parseFloat(parts[1]) || parts[1].trim();
          if (key && value !== '') {
            values[key] = value;
          }
        }
      });

      // Use advanced analysis if we have structured data
      if (Object.keys(values).length > 0) {
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
      } else {
        // Fallback to OCR if no structured data found
        const ocrResult = await analyzer.analyzeWithOCR(sampleType, fileContent, referenceData);
        analysisResult = ocrResult.analysis;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sampleType,
        fileName: file.name,
        fileSize: file.size,
        processingMethod: 'standard'
      },
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
}
