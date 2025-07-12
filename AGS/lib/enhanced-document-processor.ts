/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ChemicalAnalysisData, ExtractedData } from '../types/chemicalAnalysisData';

let isLibraryLoaded = false;
let openaiPDFProcessor: ChatOpenAI | null = null;

const loadLibraries = async () => {
  if (isLibraryLoaded) return true;

  try {
    // Initialize OpenAI for PDF processing in server environments
    if (typeof window === 'undefined') {
      openaiPDFProcessor = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        modelName: 'gpt-4o-mini',
        temperature: 0,
      });
      console.log('OpenAI initialized for server-side processing');
    }
    
    isLibraryLoaded = true;
    console.log('Basic document processing initialized');
    return true;
  } catch (error) {
    console.error('Error loading basic document processing:', error);
    return false;
  }
};

class EnhancedDocumentProcessor {
  private llm: ChatOpenAI;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    // Initialize LangChain LLM with OpenAI
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
    });

    // Initialize text splitter for large documents
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }

  async processFile(file: File): Promise<ExtractedData> {
    try {
      const librariesLoaded = await loadLibraries();
      
      const startTime = Date.now();
      console.log(`Starting processing for: ${file.name} (${file.type})`);
      
      // Simple text extraction
      let rawText = '';
      let extractionMethod: 'text' | 'csv' | 'fallback' = 'fallback';
      
      try {
        // Try to read as text first
        rawText = await file.text();
        extractionMethod = 'text';
        
        // If it looks like CSV, mark it as such
        if (file.name.toLowerCase().includes('.csv') || rawText.includes(',')) {
          extractionMethod = 'csv';
        }
      } catch (error) {
        console.error('Text extraction failed:', error);
        // Create a fallback based on filename
        rawText = `Analysis file: ${file.name}\nFile size: ${file.size} bytes\nPlease upload a text-based file for analysis.`;
        extractionMethod = 'fallback';
      }

      if (!rawText || rawText.trim().length < 10) {
        throw new Error('No readable text found in the document. Please ensure you upload a text-based file (CSV, TXT, etc.).');
      }

      console.log(`Text extracted (${rawText.length} characters). Starting AI analysis...`);

      // Use LangChain to analyze and structure the data
      const structuredData = await this.analyzeWithLangChain(rawText, file.name);
      
      return {
        text: rawText,
        structuredData,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          extractionMethod: extractionMethod,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Document processing failed:', error);
      throw error;
    }
  }

  private async analyzeWithLangChain(text: string, fileName: string): Promise<ChemicalAnalysisData | null> {
    try {
      const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert in oil palm chemical analysis. Analyze the following document text and extract structured chemical analysis data.

Document: {fileName}
Text: {text}

Extract the following information as JSON:
{{
  "parameters": {{
    "parameter_name": {{
      "value": number_or_string,
      "unit": "unit_if_available",
      "status": "normal|low|high|critical",
      "confidence": number_0_to_1
    }}
  }},
  "summary": "Brief summary of what was found",
  "dataQuality": "high|medium|low",
  "extractedValues": {{
    "param1": value1,
    "param2": value2
  }}
}}

Look for common soil/leaf analysis parameters like:
- pH, Organic Matter, Nitrogen (N), Phosphorus (P), Potassium (K)
- Calcium (Ca), Magnesium (Mg), Sulfur (S)
- Micronutrients: Iron (Fe), Manganese (Mn), Zinc (Zn), Boron (B), Copper (Cu)
- Physical properties: CEC, Base Saturation, Moisture

If no structured data is found, return null.
`);

      const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
      
      const result = await chain.invoke({
        fileName,
        text: text.substring(0, 8000) // Limit text to avoid token limits
      });

      try {
        // Extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse LangChain response as JSON:', parseError);
      }

      return null;
    } catch (error) {
      console.error('LangChain analysis failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const enhancedDocumentProcessor = new EnhancedDocumentProcessor();
