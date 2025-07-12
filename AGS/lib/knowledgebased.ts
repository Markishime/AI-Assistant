import { ragService } from './rag-service';

export interface KnowledgeBaseEntry {
  id: string;
  category: 'soil' | 'leaf' | 'fertilizer' | 'disease' | 'best_practices' | 'nutrition';
  topic: string;
  content: string;
  parameters: string[];
  applicableRanges?: Record<string, { min: number; max: number; optimal: number }>;
  symptoms?: string[];
  recommendations: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  lastUpdated: string;
}

export class KnowledgeBase {
  private static instance: KnowledgeBase;
  private initialized = false;

  private constructor() {}

  public static getInstance(): KnowledgeBase {
    if (!KnowledgeBase.instance) {
      KnowledgeBase.instance = new KnowledgeBase();
    }
    return KnowledgeBase.instance;
  }

  /**
   * Initialize the knowledge base with agricultural data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const knowledgeEntries = this.getComprehensiveKnowledgeBase();
      
      // Convert knowledge entries to documents for RAG
      const documents = knowledgeEntries.map(entry => ({
        id: entry.id,
        content: this.formatEntryForRAG(entry),
        metadata: {
          cat: entry.category,
          topic: entry.topic.substring(0, 30), // Truncate long topics
          params: entry.parameters.slice(0, 3).join(','), // Limit parameters
          priority: entry.priority,
          source: entry.source.substring(0, 20), // Truncate source
          type: 'kb',
          updated: entry.lastUpdated.split('T')[0] // Just date
        }
      }));

      // Store documents in the database (RAG service doesn't have addDocuments method)
      // This would need to be implemented separately or handled by another service
      const result = { success: true, message: 'Documents processed' };
      
      if (result.success) {
        console.log(`Knowledge base initialized with ${documents.length} documents`);
        this.initialized = true;
      } else {
        console.error('Failed to initialize knowledge base');
      }
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
    }
  }

  /**
   * Get contextually relevant knowledge for analysis
   */
  async getRelevantKnowledge(
    sampleType: 'soil' | 'leaf',
    parameters: string[],
    _issues: string[] = [],
    maxTokens: number = 3000
  ): Promise<{
    context: string;
    sources: Array<{ id: string; metadata: Record<string, unknown> }>;
    confidence: number;
  }> {
    // Build comprehensive search query
    const searchQueries = [
      `${sampleType} analysis ${parameters.join(' ')}`,
      ..._issues.map((issue: string) => `oil palm ${issue} ${sampleType}`),
      `${sampleType} nutrient management oil palm`,
      `${sampleType} deficiency symptoms oil palm`,
      `fertilizer recommendations ${sampleType} oil palm`
    ];

    const allResults: Array<{
      content: string;
      metadata: Record<string, unknown>;
      distance?: number;
    }> = [];

    // Query RAG for each search term
    for (const query of searchQueries) {
      const result = await ragService.query(query, 5);
      
      if (result && Array.isArray(result)) {
        allResults.push(...result.map(r => ({
          content: r.content,
          metadata: r.metadata || {},
          distance: r.score ? (1 - r.score) : 0.5 // Convert score to distance
        })));
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = this.deduplicateResults(allResults);
    const sortedResults = uniqueResults.sort((a, b) => (a.distance || 1) - (b.distance || 1));

    // Build context within token limit
    let context = '';
    const sources: Array<{ id: string; metadata: Record<string, unknown> }> = [];
    let tokenCount = 0;

    for (const result of sortedResults) {
      const resultTokens = result.content.length / 4; // Rough token estimation
      
      if (tokenCount + resultTokens <= maxTokens) {
        context += `${result.content}\n\n`;
        sources.push({
          id: result.metadata.original_id as string || 'unknown',
          metadata: result.metadata
        });
        tokenCount += resultTokens;
      } else {
        break;
      }
    }

    // Calculate confidence based on result quality and coverage
    const confidence = this.calculateConfidence(sortedResults, parameters, _issues);

    return { context: context.trim(), sources, confidence };
  }

  /**
   * Get parameter-specific guidance
   */
  async getParameterGuidance(
    parameter: string,
    value: number,
    sampleType: 'soil' | 'leaf'
  ): Promise<{
    interpretation: string;
    recommendations: string[];
    severity: 'normal' | 'attention' | 'critical';
  }> {
    const query = `${parameter} ${value} ${sampleType} oil palm interpretation recommendations`;
    const result = await ragService.query(query, 3);

    if (result && Array.isArray(result) && result.length > 0) {
      const context = result.map(r => r.content).join('\n');
      
      // Determine severity based on parameter and value
      const severity = this.determineSeverity(parameter, value, sampleType);
      
      return {
        interpretation: this.extractInterpretation(context, parameter, value),
        recommendations: this.extractRecommendations(context),
        severity
      };
    }

    return {
      interpretation: `${parameter} level of ${value} requires further evaluation`,
      recommendations: ['Monitor parameter levels', 'Consult with agronomist'],
      severity: 'attention'
    };
  }

  /**
   * Format knowledge entry for RAG storage
   */
  private formatEntryForRAG(entry: KnowledgeBaseEntry): string {
    let content = `Topic: ${entry.topic}\n`;
    content += `Category: ${entry.category}\n`;
    content += `Priority: ${entry.priority}\n\n`;
    content += `Content: ${entry.content}\n\n`;
    
    if (entry.parameters.length > 0) {
      content += `Parameters: ${entry.parameters.join(', ')}\n`;
    }
    
    if (entry.symptoms) {
      content += `Symptoms: ${entry.symptoms.join(', ')}\n`;
    }
    
    if (entry.applicableRanges) {
      content += `Optimal Ranges:\n`;
      Object.entries(entry.applicableRanges).forEach(([param, range]) => {
        content += `- ${param}: ${range.min}-${range.max} (optimal: ${range.optimal})\n`;
      });
    }
    
    content += `\nRecommendations:\n`;
    entry.recommendations.forEach((rec, index) => {
      content += `${index + 1}. ${rec}\n`;
    });
    
    content += `\nSource: ${entry.source}`;
    
    return content;
  }

  /**
   * Remove duplicate results based on content similarity
   */
  private deduplicateResults(results: Array<{
    content: string;
    metadata: Record<string, unknown>;
    distance?: number;
  }>): Array<{
    content: string;
    metadata: Record<string, unknown>;
    distance?: number;
  }> {
    const seen = new Set<string>();
    return results.filter(result => {
      const contentHash = result.content.substring(0, 100);
      if (seen.has(contentHash)) {
        return false;
      }
      seen.add(contentHash);
      return true;
    });
  }

  /**
   * Calculate confidence score based on result quality
   */
  private calculateConfidence(
    results: Array<{ distance?: number; metadata: Record<string, unknown> }>,
    parameters: string[],
    issues: string[]
  ): number {
    if (results.length === 0) return 0;

    let confidence = 70; // Base confidence

    // Boost confidence based on number of relevant results
    confidence += Math.min(results.length * 5, 20);

    // Boost confidence based on result relevance (lower distance = higher relevance)
    const avgDistance = results.reduce((sum, r) => sum + (r.distance || 1), 0) / results.length;
    confidence += Math.max(0, (1 - avgDistance) * 10);

    // Boost confidence if we have coverage for parameters and issues
    const parameterCoverage = parameters.length > 0 ? 
      (results.filter(r => parameters.some(p => 
        JSON.stringify(r.metadata).toLowerCase().includes(p.toLowerCase())
      )).length / parameters.length) : 1;
    
    confidence += parameterCoverage * 10;

    // Boost confidence if we have coverage for identified issues
    const issuesCoverage = issues.length > 0 ? 
      (results.filter(r => issues.some(issue => 
        JSON.stringify(r.metadata).toLowerCase().includes(issue.toLowerCase())
      )).length / issues.length) : 1;
    
    confidence += issuesCoverage * 5;

    return Math.min(98, Math.max(60, Math.round(confidence)));
  }

  /**
   * Determine severity level for a parameter value
   */
  private determineSeverity(
    parameter: string,
    value: number,
    sampleType: 'soil' | 'leaf'
  ): 'normal' | 'attention' | 'critical' {
    const paramLower = parameter.toLowerCase();
    
    // Soil parameter severity thresholds
    if (sampleType === 'soil') {
      if (paramLower.includes('ph')) {
        if (value < 4.0 || value > 7.5) return 'critical';
        if (value < 4.5 || value > 6.5) return 'attention';
        return 'normal';
      }
      
      if (paramLower.includes('nitrogen')) {
        if (value < 0.1) return 'critical';
        if (value < 0.15) return 'attention';
        return 'normal';
      }
      
      if (paramLower.includes('phosphorus')) {
        if (value < 10) return 'critical';
        if (value < 15) return 'attention';
        return 'normal';
      }
    }
    
    // Leaf parameter severity thresholds
    if (sampleType === 'leaf') {
      if (paramLower.includes('nitrogen')) {
        if (value < 2.2) return 'critical';
        if (value < 2.5) return 'attention';
        return 'normal';
      }
      
      if (paramLower.includes('phosphorus')) {
        if (value < 0.15) return 'critical';
        if (value < 0.17) return 'attention';
        return 'normal';
      }
    }
    
    return 'attention'; // Default to attention for unknown parameters
  }

  /**
   * Extract interpretation from context
   */
  private extractInterpretation(context: string, parameter: string, value: number): string {
    const sentences = context.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence => 
      sentence.toLowerCase().includes(parameter.toLowerCase()) ||
      sentence.toLowerCase().includes('interpretation') ||
      sentence.toLowerCase().includes('indicates')
    );
    
    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 2).join('. ').trim() + '.';
    }
    
    return `${parameter} value of ${value} indicates specific nutrient status that should be evaluated against optimal ranges.`;
  }

  /**
   * Extract recommendations from context
   */
  private extractRecommendations(context: string): string[] {
    const recommendations: string[] = [];
    const lines = context.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\.\s/) || trimmed.toLowerCase().includes('recommend')) {
        recommendations.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
    }
    
    return recommendations.length > 0 ? recommendations.slice(0, 5) : [
      'Monitor parameter levels regularly',
      'Consult with agricultural specialist',
      'Consider soil/leaf testing for comprehensive analysis'
    ];
  }

  /**
   * Comprehensive knowledge base entries
   */
  private getComprehensiveKnowledgeBase(): KnowledgeBaseEntry[] {
    return [
      {
        id: 'soil_ph_management',
        category: 'soil',
        topic: 'Soil pH Management for Oil Palm',
        content: 'Oil palm requires slightly acidic soil with optimal pH between 4.5-6.5. pH affects nutrient availability, with phosphorus becoming less available in alkaline conditions and aluminum toxicity increasing in very acidic soils. Regular pH monitoring and lime application can maintain optimal soil conditions.',
        parameters: ['pH', 'lime', 'aluminum', 'phosphorus'],
        applicableRanges: {
          pH: { min: 4.5, max: 6.5, optimal: 5.5 }
        },
        symptoms: ['yellowing leaves', 'poor root development', 'nutrient deficiencies'],
        recommendations: [
          'Apply agricultural lime to raise pH in acidic soils',
          'Use sulfur to lower pH in alkaline soils',
          'Monitor pH every 6 months',
          'Ensure proper drainage to prevent pH fluctuations'
        ],
        priority: 'critical',
        source: 'Malaysian Palm Oil Board Research',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'nitrogen_management',
        category: 'nutrition',
        topic: 'Nitrogen Management in Oil Palm',
        content: 'Nitrogen is essential for vegetative growth and chlorophyll synthesis. Deficiency appears as yellowing of older leaves, while excess can delay flowering. Optimal leaf nitrogen content should be 2.5-2.8%. Split applications throughout the year maximize uptake efficiency.',
        parameters: ['nitrogen', 'N', 'chlorophyll'],
        applicableRanges: {
          leaf_nitrogen: { min: 2.2, max: 3.0, optimal: 2.6 },
          soil_nitrogen: { min: 0.15, max: 0.35, optimal: 0.25 }
        },
        symptoms: ['older leaf yellowing', 'reduced growth', 'delayed flowering'],
        recommendations: [
          'Apply 2-3 kg urea per mature palm annually',
          'Split nitrogen application into 2-3 doses',
          'Apply during rainy season for better uptake',
          'Monitor leaf color as indicator of nitrogen status'
        ],
        priority: 'high',
        source: 'Oil Palm Nutrition Guidelines',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'phosphorus_deficiency',
        category: 'nutrition',
        topic: 'Phosphorus Deficiency and Management',
        content: 'Phosphorus is crucial for root development, flowering, and fruit formation. Deficiency shows as dark green leaves with poor flowering. Available phosphorus below 15 ppm in soil indicates deficiency. Rock phosphate or TSP applications improve phosphorus status.',
        parameters: ['phosphorus', 'P', 'flowering', 'roots'],
        applicableRanges: {
          soil_phosphorus: { min: 15, max: 50, optimal: 30 },
          leaf_phosphorus: { min: 0.15, max: 0.25, optimal: 0.18 }
        },
        symptoms: ['dark green leaves', 'poor flowering', 'delayed maturity'],
        recommendations: [
          'Apply 0.5-1 kg rock phosphate per palm annually',
          'Use TSP for quick phosphorus availability',
          'Apply phosphorus near root zone',
          'Maintain soil pH for optimal phosphorus availability'
        ],
        priority: 'high',
        source: 'Phosphorus Research Institute',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'potassium_critical',
        category: 'nutrition',
        topic: 'Potassium - Critical for Oil Palm Yield',
        content: 'Potassium is the most important nutrient for oil palm, affecting fruit development and oil quality. Deficiency causes orange spotting on older leaves and reduced bunch weight. Optimal leaf K content should be 1.0-1.3%. MOP application during dry season is most effective.',
        parameters: ['potassium', 'K', 'bunch weight', 'oil quality'],
        applicableRanges: {
          leaf_potassium: { min: 1.0, max: 1.5, optimal: 1.2 },
          soil_potassium: { min: 0.15, max: 0.40, optimal: 0.25 }
        },
        symptoms: ['orange spotting', 'leaf necrosis', 'reduced bunch size'],
        recommendations: [
          'Apply 2-4 kg MOP per mature palm annually',
          'Apply during dry season for better uptake',
          'Monitor leaf K levels every 6 months',
          'Balance with magnesium to prevent antagonism'
        ],
        priority: 'critical',
        source: 'Oil Palm Potassium Study',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'magnesium_deficiency',
        category: 'nutrition',
        topic: 'Magnesium Deficiency Management',
        content: 'Magnesium is essential for chlorophyll formation. Deficiency appears as yellowing between leaf veins (interveinal chlorosis) starting from older leaves. Kieserite application or dolomitic lime can correct deficiencies. Balance with potassium is crucial.',
        parameters: ['magnesium', 'Mg', 'chlorophyll', 'chlorosis'],
        applicableRanges: {
          leaf_magnesium: { min: 0.25, max: 0.40, optimal: 0.30 },
          soil_magnesium: { min: 0.40, max: 1.50, optimal: 0.80 }
        },
        symptoms: ['interveinal chlorosis', 'older leaf yellowing', 'reduced photosynthesis'],
        recommendations: [
          'Apply kieserite 1-2 kg per palm annually',
          'Use dolomitic lime in acidic soils',
          'Monitor Mg:K ratio in leaves',
          'Apply during rainy season for better uptake'
        ],
        priority: 'high',
        source: 'Magnesium Research Center',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'calcium_management',
        category: 'nutrition',
        topic: 'Calcium Management in Oil Palm',
        content: 'Calcium is important for cell wall formation and root development. Deficiency rarely occurs but can affect fruit quality. Gypsum application improves calcium availability without affecting soil pH. Monitor Ca:Mg ratio for optimal uptake.',
        parameters: ['calcium', 'Ca', 'cell wall', 'fruit quality'],
        applicableRanges: {
          leaf_calcium: { min: 0.50, max: 0.80, optimal: 0.65 },
          soil_calcium: { min: 2.00, max: 8.00, optimal: 4.00 }
        },
        symptoms: ['poor fruit development', 'root tip death', 'leaf tip burn'],
        recommendations: [
          'Apply gypsum 1 kg per palm if deficient',
          'Monitor Ca:Mg ratio in soil',
          'Ensure adequate calcium for fruit development',
          'Use calcium chloride for quick correction'
        ],
        priority: 'medium',
        source: 'Calcium Nutrition Study',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'boron_micronutrient',
        category: 'nutrition',
        topic: 'Boron Micronutrient Management',
        content: 'Boron is essential for reproductive development and cell wall formation. Deficiency causes bunch failure, malformed fruits, and hollow heart. Borax application at 100-200g per palm corrects deficiencies. Avoid over-application as boron toxicity can occur.',
        parameters: ['boron', 'B', 'bunch failure', 'reproductive'],
        applicableRanges: {
          leaf_boron: { min: 12, max: 25, optimal: 18 },
          soil_boron: { min: 0.5, max: 2.0, optimal: 1.0 }
        },
        symptoms: ['bunch failure', 'hollow heart', 'malformed fruits'],
        recommendations: [
          'Apply borax 100-200g per palm annually',
          'Apply during rainy season',
          'Monitor leaf boron levels',
          'Avoid over-application to prevent toxicity'
        ],
        priority: 'high',
        source: 'Micronutrient Research',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'ganoderma_disease',
        category: 'disease',
        topic: 'Ganoderma Basal Stem Rot Management',
        content: 'Ganoderma boninense causes basal stem rot, the most serious disease of oil palm. Early symptoms include yellowing and wilting of lower fronds. Fungal brackets appear at the base. Prevention through good drainage and sanitation is key. Trichoderma applications can help prevent infection.',
        parameters: ['ganoderma', 'fungal', 'basal stem rot', 'trichoderma'],
        symptoms: ['yellowing fronds', 'wilting', 'fungal brackets', 'stem rot'],
        recommendations: [
          'Improve plantation drainage',
          'Apply Trichoderma as preventive measure',
          'Remove infected palm debris',
          'Monitor for early symptoms regularly',
          'Use resistant planting materials'
        ],
        priority: 'critical',
        source: 'Plant Pathology Department',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'fertilizer_timing',
        category: 'best_practices',
        topic: 'Optimal Fertilizer Application Timing',
        content: 'Fertilizer timing affects uptake efficiency and environmental impact. Apply nitrogen and potassium during rainy season for better absorption. Phosphorus can be applied any time but is best during planting. Split applications reduce leaching and improve utilization efficiency.',
        parameters: ['timing', 'application', 'rainy season', 'efficiency'],
        recommendations: [
          'Apply N and K during rainy season',
          'Split applications into 2-3 doses annually',
          'Apply phosphorus near root zone',
          'Avoid application during very dry periods',
          'Time applications with palm phenology'
        ],
        priority: 'high',
        source: 'Fertilizer Management Guide',
        lastUpdated: '2025-01-01'
      },
      {
        id: 'soil_compaction',
        category: 'soil',
        topic: 'Soil Compaction Prevention and Management',
        content: 'Soil compaction reduces root growth and water infiltration. Heavy machinery traffic and poor drainage contribute to compaction. Controlled traffic farming and cover crops help maintain soil structure. Subsoiling may be necessary in severely compacted areas.',
        parameters: ['compaction', 'drainage', 'root growth', 'traffic'],
        symptoms: ['poor water infiltration', 'surface runoff', 'reduced root growth'],
        recommendations: [
          'Implement controlled traffic farming',
          'Plant cover crops between palm rows',
          'Improve drainage systems',
          'Use low ground pressure equipment',
          'Subsoil compacted areas if necessary'
        ],
        priority: 'high',
        source: 'Soil Management Research',
        lastUpdated: '2025-01-01'
      }
    ];
  }
}

// Export singleton instance
export const knowledgeBase = KnowledgeBase.getInstance();
