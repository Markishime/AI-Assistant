import { NextResponse } from 'next/server';
import { AdvancedAgronomistAnalyzer } from '@/lib/langchain-analyzer';
import { AnalysisData } from '@/types';
import referenceData from '@/public/reference_data.json';

export async function POST(request: Request) {
  try {
    // Create analyzer instance
    const analyzer = new AdvancedAgronomistAnalyzer();

    const { sampleType, values }: AnalysisData = await request.json();

    // Use advanced analysis with enhanced RAG and scientific references
    const analysis = await analyzer.analyzeDataAdvanced(
      sampleType,
      values,
      referenceData[sampleType as keyof typeof referenceData],
      {
        focus: 'yield',
        budget: 'medium',
        timeframe: 'short_term',
        language: 'en',
        plantationType: 'tenera',
        soilType: 'mineral'
      },
      undefined, // landSize
      undefined  // historicalYield
    );

    // Return the complete analysis including scientific references and RAG context
    return NextResponse.json({ 
      report: analysis,
      ragContext: analysis.ragContext || [],
      scientificReferences: analysis.scientificReferences || []
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}