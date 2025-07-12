import { z } from 'zod';

// =============================================
// USER VALIDATION SCHEMAS
// =============================================

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  organization: z.string().optional(),
  preferredLanguage: z.enum(['en', 'ms', 'zh', 'ta']).default('en'),
  defaultPlantationType: z.enum(['dura', 'pisifera', 'tenera']).optional(),
  defaultSoilType: z.enum(['clay', 'sandy', 'loam', 'peat']).optional(),
  defaultFocus: z.enum(['yield', 'quality', 'sustainability', 'cost']).optional(),
  totalLandSize: z.number().positive().optional(),
  experienceYears: z.number().min(0).max(100).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  organization: z.string().optional(),
  preferredLanguage: z.enum(['en', 'ms', 'zh', 'ta']).optional(),
  defaultPlantationType: z.enum(['dura', 'pisifera', 'tenera']).optional(),
  defaultSoilType: z.enum(['clay', 'sandy', 'loam', 'peat']).optional(),
  defaultFocus: z.enum(['yield', 'quality', 'sustainability', 'cost']).optional(),
  totalLandSize: z.number().positive().optional(),
  experienceYears: z.number().min(0).max(100).optional(),
});

// =============================================
// ANALYSIS VALIDATION SCHEMAS
// =============================================

export const soilAnalysisSchema = z.object({
  fieldId: z.string().uuid().optional(),
  sampleLocation: z.string().min(1, 'Sample location is required'),
  sampleDepth: z.number().min(0).max(200, 'Depth must be between 0-200cm'),
  ph: z.number().min(0).max(14, 'pH must be between 0-14'),
  organicMatter: z.number().min(0).max(100, 'Organic matter percentage must be 0-100%'),
  nitrogen: z.number().min(0, 'Nitrogen content cannot be negative'),
  phosphorus: z.number().min(0, 'Phosphorus content cannot be negative'),
  potassium: z.number().min(0, 'Potassium content cannot be negative'),
  calcium: z.number().min(0, 'Calcium content cannot be negative'),
  magnesium: z.number().min(0, 'Magnesium content cannot be negative'),
  sulfur: z.number().min(0, 'Sulfur content cannot be negative'),
  boron: z.number().min(0, 'Boron content cannot be negative').optional(),
  zinc: z.number().min(0, 'Zinc content cannot be negative').optional(),
  iron: z.number().min(0, 'Iron content cannot be negative').optional(),
  manganese: z.number().min(0, 'Manganese content cannot be negative').optional(),
  copper: z.number().min(0, 'Copper content cannot be negative').optional(),
  texture: z.enum(['clay', 'sandy', 'loam', 'silt']),
  cationExchangeCapacity: z.number().min(0).optional(),
  electricalConductivity: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const leafAnalysisSchema = z.object({
  fieldId: z.string().uuid().optional(),
  sampleLocation: z.string().min(1, 'Sample location is required'),
  leafAge: z.enum(['young', 'mature', 'old']),
  plantAge: z.number().min(0).max(50, 'Plant age must be 0-50 years'),
  nitrogen: z.number().min(0, 'Nitrogen content cannot be negative'),
  phosphorus: z.number().min(0, 'Phosphorus content cannot be negative'),
  potassium: z.number().min(0, 'Potassium content cannot be negative'),
  calcium: z.number().min(0, 'Calcium content cannot be negative'),
  magnesium: z.number().min(0, 'Magnesium content cannot be negative'),
  sulfur: z.number().min(0, 'Sulfur content cannot be negative'),
  boron: z.number().min(0, 'Boron content cannot be negative').optional(),
  zinc: z.number().min(0, 'Zinc content cannot be negative').optional(),
  iron: z.number().min(0, 'Iron content cannot be negative').optional(),
  manganese: z.number().min(0, 'Manganese content cannot be negative').optional(),
  copper: z.number().min(0, 'Copper content cannot be negative').optional(),
  chlorophyll: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// =============================================
// FIELD MANAGEMENT SCHEMAS
// =============================================

export const fieldCreateSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  location: z.string().min(1, 'Location is required'),
  size: z.number().positive('Field size must be positive'),
  sizeUnit: z.enum(['hectares', 'acres']).default('hectares'),
  plantationType: z.enum(['dura', 'pisifera', 'tenera']),
  plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  soilType: z.enum(['clay', 'sandy', 'loam', 'peat']),
  drainage: z.enum(['excellent', 'good', 'moderate', 'poor']),
  slope: z.enum(['flat', 'gentle', 'moderate', 'steep']),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  notes: z.string().optional(),
});

export const fieldUpdateSchema = fieldCreateSchema.partial();

// =============================================
// DOCUMENT MANAGEMENT SCHEMAS
// =============================================

export const documentUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  category: z.enum(['research', 'guide', 'regulation', 'case_study', 'best_practice']),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(['en', 'ms', 'zh', 'ta']).default('en'),
  isPublic: z.boolean().default(false),
});

// =============================================
// PROMPT MANAGEMENT SCHEMAS
// =============================================

export const promptTemplateSchema = z.object({
  name: z.string().min(1, 'Prompt name is required'),
  description: z.string().optional(),
  template: z.string().min(10, 'Prompt template must be at least 10 characters'),
  category: z.enum(['soil_analysis', 'leaf_analysis', 'general', 'troubleshooting', 'recommendations']),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  language: z.enum(['en', 'ms', 'zh', 'ta']).default('en'),
});

// =============================================
// ADMIN SCHEMAS
// =============================================

export const moduleToggleSchema = z.object({
  moduleKey: z.string().min(1, 'Module key is required'),
  isEnabled: z.boolean(),
});

export const userRoleUpdateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['user', 'admin', 'manager']),
});

// =============================================
// API RESPONSE SCHEMAS
// =============================================

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export const apiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
});

// =============================================
// FEEDBACK SCHEMAS
// =============================================

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'general']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['ui', 'analysis', 'performance', 'data', 'other']),
  reproductionSteps: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  browserInfo: z.string().optional(),
});

// =============================================
// ANALYTICS SCHEMAS
// =============================================

export const analyticsEventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  eventCategory: z.string().min(1, 'Event category is required'),
  eventAction: z.string().min(1, 'Event action is required'),
  eventLabel: z.string().optional(),
  eventValue: z.number().optional(),
  customDimensions: z.record(z.string()).optional(),
});

// =============================================
// QUERY VALIDATION
// =============================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

// =============================================
// HELPER FUNCTIONS
// =============================================

export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
};

export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Type exports for use in components
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type SoilAnalysis = z.infer<typeof soilAnalysisSchema>;
export type LeafAnalysis = z.infer<typeof leafAnalysisSchema>;
export type FieldCreate = z.infer<typeof fieldCreateSchema>;
export type FieldUpdate = z.infer<typeof fieldUpdateSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type PromptTemplate = z.infer<typeof promptTemplateSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>; 