export interface AnalysisData {
  sampleType: 'soil' | 'leaf';
  values: Record<string, number | string>;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface RagContext {
  content: string;
  metadata: Record<string, string | number | boolean>;
  similarity: number;
  document_title?: string;
  document_source?: string;
  chunk_index: number;
}

export interface ScientificReference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  relevanceScore: number;
  summary: string;
  keyFindings: string[];
  applicationToAnalysis: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface AnalysisReport {
  interpretation: string;
  improvementPlan: Array<{
    recommendation: string;
    reasoning: string;
    estimatedImpact: string;
    priority?: 'High' | 'Medium' | 'Low';
    investmentLevel?: 'High' | 'Medium' | 'Low';
    implementationSteps?: string;
    sustainabilityBenefits?: string;
    costBenefit?: string;
    timeframe?: string;
  }>;
  timestamp: string;
  issues?: string[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore?: number;
  ragContext?: RagContext[];
  scientificReferences?: ScientificReference[];
  analysisType?: 'soil' | 'leaf';
  nutrientLevels?: Record<string, number>;
}