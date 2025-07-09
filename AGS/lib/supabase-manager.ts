import { createClient } from '@supabase/supabase-js';
import type { 
  Database, 
  AnalysisReportInsert, 
  PromptInsert, 
  UserPreferencesType
} from '@/types/supabase';
import type { AnalysisResult } from '@/lib/langchain-analyzer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Supabase utility functions for the Oil Palm AI Assistant
 */
export class SupabaseManager {
  private client;

  constructor() {
    this.client = supabase;
  }

 
  /**
   * Get the active prompt for a specific sample type and language
   */
  async getActivePrompt(sampleType: 'soil' | 'leaf', language: 'en' | 'ms' = 'en') {
    try {
      const { data, error } = await this.client
        .from('prompts')
        .select('*')
        .eq('sample_type', sampleType)
        .eq('language', language)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching active prompt:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to fetch active prompt:', error);
      return null;
    }
  }

  /**
   * Create a new prompt (admin only)
   */
  async createPrompt(prompt: {
    title: string;
    description?: string;
    template: string;
    sample_type: 'soil' | 'leaf';
    language?: 'en' | 'ms';
    user_focus?: 'sustainability' | 'cost' | 'yield' | 'balanced';
    is_active?: boolean;
  }) {
    try {
      const promptData: PromptInsert = {
        title: prompt.title,
        description: prompt.description,
        template: prompt.template,
        sample_type: prompt.sample_type,
        language: prompt.language ?? 'en',
        user_focus: prompt.user_focus,
        is_active: prompt.is_active ?? true,
        version: '1.0'
      };

      const { data, error } = await this.client
        .from('prompts')
        .insert(promptData)
        .select()
        .single();

      if (error) {
        console.error('Error creating prompt:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to create prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update an existing prompt (admin only)
   */
  async updatePrompt(id: string, updates: Partial<{
    title: string;
    description: string;
    template: string;
    sample_type: 'soil' | 'leaf';
    language: 'en' | 'ms';
    user_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
    is_active: boolean;
  }>) {
    try {
      // If template is being updated, increment version
      const versionUpdate = updates.template ? { version: await this.getNextVersion(id) } : {};

      const { data, error } = await this.client
        .from('prompts')
        .update({
          ...updates,
          ...versionUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to update prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all prompts with pagination (admin only)
   */
  async getPrompts() {
    try {
      const { data, error } = await this.client
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      return [];
    }
  }

  /**
   * Delete a prompt (admin only)
   */
  async deletePrompt(id: string) {
    try {
      const { error } = await this.client
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting prompt:', error);
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get next version number for a prompt
   */
  private async getNextVersion(promptId: string): Promise<string> {
    try {
      const { data, error } = await this.client
        .from('prompts')
        .select('version')
        .eq('id', promptId)
        .single();

      if (error || !data) {
        return '1.0';
      }

      const currentVersion = data.version || '1.0';
      const versionParts = currentVersion.split('.');
      const majorVersion = parseInt(versionParts[0] || '1', 10);
      const minorVersion = parseInt(versionParts[1] || '0', 10);
      
      return `${majorVersion}.${minorVersion + 1}`;
    } catch {
      return '1.0';
    }
  }


  /**
   * Store an analysis report
   */
  async storeAnalysisReport(
    userId: string,
    sampleType: 'soil' | 'leaf',
    fileNames: string[],
    fileSizes: number[],
    inputData: Record<string, unknown>,
    analysisResult: AnalysisResult,
    userPriorities?: UserPreferencesType,
    processingTimeMs?: number,
    landSize?: number,
    historicalYield?: number[]
  ) {
    try {
      const reportData: AnalysisReportInsert = {
        user_id: userId,
        sample_type: sampleType,
        file_names: fileNames,
        file_sizes: fileSizes,
        input_data: inputData,
        analysis_result: analysisResult,
        user_preferences: userPriorities,
        confidence_score: analysisResult.confidenceScore,
        risk_level: analysisResult.riskLevel,
        processing_time_ms: processingTimeMs,
        land_size: landSize,
        historical_yield: historicalYield,
        processing_method: 'enhanced'
      };

      const { data, error } = await this.client
        .from('analysis_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error('Error storing analysis report:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to store analysis report:', error);
      return { success: false, error: 'Failed to store analysis report' };
    }
  }

  /**
   * Get user's analysis reports
   */
  async getUserReports(userId: string, page = 0, pageSize = 10) {
    try {
      const { data, error, count } = await this.client
        .from('analysis_reports')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error fetching user reports:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        total: count || 0,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
      return { success: false, error: 'Failed to fetch user reports' };
    }
  }

  /**
   * Get a specific analysis report
   */
  async getAnalysisReport(reportId: string, userId?: string) {
    try {
      let query = this.client
        .from('analysis_reports')
        .select('*')
        .eq('id', reportId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching analysis report:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch analysis report:', error);
      return { success: false, error: 'Failed to fetch analysis report' };
    }
  }

  // ============================================================================
  // FEEDBACK MANAGEMENT
  // ============================================================================

  /**
   * Submit feedback for an analysis report
   */
  async submitFeedback(
    reportId: string,
    userId: string,
    rating: number,
    accuracyRating?: number,
    usefulnessRating?: number,
    comment?: string,
    suggestions?: string,
    recommendationFollowed?: boolean,
    yieldImprovement?: number
  ) {
    try {
      const { data, error } = await this.client
        .from('feedback')
        .insert({
          report_id: reportId,
          user_id: userId,
          rating,
          accuracy_rating: accuracyRating,
          usefulness_rating: usefulnessRating,
          comment,
          suggestions,
          recommendation_followed: recommendationFollowed,
          yield_improvement: yieldImprovement
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return { success: false, error: 'Failed to submit feedback' };
    }
  }

  /**
   * Get feedback for a report
   */
  async getReportFeedback(reportId: string) {
    try {
      const { data, error } = await this.client
        .from('feedback')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      return { success: false, error: 'Failed to fetch feedback' };
    }
  }

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching user profile:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        // Create default profile
        const { data: newProfile, error: createError } = await this.client
          .from('user_profiles')
          .insert({ id: userId })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return { success: false, error: createError.message };
        }

        return { success: true, data: newProfile };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<{
    full_name: string;
    organization: string;
    role: string;
    location: string;
    preferred_language: 'en' | 'ms';
    default_plantation_type: 'tenera' | 'dura' | 'pisifera';
    default_soil_type: 'mineral' | 'peat' | 'coastal';
    default_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
    total_land_size: number;
    experience_years: number;
  }>) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string) {
    try {
      const { data, error } = await this.client
        .rpc('get_user_analytics', { user_uuid: userId });

      if (error) {
        console.error('Error fetching user analytics:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      return { success: false, error: 'Failed to fetch user analytics' };
    }
  }

  /**
   * Get storage statistics (admin only)
   */
  async getStorageStats() {
    try {
      const { data, error } = await this.client.rpc('get_storage_stats');

      if (error) {
        console.error('Error fetching storage stats:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
      return { success: false, error: 'Failed to fetch storage stats' };
    }
  }

  // ============================================================================
  // FILE MANAGEMENT
  // ============================================================================

  /**
   * Generate secure upload path
   */
  async generateUploadPath(userId: string, fileName: string, fileType = 'general') {
    try {
      const { data, error } = await this.client
        .rpc('generate_upload_path', {
          user_id: userId,
          file_name: fileName,
          file_type: fileType
        });

      if (error) {
        console.error('Error generating upload path:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to generate upload path:', error);
      return { success: false, error: 'Failed to generate upload path' };
    }
  }

  /**
   * Validate file upload
   */
  async validateFileUpload(bucketName: string, fileSize: number, mimeType: string) {
    try {
      const { data, error } = await this.client
        .rpc('validate_file_upload', {
          bucket_name: bucketName,
          file_size: fileSize,
          mime_type: mimeType
        });

      if (error) {
        console.error('Error validating file upload:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to validate file upload:', error);
      return { success: false, error: 'Failed to validate file upload' };
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(bucketName: string, filePath: string, file: File | Buffer, options?: {
    cacheControl?: string;
    contentType?: string;
  }) {
    try {
      const { data, error } = await this.client.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          contentType: options?.contentType || 'application/octet-stream'
        });

      if (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to upload file:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  /**
   * Get file download URL
   */
  async getFileUrl(bucketName: string, filePath: string, expiresIn = 3600) {
    try {
      const { data, error } = await this.client.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create signed URL:', error);
      return { success: false, error: 'Failed to create signed URL' };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucketName: string, filePath: string) {
    try {
      const { data, error } = await this.client.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to delete file:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  // ============================================================================
  // REPORTS AND FEEDBACK
  // ============================================================================

  /**
   * Get analysis reports for admin dashboard
   */
  async getReports({ limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}) {
    try {
      const { data, error } = await this.client
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  }

  /**
   * Get feedback entries for admin dashboard
   */
  async getFeedback({ limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}) {
    try {
      const { data, error } = await this.client
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      return [];
    }
  }
}

// Export singleton instance
export const supabaseManager = new SupabaseManager();
