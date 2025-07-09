/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ChemicalAnalysisData, ExtractedData } from '../types/chemicalAnalysisData';

let pdfjsLib: any = null;
let createWorker: any = null;
let ExcelJS: any = null;
let mammoth: any = null;
let Papa: any = null;
let isLibraryLoaded = false;
// Initialize OpenAI instance for PDF processing
let openaiPDFProcessor: ChatOpenAI | null = null;

const loadLibraries = async () => {
  if (isLibraryLoaded) return;

  try {
    // Initialize OpenAI for PDF processing in server environments
    if (typeof window === 'undefined') {
      // We're in a server environment
      openaiPDFProcessor = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        modelName: 'gpt-4.1',
        temperature: 0,
      });
      console.log('OpenAI initialized for server-side PDF processing');
    } else {
      // We're in a browser environment
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      console.log('PDF.js initialized for client-side PDF processing');
    }
    
    // Load Tesseract.js
    const tesseract = await import('tesseract.js');
    createWorker = tesseract.createWorker;
    
    // Load ExcelJS
    ExcelJS = await import('exceljs');
    
    // Load Mammoth
    mammoth = await import('mammoth');
    
    // Load PapaParse
    Papa = await import('papaparse');
    
    isLibraryLoaded = true;
    console.log('Document processing libraries loaded successfully');
  } catch (error) {
    console.error('Error loading document processing libraries:', error);
    throw new Error(`Failed to load document processing libraries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

class EnhancedDocumentProcessor {
  private llm: ChatOpenAI;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    // Initialize LangChain LLM with OpenAI
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      modelName: 'gpt-4.1',
      temperature: 0.1,
    });

    // Initialize text splitter for large documents
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }

  // Guess file type from name if MIME type is not available
  private guessFileTypeFromName(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'xlsx':
      case 'xls':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'docx':
      case 'doc':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'tif':
      case 'tiff':
        return 'image/tiff';
      default:
        return 'text/plain';
    }
  }

  // Process text files or unknown formats
  private async processAsText(file: File): Promise<string> {
    try {
      return await file.text();
    } catch (error) {
      console.error('Error reading text from file:', error);
      return '';
    }
  }

  async processFile(file: File): Promise<ExtractedData> {
    try {
      await loadLibraries();
      
      const startTime = Date.now();
      console.log(`Starting enhanced processing for: ${file.name} (${file.type})`);
      
      // Step 1: Extract raw text
      let rawText = '';
      let extractionMethod: 'pdf' | 'ocr' | 'excel' | 'word' | 'csv' | 'text' = 'text';
      
      try {
        const fileType = file.type || this.guessFileTypeFromName(file.name);
        
        switch (fileType) {
          case 'application/pdf':
            rawText = await this.processPDF(file);
            extractionMethod = 'pdf';
            break;
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.ms-excel':
            rawText = await this.processExcel(file);
            extractionMethod = 'excel';
            break;
          case 'text/csv':
          case 'application/csv':
            rawText = await this.processCSV(file);
            extractionMethod = 'csv';
            break;
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/msword':
            rawText = await this.processWord(file);
            extractionMethod = 'word';
            break;
          default:
            if (fileType.startsWith('image/')) {
              rawText = await this.processImage(file);
              extractionMethod = 'ocr';
            } else {
              // Fallback to basic text extraction
              rawText = await this.processAsText(file);
              extractionMethod = 'text';
            }
        }
      } catch (error) {
        console.error('Raw extraction failed:', error);
        throw new Error(`Failed to extract text from ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (!rawText || rawText.trim().length < 10) {
        throw new Error('No readable text found in the document.');
      }

      console.log(`Raw text extracted (${rawText.length} characters). Starting AI analysis...`);

      // Step 2: Use LangChain to analyze and structure the data
      const structuredData = await this.analyzeWithLangChain(rawText, file.name);
      
      return {
        text: rawText,
        structuredData,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extractionMethod: extractionMethod as any,
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
      // Create a prompt for extracting chemical analysis data
      const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert in oil palm chemical analysis. Analyze the following document text and extract structured chemical analysis data.

Document: {fileName}
Text: {text}

Extract the following information and format as JSON:
1. Analysis type (soil or leaf analysis)
2. Chemical parameters with values and units
3. Sample information (location, date, depth, cultivar, sample ID)
4. Laboratory information if available

Focus on extracting:
- Nutrient levels (N, P, K, Mg, Ca, S, etc.)
- pH values
- Electrical conductivity (EC)
- Organic matter content
- Micronutrients (B, Mn, Fe, Zn, Cu, etc.)
- Heavy metals if present
- Moisture content
- Any other relevant chemical parameters

Return ONLY a valid JSON object with this structure:
{{
  "type": "soil" | "leaf" | "unknown",
  "parameters": {{
    "parameter_name": {{
      "value": number_or_string,
      "unit": "unit_if_available",
      "confidence": confidence_score_0_to_1
    }}
  }},
  "sampleInfo": {{
    "location": "location_if_found",
    "date": "date_if_found",
    "depth": "depth_if_found",
    "cultivar": "cultivar_if_found",
    "sampleId": "sample_id_if_found"
  }},
  "laboratory": {{
    "name": "lab_name_if_found",
    "method": "analysis_method_if_found",
    "analyst": "analyst_name_if_found"
  }}
}}

If no chemical analysis data is found, return null.
`)

      const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
      
      // Split text if it's too long
      const docs = await this.textSplitter.createDocuments([text])
      let result = null
      
      for (const doc of docs) {
        try {
          const response = await chain.invoke({
            fileName,
            text: doc.pageContent
          })
          
          console.log('LLM Response:', response)
          
          // Try to parse the JSON response
          const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
          const parsed = JSON.parse(cleanResponse)
          
          if (parsed && parsed.parameters && Object.keys(parsed.parameters).length > 0) {
            result = parsed
            break // Use the first chunk that contains valid data
          }
        } catch (parseError) {
          console.warn('Failed to parse LLM response as JSON:', parseError)
          continue
        }
      }
      
      return result
    } catch (error) {
      console.error('LangChain analysis failed:', error)
      return null
    }
  }

  private async processPDF(file: File): Promise<string> {
    // Check if we're running in a server environment
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Server-side PDF processing using OpenAI
      return this.processPDFWithOpenAI(file);
    } else {
      // Client-side PDF processing using PDF.js
      if (!pdfjsLib) {
        throw new Error('PDF.js library not loaded')
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const numPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => (item as { str?: string }).str || '')
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText;
    }
  }

  private async processPDFWithOpenAI(file: File): Promise<string> {
    try {
      if (!openaiPDFProcessor) {
        throw new Error('OpenAI not initialized for PDF processing');
      }
      
      console.log('Using OpenAI for PDF extraction in server environment');
      const base64Data = await this.fileToBase64(file);
      
      // Using the initialized OpenAI client for PDF extraction
      const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert PDF content extractor. I've provided a PDF file that needs to be analyzed for an oil palm agricultural application. 
Please extract ALL text content from this PDF with perfect accuracy, preserving as much formatting and structure as possible.
This is for a chemical analysis/soil/leaf analysis data extraction task, so ALL numerical values, parameter names, and units are extremely important.

The extracted text will be processed further by another AI system, so include all content without summarization.
Preserve tables by formatting them with clear headers and aligned columns.

Extracted content:`);

      const chain = prompt.pipe(openaiPDFProcessor).pipe(new StringOutputParser());
      const response = await chain.invoke({
        file: base64Data
      });
      
      return response;
    } catch (error) {
      console.error('OpenAI PDF extraction failed:', error);
      throw new Error(`Failed to extract PDF with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async fileToBase64(file: File): Promise<string> {
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

  private async processExcel(file: File): Promise<string> {
    if (!ExcelJS) {
      throw new Error('ExcelJS library not loaded')
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    
    let extractedText = `Excel Analysis Report: ${file.name}\n\n`
    
    workbook.eachSheet((worksheet: unknown, sheetId: number) => {
      const ws = worksheet as { name: string; eachRow: (callback: (row: unknown, rowNumber: number) => void) => void }
      extractedText += `Sheet ${sheetId}: ${ws.name}\n`
      
      ws.eachRow((row: unknown, rowNumber: number) => {
        const r = row as { eachCell: (callback: (cell: unknown) => void) => void }
        const rowData: string[] = []
        r.eachCell((cell: unknown) => {
          const c = cell as { value: unknown }
          if (c.value !== null && c.value !== undefined) {
            rowData.push(String(c.value))
          }
        })
        if (rowData.length > 0) {
          extractedText += `Row ${rowNumber}: ${rowData.join(' | ')}\n`
        }
      })
      extractedText += '\n'
    })
    
    return extractedText
  }

  private async processWord(file: File): Promise<string> {
    if (!mammoth) {
      throw new Error('Mammoth library not loaded')
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  private async processImage(file: File): Promise<string> {
    const isServer = typeof window === 'undefined';
    
    if (isServer && openaiPDFProcessor) {
      // Use OpenAI for image OCR in server environments
      return this.processImageWithOpenAI(file);
    } else {
      // Use Tesseract in browser environments
      if (!createWorker) {
        throw new Error('Tesseract.js library not loaded');
      }
      
      const worker = await createWorker('eng');
      
      try {
        const { data: { text } } = await worker.recognize(file);
        return text;
      } finally {
        await worker.terminate();
      }
    }
  }

  private async processImageWithOpenAI(file: File): Promise<string> {
    try {
      if (!openaiPDFProcessor) {
        throw new Error('OpenAI not initialized for image processing');
      }
      
      console.log('Using OpenAI for image OCR in server environment');
      const base64Data = await this.fileToBase64(file);
      
      // Using the initialized OpenAI client for image OCR
      const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert OCR engine. I've provided an image that contains text related to oil palm agricultural data. 
Please extract ALL text content from this image with perfect accuracy, preserving formatting and structure.
This is for a chemical analysis/soil/leaf analysis data extraction task, so ALL numerical values, parameter names, and units are extremely important.

The extracted text will be processed further by another AI system, so include all content without summarization.
If there are tables, format them with clear headers and aligned columns.

Extracted content:`);

      const chain = prompt.pipe(openaiPDFProcessor).pipe(new StringOutputParser());
      const response = await chain.invoke({
        image: base64Data
      });
      
      return response;
    } catch (error) {
      console.error('OpenAI image OCR failed:', error);
      throw new Error(`Failed to extract text from image with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processCSV(file: File): Promise<string> {
    await loadLibraries()
    
    if (!Papa) {
      throw new Error('PapaParse library not loaded')
    }
    
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    })
    
    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors)
    }
    
    // Convert parsed CSV data to readable text format
    let csvText = `CSV File: ${file.name}\n\n`
    
    if (parsed.data && parsed.data.length > 0) {
      // Add headers
      const firstRow = parsed.data[0] as Record<string, unknown>
      const headers = Object.keys(firstRow)
      csvText += 'Columns: ' + headers.join(', ') + '\n\n'
      
      // Add data rows
      csvText += 'Data:\n'
      parsed.data.forEach((row: unknown, index: number) => {
        const r = row as Record<string, unknown>
        csvText += `Row ${index + 1}:\n`
        headers.forEach(header => {
          if (r[header]) {
            csvText += `  ${header}: ${r[header]}\n`
          }
        })
        csvText += '\n'
      })
      
      csvText += `\nTotal rows: ${parsed.data.length}`
    }
    
    return csvText
  }
}

export const enhancedDocumentProcessor = new EnhancedDocumentProcessor()
