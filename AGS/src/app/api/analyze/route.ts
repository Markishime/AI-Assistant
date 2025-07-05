import { NextResponse } from 'next/server';
import { LangChainAnalyzer } from '@/lib/langchain-analyzer';
import { getReferenceDocumentManager } from '@/lib/reference-document-manager';
import referenceData from '@/public/reference_data.json';
import { AnalysisData, AnalysisReport } from '@/types';

const analyzer = new LangChainAnalyzer();

export async function POST(request: Request) {
  try {
    // Initialize reference document manager
    const documentManager = getReferenceDocumentManager();
    await documentManager.initializeVectorStore();

    const { sampleType, values }: AnalysisData = await request.json();

    // Use LangChain analyzer for analysis
    const analysis = await analyzer.analyzeData(
      sampleType,
      values,
      referenceData[sampleType as keyof typeof referenceData]
    );

    // Convert AnalysisResult to AnalysisReport format
    const report: AnalysisReport = {
      interpretation: analysis.interpretation,
      improvementPlan: analysis.improvementPlan,
      timestamp: new Date().toISOString(),
      issues: analysis.issues,
      riskLevel: analysis.riskLevel,
      confidenceScore: analysis.confidenceScore,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}