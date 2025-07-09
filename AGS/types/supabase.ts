// Supabase Database Types for Oil Palm AI Assistant
// Auto-generated types based on the database schema

// JSONB field type definitions
export interface AnalysisResultType {
  interpretation: string;
  issues: string[];
  improvementPlan: Array<{
    recommendation: string;
    reasoning: string;
    estimatedImpact: string;
    priority: 'High' | 'Medium' | 'Low';
    investmentLevel?: 'High' | 'Medium' | 'Low';
    implementationSteps?: string;
    sustainabilityBenefits?: string;
    costBenefit?: string;
    potentialImprovement?: string;
  }>;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  nutrientBalance?: {
    ratios: Record<string, number>;
    imbalances: string[];
    criticalDeficiencies: string[];
    antagonisms: string[];
  };
  yieldForecast?: {
    highInvestment: number[];
    mediumInvestment: number[];
    lowInvestment: number[];
    baseline: number[];
    benchmarkComparison: {
      malaysiaAverage: number;
      regionalAverage: number;
      potentialImprovement: string;
    };
  };
  regionalBenchmarking?: {
    currentYieldVsBenchmark: string;
    potentialImprovement: string;
    rankingPercentile: number;
  };
  sustainabilityMetrics?: {
    carbonSequestrationPotential: string;
    rspoCompliance: string;
    environmentalImpact: string;
  };
  metadata?: Record<string, unknown>;
}

export interface InputDataType {
  extractedValues?: Record<string, string | number>;
  rawText?: string;
  fileMetadata?: {
    name: string;
    size: number;
    type: string;
  };
  processingMethod?: 'standard' | 'enhanced';
}

export interface UserPreferencesType {
  focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
  budget?: 'high' | 'medium' | 'low';
  timeframe?: 'immediate' | 'short_term' | 'long_term';
  language?: 'en' | 'ms';
  plantationType?: 'tenera' | 'dura' | 'pisifera';
  soilType?: 'mineral' | 'peat' | 'coastal';
}

export interface DocumentMetadataType {
  pages?: number;
  wordCount?: number;
  language?: string;
  extractionMethod?: string;
  confidence?: number;
  tags?: string[];
  summary?: string;
}

export interface AdminLogValuesType {
  [key: string]: string | number | boolean | null;
}

export interface UserAnalyticsData {
  totalReports: number;
  averageRating: number;
  improvementTrend: number;
  mostUsedFeatures: string[];
  plantationData: {
    totalArea: number;
    averageYield: number;
    soilTypes: Record<string, number>;
  };
  feedbackSummary: {
    totalFeedbacks: number;
    averageAccuracy: number;
    averageUsefulness: number;
  };
}

export interface FileValidationData {
  isValid: boolean;
  errors?: string[];
  maxSize: number;
  allowedTypes: string[];
}

export interface StorageStatsData {
  totalUploads: number;
  totalSize: number;
  bucketStats: Record<string, {
    fileCount: number;
    totalSize: number;
    averageSize: number;
  }>;
  recentActivity: Array<{
    action: string;
    timestamp: string;
    fileCount: number;
  }>;
}

export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          version: string;
          title: string;
          description: string | null;
          template: string;
          sample_type: 'soil' | 'leaf';
          language: 'en' | 'ms';
          user_focus: 'sustainability' | 'cost' | 'yield' | 'balanced' | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          version?: string;
          title: string;
          description?: string | null;
          template: string;
          sample_type: 'soil' | 'leaf';
          language?: 'en' | 'ms';
          user_focus?: 'sustainability' | 'cost' | 'yield' | 'balanced' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          version?: string;
          title?: string;
          description?: string | null;
          template?: string;
          sample_type?: 'soil' | 'leaf';
          language?: 'en' | 'ms';
          user_focus?: 'sustainability' | 'cost' | 'yield' | 'balanced' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      analysis_reports: {
        Row: {
          id: string;
          user_id: string | null;
          sample_type: 'soil' | 'leaf';
          file_names: string[];
          file_sizes: number[];
          input_data: InputDataType;
          analysis_result: AnalysisResultType;
          user_preferences: UserPreferencesType | null;
          confidence_score: number | null;
          risk_level: 'Low' | 'Medium' | 'High' | 'Critical' | null;
          processing_method: string | null;
          processing_time_ms: number | null;
          created_at: string;
          land_size: number | null;
          historical_yield: number[] | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          sample_type: 'soil' | 'leaf';
          file_names: string[];
          file_sizes: number[];
          input_data: InputDataType;
          analysis_result: AnalysisResultType;
          user_preferences?: UserPreferencesType | null;
          confidence_score?: number | null;
          risk_level?: 'Low' | 'Medium' | 'High' | 'Critical' | null;
          processing_method?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
          land_size?: number | null;
          historical_yield?: number[] | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          sample_type?: 'soil' | 'leaf';
          file_names?: string[];
          file_sizes?: number[];
          input_data?: InputDataType;
          analysis_result?: AnalysisResultType;
          user_preferences?: UserPreferencesType | null;
          confidence_score?: number | null;
          risk_level?: 'Low' | 'Medium' | 'High' | 'Critical' | null;
          processing_method?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
          land_size?: number | null;
          historical_yield?: number[] | null;
        };
      };
      feedback: {
        Row: {
          id: string;
          report_id: string;
          user_id: string | null;
          rating: number;
          accuracy_rating: number | null;
          usefulness_rating: number | null;
          comment: string | null;
          suggestions: string | null;
          recommendation_followed: boolean | null;
          yield_improvement: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id?: string | null;
          rating: number;
          accuracy_rating?: number | null;
          usefulness_rating?: number | null;
          comment?: string | null;
          suggestions?: string | null;
          recommendation_followed?: boolean | null;
          yield_improvement?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string | null;
          rating?: number;
          accuracy_rating?: number | null;
          usefulness_rating?: number | null;
          comment?: string | null;
          suggestions?: string | null;
          recommendation_followed?: boolean | null;
          yield_improvement?: number | null;
          created_at?: string;
        };
      };
      reference_documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          source: string | null;
          document_type: string | null;
          file_path: string | null;
          content_hash: string | null;
          metadata: DocumentMetadataType | null;
          language: 'en' | 'ms';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          source?: string | null;
          document_type?: string | null;
          file_path?: string | null;
          content_hash?: string | null;
          metadata?: DocumentMetadataType | null;
          language?: 'en' | 'ms';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          source?: string | null;
          document_type?: string | null;
          file_path?: string | null;
          content_hash?: string | null;
          metadata?: DocumentMetadataType | null;
          language?: 'en' | 'ms';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_embeddings: {
        Row: {
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          content_hash: string;
          embedding: number[];
          metadata: Record<string, string | number | boolean> | null;
          token_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          chunk_index: number;
          content: string;
          content_hash: string;
          embedding: number[];
          metadata?: Record<string, string | number | boolean> | null;
          token_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          chunk_index?: number;
          content?: string;
          content_hash?: string;
          embedding?: number[];
          metadata?: Record<string, string | number | boolean> | null;
          token_count?: number | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          organization: string | null;
          role: string | null;
          location: string | null;
          preferred_language: 'en' | 'ms';
          default_plantation_type: 'tenera' | 'dura' | 'pisifera';
          default_soil_type: 'mineral' | 'peat' | 'coastal';
          default_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
          total_land_size: number | null;
          experience_years: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          organization?: string | null;
          role?: string | null;
          location?: string | null;
          preferred_language?: 'en' | 'ms';
          default_plantation_type?: 'tenera' | 'dura' | 'pisifera';
          default_soil_type?: 'mineral' | 'peat' | 'coastal';
          default_focus?: 'sustainability' | 'cost' | 'yield' | 'balanced';
          total_land_size?: number | null;
          experience_years?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          organization?: string | null;
          role?: string | null;
          location?: string | null;
          preferred_language?: 'en' | 'ms';
          default_plantation_type?: 'tenera' | 'dura' | 'pisifera';
          default_soil_type?: 'mineral' | 'peat' | 'coastal';
          default_focus?: 'sustainability' | 'cost' | 'yield' | 'balanced';
          total_land_size?: number | null;
          experience_years?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: AdminLogValuesType | null;
          new_values: AdminLogValuesType | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: AdminLogValuesType | null;
          new_values?: AdminLogValuesType | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: AdminLogValuesType | null;
          new_values?: AdminLogValuesType | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_active_prompt: {
        Args: {
          p_sample_type: 'soil' | 'leaf';
          p_language?: 'en' | 'ms';
        };
        Returns: {
          id: string;
          template: string;
          version: string;
          description: string;
        }[];
      };
      get_user_analytics: {
        Args: {
          user_uuid: string;
        };
        Returns: UserAnalyticsData;
      };
      generate_upload_path: {
        Args: {
          user_id: string;
          file_name: string;
          file_type?: string;
        };
        Returns: string;
      };
      validate_file_upload: {
        Args: {
          bucket_name: string;
          file_size: number;
          mime_type: string;
        };
        Returns: FileValidationData;
      };
      cleanup_old_uploads: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_storage_stats: {
        Args: Record<string, never>;
        Returns: StorageStatsData;
      };
    };
    Enums: {
      sample_type: 'soil' | 'leaf';
      risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
      priority_level: 'High' | 'Medium' | 'Low';
      user_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
      language_code: 'en' | 'ms';
      plantation_type: 'tenera' | 'dura' | 'pisifera';
      soil_type: 'mineral' | 'peat' | 'coastal';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Utility types for easier usage
export type SupabasePrompt = Database['public']['Tables']['prompts']['Row'];
export type SupabaseAnalysisReport = Database['public']['Tables']['analysis_reports']['Row'];
export type SupabaseFeedback = Database['public']['Tables']['feedback']['Row'];
export type SupabaseReferenceDocument = Database['public']['Tables']['reference_documents']['Row'];
export type SupabaseDocumentEmbedding = Database['public']['Tables']['document_embeddings']['Row'];
export type SupabaseUserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type SupabaseAdminLog = Database['public']['Tables']['admin_logs']['Row'];

// Insert types
export type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
export type AnalysisReportInsert = Database['public']['Tables']['analysis_reports']['Insert'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type ReferenceDocumentInsert = Database['public']['Tables']['reference_documents']['Insert'];
export type DocumentEmbeddingInsert = Database['public']['Tables']['document_embeddings']['Insert'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type AdminLogInsert = Database['public']['Tables']['admin_logs']['Insert'];

// Update types
export type PromptUpdate = Database['public']['Tables']['prompts']['Update'];
export type AnalysisReportUpdate = Database['public']['Tables']['analysis_reports']['Update'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];
export type ReferenceDocumentUpdate = Database['public']['Tables']['reference_documents']['Update'];
export type DocumentEmbeddingUpdate = Database['public']['Tables']['document_embeddings']['Update'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
export type AdminLogUpdate = Database['public']['Tables']['admin_logs']['Update'];

// Enum types
export type SampleType = Database['public']['Enums']['sample_type'];
export type RiskLevel = Database['public']['Enums']['risk_level'];
export type PriorityLevel = Database['public']['Enums']['priority_level'];
export type UserFocus = Database['public']['Enums']['user_focus'];
export type LanguageCode = Database['public']['Enums']['language_code'];
export type PlantationType = Database['public']['Enums']['plantation_type'];
export type SoilType = Database['public']['Enums']['soil_type'];

// Function return types
export type ActivePromptResult = Database['public']['Functions']['get_active_prompt']['Returns'][0];
export type UserAnalyticsResult = Database['public']['Functions']['get_user_analytics']['Returns'];
export type FileValidationResult = Database['public']['Functions']['validate_file_upload']['Returns'];
export type StorageStatsResult = Database['public']['Functions']['get_storage_stats']['Returns'];

// Custom interfaces for the application
export interface UserPriorities {
  focus: UserFocus;
  budget: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  language: LanguageCode;
  plantationType: PlantationType;
  soilType: SoilType;
}

export interface AnalysisMetadata {
  enhancedProcessing?: boolean;
  extractionMethod?: string;
  processingTime?: number;
  structuredDataFound?: boolean;
  extractedValues?: Record<string, number>;
  fallbackReason?: string;
  promptVersion?: string;
}

export interface FileUploadMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadPath: string;
  processingMethod: 'standard' | 'enhanced';
}

// Enhanced types for better type safety
export interface PromptTemplate {
  id: string;
  template: string;
  version: string;
  description: string;
  sampleType: SampleType;
  language: LanguageCode;
  userFocus: UserFocus;
}

export interface AnalysisRequest {
  userId?: string;
  sampleType: SampleType;
  inputData: InputDataType;
  userPreferences?: UserPreferencesType;
  useEnhanced?: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  reportId?: string;
  result?: AnalysisResultType;
  metadata?: AnalysisMetadata;
  error?: string;
}

// Storage bucket configuration
export interface StorageBucketConfig {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number; // bytes
  allowedMimeTypes: string[];
}

export const STORAGE_BUCKETS: Record<string, StorageBucketConfig> = {
  uploads: {
    id: 'uploads',
    name: 'uploads',
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/json'
    ]
  },
  referenceDocuments: {
    id: 'reference-documents',
    name: 'reference-documents',
    public: false,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]
  },
  reports: {
    id: 'reports',
    name: 'reports',
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/json'
    ]
  }
};
