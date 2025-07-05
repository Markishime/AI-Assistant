export interface AnalysisData {
  sampleType: 'soil' | 'leaf';
  values: Record<string, number | string>;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface AnalysisReport {
  interpretation: string;
  improvementPlan: Array<{
    recommendation: string;
    reasoning: string;
    estimatedImpact: string;
    priority?: 'High' | 'Medium' | 'Low';
  }>;
  timestamp: string;
  issues?: string[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore?: number;
}