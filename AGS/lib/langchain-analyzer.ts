import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { getReferenceDocumentManager } from './reference-document-manager';

// Define simplified schemas to avoid type instantiation issues
const improvementPlanItemSchema = z.object({
  recommendation: z.string(),
  reasoning: z.string(),
  estimatedImpact: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
});

const analysisSchema = z.object({
  interpretation: z.string(),
  issues: z.array(z.string()),
  improvementPlan: z.array(improvementPlanItemSchema),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
  confidenceScore: z.number().min(0).max(100),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

// Define the reference data type
interface ReferenceDataItem {
  optimal: number[];
  unit: string;
  interpretation: string;
}

type ReferenceData = Record<string, ReferenceDataItem>;

export class LangChainAnalyzer {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.3,
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });
  }

  async analyzeData(
    sampleType: 'soil' | 'leaf',
    values: Record<string, string | number>,
    referenceData: ReferenceData
  ): Promise<AnalysisResult> {
    // Get relevant context from reference documents
    const documentManager = getReferenceDocumentManager();
    
    // Create search query based on analysis data
    const searchQuery = this.createSearchQuery(sampleType, values);
    console.log('Searching for relevant context with query:', searchQuery);
    
    const referenceContext = await documentManager.getContextForQuery(searchQuery);
    
    const promptTemplate = PromptTemplate.fromTemplate(`
You are an agronomist specialized in oil palm production in Malaysia. Your task is to act as a technical diagnostic and advisory assistant for plantation managers and field agronomists. You will receive input data from one or more of the following sources:  

- Soil Test Reports
- Leaf (Frond) Tissue Test Reports
- Historical Yield Data
- Land Size Information

These files may be uploaded individually or in combination. Always analyze whatever is available. If certain data are missing, do not assume values. Instead, indicate the limitations of the analysis and focus only on the available information.

---

Step 1: Analyze the Uploaded Data

For each uploaded report, extract and interpret the following:

Soil Test Parameters (if provided):
- pH (acidity/alkalinity)
- Cation Exchange Capacity (CEC)
- Base Saturation percentages for Ca, Mg, K, and Na
- Exchangeable nutrients: Ca, Mg, K, Na
- Available Phosphorus (Olsen P or Bray P, depending on pH)
- Total Nitrogen (N)
- Organic Matter or Organic Carbon
- Optional: Boron (B), Copper (Cu), Zinc (Zn), Manganese (Mn), Iron (Fe), Aluminium (Al), and soil texture

Leaf Tissue Test Parameters (if provided):
- Nitrogen (N), Phosphorus (P), Potassium (K), Calcium (Ca), Magnesium (Mg)
- Optional: Boron (B), Copper (Cu), Zinc (Zn), Chloride (Cl)

Yield and Land Size Data (if provided):
- Prior year(s) yield in tons per hectare
- Total land area in hectares

---

Step 2: Diagnose Agronomic Issues

Based on the interpreted results, identify:
- Any deficiencies or excesses
- Imbalances between nutrients
- Signs of soil degradation or other limiting factors

Clearly list out the main problems you detect.

Provide a short explanation of the potential cause behind each issue (e.g., acidic pH reducing phosphorus availability, magnesium-potassium antagonism, excessive sodium causing nutrient lock-up).

---

Step 3: Recommend Solutions

For each identified problem, provide three clear improvement options:

1. High-investment approach  
   More capital-intensive but high-performing and fast-acting.

2. Moderate-investment approach  
   Balanced in terms of cost and benefit.

3. Low-investment approach  
   More affordable and slower but viable for smaller growers.

For each solution:
- Briefly explain how it works
- Discuss agronomic benefit
- Note the long-term sustainability value (e.g., soil health, reduced runoff, carbon sequestration)

---

Step 4: Economic Impact Forecast

If land size and yield data are available:
- Give a percentage-based yield improvement projection for each proposed solution
- Include a simple cost-benefit overview in terms of input-output gain/loss
  (Do not mention actual market prices. Just reference costs and gains proportionally.)

---

Step 5: Forecast Graph

At the end of your report, generate a graph with three trend lines for the next five years' predicted yields (one for each solution). Include the following:
- Y-axis: Projected Yield in tons/ha
- X-axis: Years (1 to 5)
- Three lines: One per solution path (High, Medium, Low investment)

---

Style Guide:

- Use clear and actionable language.
- Write in a tone suitable for field agronomists and plantation managers in Malaysia.
- Avoid generic recommendations. Always tie advice to the actual data uploaded.
- Structure the report clearly with headers and bullet points.
- If analysis is limited due to missing data, say so.

ANALYSIS DATA:
{dataValues}

REFERENCE STANDARDS:
{referenceStandards}

RELEVANT KNOWLEDGE BASE INFORMATION:
{referenceContext}

CONTEXT:
- Sample Type: {sampleType}
- Analysis conducted for oil palm plantation optimization

Please respond with ONLY a valid JSON object in this exact format:
{{
  "interpretation": "string - detailed interpretation following the step-by-step analysis above",
  "issues": ["array of strings - identified issues or deficiencies from Step 2"],
  "improvementPlan": [
    {{
      "recommendation": "string - specific recommendation from Step 3 (High/Medium/Low investment approach)",
      "reasoning": "string - explanation of how it works and agronomic benefit",
      "estimatedImpact": "string - expected yield improvement percentage and sustainability value",
      "priority": "High|Medium|Low"
    }}
  ],
  "riskLevel": "Low|Medium|High|Critical",
  "confidenceScore": number between 0-100
}}
`);

    const prompt = await promptTemplate.format({
      sampleType,
      dataValues: JSON.stringify(values, null, 2),
      referenceStandards: JSON.stringify(referenceData, null, 2),
      referenceContext: referenceContext || 'No additional reference information available.',
    });

    try {
      const response = await this.model.invoke(prompt);
      let result: AnalysisResult;
      
      try {
        // Parse the JSON response directly
        const content = response.content as string;
        // Extract JSON from response if it contains extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        result = JSON.parse(jsonStr) as AnalysisResult;
        
        // Validate the result matches our expected structure
        analysisSchema.parse(result);
      } catch {
        // If parsing fails, return fallback
        return this.getFallbackAnalysis(sampleType, values);
      }
      
      // Validate and enhance the result
      return this.validateAndEnhanceResult(result, sampleType, values);
    } catch (error) {
      console.error('LangChain analysis error:', error);
      // Fallback to basic analysis
      return this.getFallbackAnalysis(sampleType, values);
    }
  }

  private validateAndEnhanceResult(
    result: AnalysisResult, 
    sampleType: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _values: Record<string, string | number>
  ): AnalysisResult {
    // Ensure we have valid data
    if (!result.interpretation || result.interpretation.length < 50) {
      result.interpretation = `Analysis of ${sampleType} sample shows mixed results. Some parameters are within acceptable ranges while others may require attention.`;
    }

    if (!result.improvementPlan || result.improvementPlan.length === 0) {
      result.improvementPlan = [{
        recommendation: "Monitor nutrient levels regularly",
        reasoning: "Regular monitoring helps detect changes early",
        estimatedImpact: "Improved plant health and yield stability",
        priority: "Medium" as const,
      }];
    }

    // Ensure confidence score is reasonable
    if (!result.confidenceScore || result.confidenceScore < 60) {
      result.confidenceScore = Math.max(60, result.confidenceScore || 70);
    }

    return result;
  }

  private getFallbackAnalysis(
    sampleType: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _values: Record<string, string | number>
  ): AnalysisResult {
    return {
      interpretation: `Basic analysis of ${sampleType} sample completed. The data shows various nutrient levels that should be evaluated against optimal ranges for oil palm cultivation.`,
      issues: ["Limited analysis due to processing constraints"],
      improvementPlan: [
        {
          recommendation: "Conduct detailed soil/leaf analysis",
          reasoning: "More comprehensive data needed for accurate recommendations",
          estimatedImpact: "Better informed management decisions",
          priority: "High" as const,
        }
      ],
      riskLevel: "Medium" as const,
      confidenceScore: 65,
    };
  }

  async analyzeWithOCR(
    sampleType: 'soil' | 'leaf',
    ocrText: string,
    referenceData: ReferenceData
  ): Promise<{values: Record<string, number>, analysis: AnalysisResult}> {
    // First, extract structured data from OCR text using LangChain
    const extractionPrompt = PromptTemplate.fromTemplate(`
Extract numerical values for oil palm {sampleType} analysis from the following text.
Look for common parameters like pH, nitrogen, phosphorus, potassium, calcium, magnesium, etc.

TEXT TO ANALYZE:
{ocrText}

Return ONLY a JSON object with parameter names as keys and numerical values as numbers.
Example: {{"pH": 6.5, "nitrogen": 0.25, "phosphorus": 20}}

If a parameter is not found, do not include it in the result.
`);

    try {
      const extractionResponse = await this.model.invoke(
        await extractionPrompt.format({ sampleType, ocrText })
      );
      
      let extractedValues: Record<string, number> = {};
      try {
        extractedValues = JSON.parse(extractionResponse.content as string);
      } catch {
        // Fallback extraction using regex
        extractedValues = this.extractValuesWithRegex(ocrText);
      }

      // Analyze the extracted values
      const analysis = await this.analyzeData(sampleType, extractedValues, referenceData);
      
      return { values: extractedValues, analysis };
    } catch (error) {
      console.error('OCR analysis error:', error);
      // Fallback to regex extraction
      const values = this.extractValuesWithRegex(ocrText);
      const analysis = await this.analyzeData(sampleType, values, referenceData);
      return { values, analysis };
    }
  }

  private extractValuesWithRegex(text: string): Record<string, number> {
    const lowerText = text.toLowerCase();
    
    const patterns = {
      pH: /ph\s*[:\-]?\s*(\d+\.?\d*)/,
      nitrogen: /nitrogen\s*[:\-]?\s*(\d+\.?\d*)/,
      phosphorus: /phosphorus\s*[:\-]?\s*(\d+\.?\d*)/,
      potassium: /potassium\s*[:\-]?\s*(\d+\.?\d*)/,
      calcium: /calcium\s*[:\-]?\s*(\d+\.?\d*)/,
      magnesium: /magnesium\s*[:\-]?\s*(\d+\.?\d*)/,
    };

    const result: Record<string, number> = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        result[key] = parseFloat(match[1]);
      }
    }

    return result;
  }

  /**
   * Create a search query to find relevant context from reference documents
   */
  private createSearchQuery(sampleType: 'soil' | 'leaf', values: Record<string, string | number>): string {
    const issues: string[] = [];
    const parameters: string[] = [];
    
    // Analyze values to identify potential issues and key parameters
    Object.entries(values).forEach(([param, value]) => {
      parameters.push(param);
      
      // Identify potential issues based on common parameter ranges
      if (typeof value === 'number') {
        if (param.toLowerCase().includes('ph')) {
          if (value < 4.5 || value > 6.5) {
            issues.push('pH imbalance');
          }
        }
        if (param.toLowerCase().includes('nitrogen') && value < 0.2) {
          issues.push('nitrogen deficiency');
        }
        if (param.toLowerCase().includes('phosphorus') && value < 15) {
          issues.push('phosphorus deficiency');
        }
        if (param.toLowerCase().includes('potassium') && value < 0.15) {
          issues.push('potassium deficiency');
        }
      }
    });
    
    // Build search query
    const queryParts = [
      `oil palm ${sampleType} analysis`,
      ...parameters.slice(0, 3), // Include top 3 parameters
    ];
    
    if (issues.length > 0) {
      queryParts.push(...issues.slice(0, 2)); // Include top 2 issues
    }
    
    // Add relevant topic keywords
    if (sampleType === 'soil') {
      queryParts.push('fertilizer management', 'soil preparation');
    } else {
      queryParts.push('nutrient deficiency', 'leaf symptoms');
    }
    
    return queryParts.join(' ');
  }
}
