import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

interface OCRResult {
  extractedText: string;
  structuredData: {
    parameters: Record<string, {
      value: number | string;
      unit: string;
      confidence: number;
    }>;
    analysisType: 'soil' | 'leaf' | 'unknown';
    laboratory?: string;
    sampleInfo?: {
      sampleId?: string;
      date?: string;
      location?: string;
      depth?: string;
      processedAt?: string;
      [key: string]: unknown;
    };
  };
  confidence: number;
  processingMethod: 'gpt4o-vision' | 'tesseract-fallback';
}

export async function performOCR(file: File): Promise<string> {
  try {
    const result = await performAdvancedOCR(file);
    return result.extractedText;
  } catch (error) {
    console.error('Advanced OCR failed, falling back to basic extraction:', error);
    return await performFallbackOCR(file);
  }
}

export async function performAdvancedOCR(file: File): Promise<OCRResult> {
  try {
    console.log('Starting GPT-4o Vision OCR for agricultural data extraction...');
    
    // Convert file to base64 for GPT-4o Vision
    const base64Data = await fileToBase64(file);
    
    // Initialize GPT-4o with vision capabilities
    const visionModel = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    // Create specialized prompt for agricultural data extraction
    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert agricultural data analyst specializing in oil palm nutrition and soil science. You have been provided with an image that contains laboratory analysis data, field reports, or agricultural documentation.

Your task is to perform highly accurate optical character recognition and data extraction with domain-specific knowledge integration. Use your understanding of:
- Oil palm nutritional requirements and optimal ranges
- Soil chemistry and nutrient interactions
- Laboratory report formats and terminology
- Agricultural measurement units and conversions
- Common abbreviations in agricultural analysis

ANALYSIS INSTRUCTIONS:
1. Extract ALL visible text with perfect accuracy
2. Identify the type of analysis (soil test, leaf tissue analysis, etc.)
3. Extract numerical values with their corresponding parameters and units
4. Apply domain knowledge to validate and interpret the data
5. Correct obvious OCR errors using agricultural context
6. Standardize parameter names and units to industry standards

SPECIALIZED KNOWLEDGE TO APPLY:
- N, P, K, Ca, Mg, S = macronutrients
- B, Zn, Cu, Mn, Fe, Mo = micronutrients  
- pH, CEC, OM/OC = soil properties
- ppm, %, cmol/kg, meq/100g = common units
- Soil vs leaf analysis have different optimal ranges
- Laboratory naming conventions and report formats

CRITICAL REQUIREMENTS:
- Preserve ALL numerical values exactly as shown
- Maintain parameter-value-unit relationships
- Flag any suspicious or impossible values
- Provide confidence scores for each extracted parameter
- Include any sample identification, dates, or laboratory information

Return your analysis as a JSON object with this structure:
{{
  "extractedText": "Complete transcription of all visible text in the image",
  "structuredData": {{
    "parameters": {{
      "parameter_name": {{
        "value": numerical_value_or_string,
        "unit": "standardized_unit",
        "confidence": confidence_score_0_to_1
      }}
    }},
    "analysisType": "soil|leaf|unknown",
    "laboratory": "lab_name_if_visible",
    "sampleInfo": {{
      "sampleId": "sample_id_if_found",
      "date": "date_if_found", 
      "location": "location_if_found",
      "depth": "depth_if_soil_sample"
    }}
  }},
  "confidence": overall_confidence_0_to_1,
  "processingMethod": "gpt4o-vision"
}}

Image: {imageData}
`);

    // Create processing chain
    const chain = prompt.pipe(visionModel).pipe(new StringOutputParser());
    
    // Execute OCR with vision
    const response = await chain.invoke({
      imageData: `data:${file.type};base64,${base64Data}`
    });

    console.log('GPT-4o Vision response received, parsing...');

    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleanResponse) as OCRResult;

    // Validate and enhance result
    const validatedResult = validateAndEnhanceResult(result, file);
    
    console.log(`Advanced OCR completed with ${validatedResult.confidence * 100}% confidence`);
    return validatedResult;

  } catch (error) {
    console.error('GPT-4o Vision OCR failed:', error);
    throw new Error(`Advanced OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback OCR using Tesseract for basic text extraction
 */
async function performFallbackOCR(file: File): Promise<string> {
  try {
    const Tesseract = await import('tesseract.js');
    
    console.log('Using Tesseract fallback OCR...');
    
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Use Tesseract for OCR with enhanced settings
    const { data: { text } } = await Tesseract.recognize(
      fileUrl,
      'eng',
      {
        logger: progress => {
          if (progress.status === 'recognizing text') {
            console.log(`Fallback OCR Progress: ${Math.round(progress.progress * 100)}%`);
          }
        }
      }
    );
    
    // Clean up the URL object
    URL.revokeObjectURL(fileUrl);
    
    return text || 'No text detected in image';
    
  } catch (error) {
    console.error('Fallback OCR Error:', error);
    // Return a structured default that can be processed
    return 'OCR processing failed. Please try uploading a clearer image or enter data manually.';
  }
}

/**
 * Enhanced data extraction with agricultural intelligence
 */
export async function extractAgriculturalData(file: File): Promise<{
  rawText: string;
  parameters: Record<string, { value: number | string; unit: string; confidence: number }>;
  analysisType: 'soil' | 'leaf' | 'unknown';
  metadata: {
    laboratory?: string;
    sampleInfo?: Record<string, unknown>;
    confidence: number;
    processingMethod: string;
  };
}> {
  try {
    const result = await performAdvancedOCR(file);
    
    return {
      rawText: result.extractedText,
      parameters: result.structuredData.parameters,
      analysisType: result.structuredData.analysisType,
      metadata: {
        laboratory: result.structuredData.laboratory,
        sampleInfo: result.structuredData.sampleInfo,
        confidence: result.confidence,
        processingMethod: result.processingMethod
      }
    };
  } catch (error) {
    console.error('Agricultural data extraction failed:', error);
    
    // Fallback with basic OCR and simple parsing
    const text = await performFallbackOCR(file);
    return {
      rawText: text,
      parameters: extractBasicParameters(text),
      analysisType: 'unknown',
      metadata: { processingMethod: 'tesseract-fallback', confidence: 0.5 }
    };
  }
}

/**
 * Convert file to base64 for GPT-4o Vision
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate and enhance OCR results with agricultural knowledge
 */
function validateAndEnhanceResult(result: OCRResult, file: File): OCRResult {
  // Validate confidence scores
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    result.confidence = 0.8; // Default reasonable confidence
  }

  // Validate parameter confidence scores
  Object.keys(result.structuredData.parameters).forEach(key => {
    const param = result.structuredData.parameters[key];
    if (typeof param.confidence !== 'number' || param.confidence < 0 || param.confidence > 1) {
      param.confidence = 0.7; // Default parameter confidence
    }
  });

  // Apply agricultural knowledge validation
  result = applyAgriculturalValidation(result);

  // Add file metadata
  result.structuredData.sampleInfo = {
    ...result.structuredData.sampleInfo,
    processedAt: new Date().toISOString()
  };

  // Add file metadata separately
  const enhancedResult = result as OCRResult & { fileMetadata?: { fileName: string; fileSize: number } };
  enhancedResult.fileMetadata = {
    fileName: file.name,
    fileSize: file.size
  };

  return enhancedResult;
}

/**
 * Apply agricultural domain knowledge for validation
 */
function applyAgriculturalValidation(result: OCRResult): OCRResult {
  const parameters = result.structuredData.parameters;

  // Define realistic ranges for validation
  const soilRanges = {
    pH: { min: 3.0, max: 9.0 },
    N: { min: 0.01, max: 2.0 }, // %
    P: { min: 1, max: 200 }, // ppm
    K: { min: 0.05, max: 2.0 }, // cmol/kg
    Ca: { min: 0.1, max: 20 }, // cmol/kg
    Mg: { min: 0.05, max: 5.0 }, // cmol/kg
  };

  const leafRanges = {
    N: { min: 1.5, max: 4.0 }, // %
    P: { min: 0.1, max: 0.5 }, // %
    K: { min: 0.5, max: 2.5 }, // %
    Ca: { min: 0.2, max: 1.5 }, // %
    Mg: { min: 0.1, max: 0.8 }, // %
  };

  // Validate parameter values against known ranges
  Object.keys(parameters).forEach(key => {
    const param = parameters[key];
    const ranges = result.structuredData.analysisType === 'soil' ? soilRanges : leafRanges;
    
    if (ranges[key as keyof typeof ranges] && typeof param.value === 'number') {
      const range = ranges[key as keyof typeof ranges];
      if (param.value < range.min || param.value > range.max) {
        // Flag suspicious values but don't remove them
        param.confidence = Math.min(param.confidence, 0.5);
        console.warn(`Suspicious ${key} value: ${param.value} (expected ${range.min}-${range.max})`);
      }
    }
  });

  return result;
}

/**
 * Basic parameter extraction as fallback
 */
function extractBasicParameters(text: string): Record<string, { value: number | string; unit: string; confidence: number }> {
  const parameters: Record<string, { value: number | string; unit: string; confidence: number }> = {};
  
  // Basic regex patterns for common parameters
  const patterns = {
    pH: /ph[:\s]*(\d+\.?\d*)/i,
    nitrogen: /(?:nitrogen|total.*n|n)[:\s]*(\d+\.?\d*)/i,
    phosphorus: /(?:phosphorus|available.*p|p)[:\s]*(\d+\.?\d*)/i,
    potassium: /(?:potassium|exchangeable.*k|k)[:\s]*(\d+\.?\d*)/i,
    calcium: /(?:calcium|ca)[:\s]*(\d+\.?\d*)/i,
    magnesium: /(?:magnesium|mg)[:\s]*(\d+\.?\d*)/i,
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      parameters[key] = {
        value: parseFloat(match[1]),
        unit: '', // Unit detection would need more complex logic
        confidence: 0.6 // Lower confidence for basic extraction
      };
    }
  });

  return parameters;
}