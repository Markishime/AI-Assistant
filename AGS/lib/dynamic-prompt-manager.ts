import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

export interface DynamicPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  // Malaysian-specific fields
  malaysian_context: boolean;
  scientific_rigor: 'high' | 'medium' | 'low';
  specificity_level: 'high' | 'medium' | 'low';
  // Usage tracking
  usage_count: number;
  success_rate: number;
  last_used: string | null;
}

export interface PromptContext {
  sampleType: 'soil' | 'leaf';
  userPriorities: {
    focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
    budget: 'high' | 'medium' | 'low';
    timeframe: 'immediate' | 'short_term' | 'long_term';
    language: 'en' | 'ms';
    plantationType: 'tenera' | 'dura' | 'pisifera';
    soilType: 'mineral' | 'peat' | 'coastal';
  };
  dataValues: Record<string, string | number>;
  referenceData: any;
  nutrientBalance: any;
  benchmarking: any;
  referenceContext: string;
}

export class DynamicPromptManager {
  private supabase: ReturnType<typeof createClient<Database>>;
  private cache: Map<string, DynamicPromptTemplate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get the most appropriate prompt template based on context
   */
  async getOptimalPrompt(context: PromptContext): Promise<string> {
    try {
      const templates = await this.getActiveTemplates(context.sampleType);
      
      if (templates.length === 0) {
        return this.getFallbackPrompt(context);
      }

      // Score templates based on context match
      const scoredTemplates = templates.map(template => ({
        template,
        score: this.calculateTemplateScore(template, context)
      }));

      // Sort by score and get the best match
      scoredTemplates.sort((a, b) => b.score - a.score);
      const bestTemplate = scoredTemplates[0].template;

      // Update usage statistics
      await this.updateTemplateUsage(bestTemplate.id);

      // Apply context-specific modifications
      return this.applyContextModifications(bestTemplate.template, context);
    } catch (error) {
      console.error('Error getting optimal prompt:', error);
      return this.getFallbackPrompt(context);
    }
  }

  /**
   * Calculate template score based on context match
   */
  private calculateTemplateScore(template: DynamicPromptTemplate, context: PromptContext): number {
    let score = 0;

    // Base score from priority
    score += template.priority === 'high' ? 30 : template.priority === 'medium' ? 20 : 10;

    // Malaysian context bonus
    if (template.malaysian_context && context.userPriorities.plantationType === 'tenera') {
      score += 25;
    }

    // Category match
    if (template.category === context.sampleType) {
      score += 20;
    }

    // Specificity level match
    if (template.specificity_level === 'high') {
      score += 15;
    }

    // Scientific rigor bonus
    if (template.scientific_rigor === 'high') {
      score += 10;
    }

    // Success rate bonus
    score += Math.floor(template.success_rate * 10);

    return score;
  }

  /**
   * Apply context-specific modifications to template
   */
  private applyContextModifications(template: string, context: PromptContext): string {
    let modifiedTemplate = template;

    // Add Malaysian-specific constraints
    if (context.userPriorities.plantationType === 'tenera') {
      modifiedTemplate += `

MALAYSIAN CONTEXT CONSTRAINTS:
- Focus on Tenera palm variety (N >2.5%, P >0.15%, K >1.0%)
- Consider Malaysian soil conditions (pH 5.5-6.5, tropical climate)
- Reference MPOB standards and guidelines
- Include cost considerations in Malaysian Ringgit
- Address sustainability and RSPO compliance
- Consider regional weather patterns and monsoon seasons
- Include local pest and disease management strategies
- Reference Malaysian fertilizer recommendations and application timing`;
    }

    // Add soil type specific constraints
    if (context.userPriorities.soilType === 'peat') {
      modifiedTemplate += `

PEAT SOIL SPECIFIC CONSTRAINTS:
- Address high organic matter content and CEC
- Consider subsidence and drainage requirements
- Include micronutrient management (Cu, Zn, B)
- Address pH management and liming requirements
- Consider water table management
- Include peat soil specific fertilizer application methods`;
    }

    // Add budget constraints
    if (context.userPriorities.budget === 'low') {
      modifiedTemplate += `

BUDGET CONSTRAINTS:
- Prioritize cost-effective solutions
- Focus on gradual improvements over time
- Consider local material availability
- Include DIY or low-cost alternatives
- Emphasize long-term ROI over immediate results`;
    }

    // Add sustainability focus
    if (context.userPriorities.focus === 'sustainability') {
      modifiedTemplate += `

SUSTAINABILITY FOCUS:
- Emphasize environmental impact reduction
- Include carbon sequestration strategies
- Address biodiversity conservation
- Consider circular economy principles
- Include waste reduction and recycling
- Address water conservation and management`;
    }

    return modifiedTemplate;
  }

  /**
   * Get active prompt templates from database
   */
  private async getActiveTemplates(sampleType: 'soil' | 'leaf'): Promise<DynamicPromptTemplate[]> {
    const cacheKey = `templates_${sampleType}`;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return Array.from(this.cache.values()).filter(t => t.category === sampleType);
    }

    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true)
        .eq('category', sampleType)
        .order('priority', { ascending: false })
        .order('success_rate', { ascending: false });

      if (error) throw error;

      // Update cache
      if (data && data.length > 0) {
        this.cache.set(cacheKey, data[0] as DynamicPromptTemplate);
        this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
      }

      return data as DynamicPromptTemplate[];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  /**
   * Update template usage statistics
   */
  private async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      // Get current usage count and increment
      const { data: currentTemplate } = await this.supabase
        .from('prompt_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (currentTemplate) {
        await this.supabase
          .from('prompt_templates')
          .update({
            usage_count: (currentTemplate.usage_count || 0) + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', templateId);
      }
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }

  /**
   * Create a new prompt template
   */
  async createTemplate(template: Omit<DynamicPromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'success_rate' | 'last_used'>): Promise<DynamicPromptTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert({
          ...template,
          version: '1.0',
          usage_count: 0,
          success_rate: 0.8, // Default success rate
          last_used: null
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();

      return data as DynamicPromptTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update an existing prompt template
   */
  async updateTemplate(id: string, updates: Partial<DynamicPromptTemplate>): Promise<DynamicPromptTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();

      return data as DynamicPromptTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Get fallback prompt when no templates are available
   */
  private getFallbackPrompt(context: PromptContext): string {
    return `You are an expert Malaysian oil palm agronomist with 20+ years of experience in ${context.sampleType} analysis.

ANALYSIS REQUIREMENTS:
- Provide specific, actionable recommendations for Malaysian conditions
- Reference MPOB standards and local best practices
- Include cost-benefit analysis in Malaysian Ringgit
- Address sustainability and environmental impact
- Consider regional climate and soil conditions
- Provide timeline for implementation
- Include risk assessment and mitigation strategies

RESPONSE FORMAT:
Respond with ONLY valid JSON in this exact format:
{
  "interpretation": "Detailed analysis interpretation with Malaysian context",
  "issues": ["Specific issues identified"],
  "improvementPlan": [
    {
      "recommendation": "Specific actionable recommendation",
      "reasoning": "Scientific explanation with Malaysian context",
      "estimatedImpact": "Expected impact with metrics",
      "priority": "High|Medium|Low",
      "timeframe": "Implementation timeline",
      "costBenefitRatio": "ROI estimate"
    }
  ],
  "riskLevel": "Low|Medium|High|Critical",
  "confidenceScore": 85,
  "malaysianContext": "Specific Malaysian considerations",
  "sustainabilityMetrics": {
    "environmentalImpact": "Environmental considerations",
    "rspoCompliance": "RSPO compliance status",
    "carbonSequestration": "Carbon sequestration potential"
  }
}

DATA TO ANALYZE:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

USER PREFERENCES:
Focus: ${context.userPriorities.focus}
Budget: ${context.userPriorities.budget}
Timeframe: ${context.userPriorities.timeframe}
Soil Type: ${context.userPriorities.soilType}
Palm Variety: ${context.userPriorities.plantationType}`;
  }

  /**
   * Clear the template cache
   */
  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get all templates with optional category filter
   */
  async getAllTemplates(category?: string): Promise<DynamicPromptTemplate[]> {
    try {
      let query = this.supabase
        .from('prompt_templates')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as DynamicPromptTemplate[];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    averageSuccessRate: number;
    mostUsedTemplate: string | null;
    categoryDistribution: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*');

      if (error) throw error;

      const templates = data as DynamicPromptTemplate[];
      
      return {
        totalTemplates: templates.length,
        activeTemplates: templates.filter(t => t.is_active).length,
        averageSuccessRate: templates.reduce((sum, t) => sum + t.success_rate, 0) / templates.length,
        mostUsedTemplate: templates.reduce((max, t) => t.usage_count > (max?.usage_count || 0) ? t : max, null as DynamicPromptTemplate | null)?.name || null,
        categoryDistribution: templates.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting template analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dynamicPromptManager = new DynamicPromptManager(); 