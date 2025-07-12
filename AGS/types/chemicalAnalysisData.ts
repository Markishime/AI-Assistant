// Chemical Analysis Data Types

export interface ChemicalParameter {
  value: number | string;
  unit?: string;
  confidence?: number;
}

export interface SampleInfo {
  location?: string;
  date?: string;
  depth?: string;
  cultivar?: string;
  sampleId?: string;
}

export interface LaboratoryInfo {
  name?: string;
  method?: string;
  analyst?: string;
}

export interface ChemicalAnalysisData {
  type: 'soil' | 'leaf' | 'unknown';
  parameters: Record<string, ChemicalParameter>;
  sampleInfo?: SampleInfo;
  laboratory?: LaboratoryInfo;
}

export interface ExtractedData {
  text: string;
  structuredData: ChemicalAnalysisData | null;
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    extractionMethod: 'pdf' | 'ocr' | 'excel' | 'word' | 'csv' | 'text' | 'fallback';
    processingTime: number;
  };
}
