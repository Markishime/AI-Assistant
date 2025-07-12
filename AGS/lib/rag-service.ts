import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Malaysian Context Constants
export const MALAYSIAN_REGIONS = [
  'Peninsular Malaysia', 'Sabah', 'Sarawak', 'Johor', 'Pahang', 'Perak',
  'Selangor', 'Kedah', 'Kelantan', 'Terengganu', 'Perlis', 'Penang',
  'Melaka', 'Negeri Sembilan'
];

export const MALAYSIAN_INSTITUTIONS = [
  'MPOB', 'Malaysian Palm Oil Board', 'UPM', 'Universiti Putra Malaysia',
  'FELDA', 'FELCRA', 'Sime Darby', 'IOI Corporation', 'Kuala Lumpur Kepong'
];

export const CERTIFICATION_STANDARDS = [
  'RSPO', 'MSPO', 'ISPO', 'RTRS', 'Round Table on Sustainable Palm Oil',
  'Malaysian Sustainable Palm Oil', 'Indonesian Sustainable Palm Oil'
];

export const MALAYSIAN_SOIL_TYPES = [
  'Ultisols', 'Oxisols', 'Inceptisols', 'Entisols', 'Histosols',
  'mineral soils', 'peat soils', 'coastal soils'
];

export const MALAYSIAN_CLIMATE_TERMS = [
  'tropical rainforest', 'equatorial climate', 'monsoon', 'high humidity',
  'consistent temperature', 'wet season', 'dry season'
];

export const MALAYSIAN_DISEASES_PESTS = [
  'Ganoderma', 'BSR', 'Basal Stem Rot', 'rhinoceros beetle',
  'bagworm', 'leaf spot', 'crown disease', 'bunch rot'
];

interface RAGContext {
  content: string;
  relevance: number;
  confidence: number;
  source: string;
  malaysianContextScore: number;
  scientificRigor: number;
}

export class EnhancedRAGService {
  private supabase;
  private embeddings?: OpenAIEmbeddings;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize embeddings if OpenAI is configured
    if (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002'
      });
    }
  }

  /**
   * Query with Malaysian context awareness
   */
  async queryWithMalaysianContext(
    query: string, 
    limit: number = 5,
    minRelevanceScore: number = 0.5
  ): Promise<RAGContext[]> {
    try {
      if (!this.embeddings) {
        console.warn('OpenAI embeddings not configured, using fallback search');
        return this.fallbackTextSearch(query, limit);
      }

      // Generate query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Search in Supabase with pgvector
      const { data: documents, error } = await this.supabase
        .rpc('search_documents', {
          query_embedding: queryEmbedding,
          match_threshold: minRelevanceScore,
          match_count: limit * 2 // Get more to filter for Malaysian context
        });

      if (error) {
        console.error('Supabase search error:', error);
        return this.fallbackTextSearch(query, limit);
      }

      if (!documents || documents.length === 0) {
        return [];
      }

      // Process and score documents
      const ragContexts: RAGContext[] = documents.map((doc: any) => {
        const malaysianScore = this.calculateMalaysianContextScore(doc.content);
        const scientificScore = this.calculateScientificRigorScore(doc.content);
        
        return {
          content: doc.content,
          relevance: doc.similarity || 0.7,
          confidence: this.calculateConfidenceScore(doc.similarity || 0.7, malaysianScore, scientificScore),
          source: doc.source || 'Unknown',
          malaysianContextScore: malaysianScore,
          scientificRigor: scientificScore
        };
      });

      // Sort by confidence and Malaysian context
      ragContexts.sort((a, b) => {
        const scoreA = a.confidence + (a.malaysianContextScore * 0.3);
        const scoreB = b.confidence + (b.malaysianContextScore * 0.3);
        return scoreB - scoreA;
      });

      return ragContexts.slice(0, limit);

    } catch (error) {
      console.error('RAG query error:', error);
      return this.fallbackTextSearch(query, limit);
    }
  }

  /**
   * Fallback text search when embeddings are not available
   */
  private async fallbackTextSearch(query: string, limit: number): Promise<RAGContext[]> {
    try {
      // Try database search first
      const { data: documents, error } = await this.supabase
        .from('document_embeddings')
        .select('content, metadata')
        .textSearch('content', query, { type: 'websearch' })
        .limit(limit);

      if (documents && documents.length > 0) {
        return documents.map((doc: any) => {
          const malaysianScore = this.calculateMalaysianContextScore(doc.content);
          const scientificScore = this.calculateScientificRigorScore(doc.content);
          
          return {
            content: doc.content,
            relevance: 0.6,
            confidence: this.calculateConfidenceScore(0.6, malaysianScore, scientificScore),
            source: doc.metadata?.source || 'Document',
            malaysianContextScore: malaysianScore,
            scientificRigor: scientificScore
          };
        });
      }

      // If no documents found, return curated Malaysian oil palm context
      return this.getMalaysianOilPalmContext(query, limit);
    } catch (error) {
      console.error('Fallback search error:', error);
      return this.getMalaysianOilPalmContext(query, limit);
    }
  }

  /**
   * Get curated Malaysian oil palm context when database is unavailable
   */
  private getMalaysianOilPalmContext(query: string, limit: number): Promise<RAGContext[]> {
    const queryLower = query.toLowerCase();
    const contexts: RAGContext[] = [];

    // Soil analysis context
    if (queryLower.includes('soil') || queryLower.includes('ph') || queryLower.includes('nutrient')) {
      contexts.push({
        content: `Malaysian oil palm cultivation requires specific soil conditions. Optimal pH ranges from 4.0-6.0 for most Malaysian soils. Peninsular Malaysia predominantly has Ultisols and Oxisols, while Sabah and Sarawak have varied soil types including peat soils. Key nutrients include N (120-150 kg/ha/year), P (15-25 kg/ha/year), and K (100-120 kg/ha/year) according to MPOB guidelines. Magnesium deficiency is common in Malaysian plantations, requiring regular monitoring and supplementation.`,
        relevance: 0.9,
        confidence: 0.85,
        source: 'MPOB Guidelines',
        malaysianContextScore: 0.95,
        scientificRigor: 0.8
      });
    }

    // Leaf analysis context
    if (queryLower.includes('leaf') || queryLower.includes('foliar') || queryLower.includes('deficiency')) {
      contexts.push({
        content: `Oil palm leaf analysis in Malaysia follows MPOB standards. Critical nutrient levels for frond 17: N (2.5-2.8%), P (0.15-0.18%), K (0.8-1.2%), Mg (0.25-0.35%), Ca (0.5-0.7%). Boron deficiency is particularly problematic in Malaysian conditions, requiring 2-4 kg/ha annually. Leaf sampling should be conducted during dry periods, avoiding the first 2 months after heavy fertilization.`,
        relevance: 0.9,
        confidence: 0.85,
        source: 'MPOB Technical Guidelines',
        malaysianContextScore: 0.98,
        scientificRigor: 0.8
      });
    }

    // Climate and environmental context
    if (queryLower.includes('climate') || queryLower.includes('rainfall') || queryLower.includes('temperature')) {
      contexts.push({
        content: `Malaysian tropical climate with 2000-3000mm annual rainfall supports oil palm growth. Temperature ranges 26-28°C optimal. Two monsoon seasons affect nutrient management: Northeast (Nov-Mar) and Southwest (May-Sep). High humidity (80-90%) increases disease pressure, particularly Ganoderma and BSR. Climate change adaptation requires drought-resistant varieties and improved water management.`,
        relevance: 0.8,
        confidence: 0.8,
        source: 'Malaysian Meteorological Department',
        malaysianContextScore: 1.0,
        scientificRigor: 0.75
      });
    }

    // Yield and productivity context
    if (queryLower.includes('yield') || queryLower.includes('productivity') || queryLower.includes('ffb')) {
      contexts.push({
        content: `Malaysian oil palm average yield is 20-25 tons FFB/ha/year. Top performers achieve 30+ tons/ha. Yield factors include: genetics (DxP hybrid), age (peak at 8-15 years), nutrition management, and pest/disease control. RSPO and MSPO certification standards ensure sustainable practices. Precision agriculture and IoT monitoring increasingly adopted by large plantations.`,
        relevance: 0.85,
        confidence: 0.8,
        source: 'MPOB Statistics',
        malaysianContextScore: 0.95,
        scientificRigor: 0.8
      });
    }

    // Fertilizer management context
    if (queryLower.includes('fertilizer') || queryLower.includes('npk') || queryLower.includes('nutrition')) {
      contexts.push({
        content: `Malaysian oil palm fertilizer recommendations vary by soil type and region. Peninsular Malaysia: NPK 15:15:6:4 + TE, 2-3 kg/palm/year. East Malaysia peat soils require modified formulations with higher K and Mg. Split applications 3-4 times annually during dry periods. Organic matter incorporation essential for soil health. EFB (Empty Fruit Bunches) composting widely practiced.`,
        relevance: 0.9,
        confidence: 0.85,
        source: 'MPOB Best Practices',
        malaysianContextScore: 0.98,
        scientificRigor: 0.8
      });
    }

    // Disease and pest management
    if (queryLower.includes('disease') || queryLower.includes('pest') || queryLower.includes('ganoderma')) {
      contexts.push({
        content: `Major oil palm diseases in Malaysia: Ganoderma (basal stem rot), Upper stem rot, Blast disease. Ganoderma particularly severe in replanting areas. Prevention includes soil treatment, resistant planting materials, and sanitation. Integrated Pest Management (IPM) essential for bagworm, rhinoceros beetle, and rat control. Beneficial insects conservation programs show promising results.`,
        relevance: 0.85,
        confidence: 0.8,
        source: 'MPOB Plant Protection Division',
        malaysianContextScore: 0.95,
        scientificRigor: 0.8
      });
    }

    // If no specific contexts match, provide general Malaysian oil palm context
    if (contexts.length === 0) {
      contexts.push({
        content: `Malaysian oil palm industry is the world's second largest producer, covering 5.74 million hectares. Managed by MPOB (Malaysian Palm Oil Board), following RSPO and MSPO sustainability standards. Key research focuses on high-yielding varieties, precision agriculture, and sustainable practices. Industry challenges include labor shortage, replanting costs, and environmental concerns.`,
        relevance: 0.7,
        confidence: 0.75,
        source: 'MPOB Industry Overview',
        malaysianContextScore: 1.0,
        scientificRigor: 0.7
      });
    }

    return Promise.resolve(contexts.slice(0, limit));
  }

  /**
   * Calculate Malaysian context score
   */
  private calculateMalaysianContextScore(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    let maxScore = 0;

    // Check for Malaysian regions
    MALAYSIAN_REGIONS.forEach(region => {
      maxScore += 10;
      if (contentLower.includes(region.toLowerCase())) {
        score += 10;
      }
    });

    // Check for Malaysian institutions
    MALAYSIAN_INSTITUTIONS.forEach(institution => {
      maxScore += 15;
      if (contentLower.includes(institution.toLowerCase())) {
        score += 15;
      }
    });

    // Check for certification standards
    CERTIFICATION_STANDARDS.forEach(cert => {
      maxScore += 8;
      if (contentLower.includes(cert.toLowerCase())) {
        score += 8;
      }
    });

    // Check for soil types
    MALAYSIAN_SOIL_TYPES.forEach(soil => {
      maxScore += 5;
      if (contentLower.includes(soil.toLowerCase())) {
        score += 5;
      }
    });

    // Check for climate terms
    MALAYSIAN_CLIMATE_TERMS.forEach(climate => {
      maxScore += 5;
      if (contentLower.includes(climate.toLowerCase())) {
        score += 5;
      }
    });

    // Check for diseases and pests
    MALAYSIAN_DISEASES_PESTS.forEach(disease => {
      maxScore += 8;
      if (contentLower.includes(disease.toLowerCase())) {
        score += 8;
      }
    });

    return maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  }

  /**
   * Calculate scientific rigor score
   */
  private calculateScientificRigorScore(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 0;

    // Peer review indicators
    const peerReviewTerms = ['peer-reviewed', 'journal', 'published', 'research', 'study'];
    peerReviewTerms.forEach(term => {
      if (contentLower.includes(term)) score += 0.15;
    });

    // Statistical terms
    const statisticalTerms = ['p-value', 'significant', 'correlation', 'regression', 'analysis'];
    statisticalTerms.forEach(term => {
      if (contentLower.includes(term)) score += 0.1;
    });

    // Quantitative data
    const quantitativePatterns = [/\d+%/, /\d+\.\d+/, /±\d+/, /n\s*=\s*\d+/];
    quantitativePatterns.forEach(pattern => {
      if (pattern.test(content)) score += 0.1;
    });

    // Citation patterns
    const citationPatterns = [/\[\d+\]/, /\(\d{4}\)/, /et al\./, /doi:/];
    citationPatterns.forEach(pattern => {
      if (pattern.test(content)) score += 0.15;
    });

    // Methodology indicators
    const methodologyTerms = ['methodology', 'protocol', 'experimental', 'control group'];
    methodologyTerms.forEach(term => {
      if (contentLower.includes(term)) score += 0.1;
    });

    return Math.min(score, 1);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(
    relevance: number, 
    malaysianContext: number, 
    scientificRigor: number
  ): number {
    // Weighted combination of scores
    const weights = {
      relevance: 0.5,
      malaysian: 0.3,
      scientific: 0.2
    };

    return Math.min(
      relevance * weights.relevance +
      malaysianContext * weights.malaysian +
      scientificRigor * weights.scientific,
      1
    );
  }

  /**
   * Simple query method for backward compatibility
   */
  async query(query: string, limit: number = 5): Promise<any[]> {
    const contexts = await this.queryWithMalaysianContext(query, limit);
    return contexts.map(ctx => ({
      content: ctx.content,
      score: ctx.relevance,
      source: ctx.source
    }));
  }
}

// Export singleton instance
export const enhancedRAGService = new EnhancedRAGService();

// Backward compatibility export
export const RAGService = EnhancedRAGService;
export const ragService = enhancedRAGService;
