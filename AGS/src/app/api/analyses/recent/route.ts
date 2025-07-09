import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Mock recent analyses data
    const mockAnalyses = Array.from({ length: Math.min(limit, 10) }, (_, index) => {
      const timestamp = new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString();
      const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
      const sampleTypes = ['soil', 'leaf'];
      
      return {
        id: `analysis_${index + 1}`,
        interpretation: `Analysis ${index + 1}: Comprehensive evaluation of ${sampleTypes[index % 2]} sample revealing key nutritional insights for optimization.`,
        improvementPlan: [
          {
            recommendation: `Optimize ${sampleTypes[index % 2] === 'soil' ? 'soil fertility' : 'foliar nutrition'}`,
            reasoning: "Based on detected nutrient imbalances and Malaysian best practices",
            estimatedImpact: "15-25% yield improvement expected",
            priority: index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low'
          }
        ],
        timestamp,
        issues: [
          `${sampleTypes[index % 2] === 'soil' ? 'Potassium deficiency' : 'Nitrogen imbalance'}`,
          `pH ${sampleTypes[index % 2] === 'soil' ? 'optimization needed' : 'related stress indicators'}`
        ],
        riskLevel: riskLevels[index % 4],
        confidenceScore: Math.floor(Math.random() * 20) + 75, // 75-95%
        analysisType: sampleTypes[index % 2],
        nutrientLevels: sampleTypes[index % 2] === 'soil' 
          ? { pH: 5.2, K: 0.15, Mg: 0.8, Ca: 2.1 }
          : { N: 2.8, P: 0.18, K: 1.2, Mg: 0.25 },
        ragContext: [
          {
            content: `Relevant research findings for ${sampleTypes[index % 2]} analysis in Malaysian oil palm plantations...`,
            metadata: { title: `Research Document ${index + 1}`, document_type: 'research_paper' },
            similarity: 0.85 + (Math.random() * 0.1),
            document_title: `Malaysian Oil Palm ${sampleTypes[index % 2]} Management Guide`,
            document_source: 'MPOB Research',
            chunk_index: index
          }
        ],
        scientificReferences: [
          {
            id: `ref_${index + 1}`,
            title: `${sampleTypes[index % 2] === 'soil' ? 'Soil' : 'Foliar'} Nutrient Management in Oil Palm`,
            authors: ['Dr. Ahmad Rahman', 'Prof. Siti Aishah'],
            journal: 'Journal of Oil Palm Research',
            year: 2023,
            relevanceScore: Math.floor(Math.random() * 10) + 85,
            summary: `Research on optimizing ${sampleTypes[index % 2]} nutrient management...`,
            keyFindings: [`Key finding 1 for ${sampleTypes[index % 2]}`, `Key finding 2 for ${sampleTypes[index % 2]}`],
            applicationToAnalysis: 'Directly applicable to current analysis',
            confidenceLevel: 'High' as const
          }
        ]
      };
    });

    return NextResponse.json(mockAnalyses);

  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent analyses' },
      { status: 500 }
    );
  }
}
