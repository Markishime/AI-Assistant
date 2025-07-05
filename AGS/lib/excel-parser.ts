import ExcelJS from 'exceljs';

// Define types for Excel data
type CellValue = string | number | boolean | Date | null | undefined;

interface ExcelAnalysisResult {
  values: Record<string, number>;
  metadata: {
    fileName: string;
    sheetNames: string[];
    extractedFrom: string;
    confidence: number;
    cellReferences: Record<string, string>;
  };
}

interface ParameterLocation {
  parameter: string;
  value: number;
  cellAddress: string;
  confidence: number;
}

export class ExcelParser {
  static async parseExcelFile(file: File): Promise<ExcelAnalysisResult> {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Create workbook and load the file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      // Get sheet names
      const sheetNames = workbook.worksheets.map(ws => ws.name);
      
      // Process the first worksheet (or find the most relevant one)
      const worksheet = this.findBestWorksheet(workbook);
      
      console.log(`Processing worksheet: ${worksheet.name}`);
      
      // Extract values using intelligent parsing
      const analysisResult = this.extractValuesFromWorksheet(worksheet);
      
      return {
        values: analysisResult.values,
        metadata: {
          fileName: file.name,
          sheetNames,
          extractedFrom: worksheet.name,
          confidence: this.calculateConfidence(analysisResult.locations),
          cellReferences: analysisResult.cellReferences,
        },
      };
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error(`Failed to parse Excel file: ${error}`);
    }
  }

  private static findBestWorksheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    // Look for worksheets with common agriculture-related names
    const preferredNames = ['analysis', 'results', 'data', 'soil', 'leaf', 'nutrient'];
    
    for (const name of preferredNames) {
      const sheet = workbook.worksheets.find(ws => 
        ws.name.toLowerCase().includes(name)
      );
      if (sheet) return sheet;
    }
    
    // Return the first non-empty worksheet
    return workbook.worksheets.find(ws => ws.rowCount > 0) || workbook.worksheets[0];
  }

  private static extractValuesFromWorksheet(worksheet: ExcelJS.Worksheet): {
    values: Record<string, number>;
    locations: ParameterLocation[];
    cellReferences: Record<string, string>;
  } {
    const locations: ParameterLocation[] = [];
    const cellReferences: Record<string, string> = {};
    const parameterMap = this.createParameterMap();
    
    // Iterate through all cells to find parameter-value pairs
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const cellValue = this.getCellDisplayValue(cell);
        if (typeof cellValue !== 'string') return;
        
        const cellText = cellValue.toLowerCase().trim();
        
        // Check if this cell contains a parameter name
        for (const [standardName, variants] of Object.entries(parameterMap)) {
          const matchingVariant = variants.find(variant => 
            this.isParameterMatch(cellText, variant)
          );
          
          if (matchingVariant) {
            // Look for the value in nearby cells
            const valueResult = this.findValueNearCell(worksheet, rowNumber, colNumber);
            if (valueResult) {
              locations.push({
                parameter: standardName,
                value: valueResult.value,
                cellAddress: valueResult.address,
                confidence: valueResult.confidence
              });
              
              cellReferences[standardName] = `${cell.address} → ${valueResult.address}`;
              console.log(`Found ${standardName}: ${valueResult.value} (${valueResult.confidence}% confidence) at ${valueResult.address}`);
            }
            break;
          }
        }
      });
    });
    
    // If no structured data found, try pattern matching on all text
    if (locations.length === 0) {
      const fallbackResults = this.extractUsingPatterns(worksheet);
      locations.push(...fallbackResults);
    }
    
    // Convert locations to values object, keeping highest confidence value for duplicates
    const values: Record<string, number> = {};
    const bestLocations: Record<string, ParameterLocation> = {};
    
    for (const location of locations) {
      if (!bestLocations[location.parameter] || 
          bestLocations[location.parameter].confidence < location.confidence) {
        bestLocations[location.parameter] = location;
        values[location.parameter] = location.value;
      }
    }
    
    return { values, locations, cellReferences };
  }

  private static getCellDisplayValue(cell: ExcelJS.Cell): CellValue {
    // Handle different cell types appropriately
    if (cell.type === ExcelJS.ValueType.Number) {
      return cell.value as number;
    } else if (cell.type === ExcelJS.ValueType.String || cell.type === ExcelJS.ValueType.SharedString) {
      return cell.text || cell.value as string;
    } else if (cell.type === ExcelJS.ValueType.Formula) {
      return cell.result || cell.text || '';
    } else if (cell.type === ExcelJS.ValueType.RichText) {
      return cell.text || '';
    }
    return cell.value as CellValue;
  }

  private static isParameterMatch(cellText: string, variant: string): boolean {
    // More sophisticated matching
    return cellText.includes(variant) || 
           cellText.replace(/\s+/g, '').includes(variant.replace(/\s+/g, '')) ||
           this.fuzzyMatch(cellText, variant);
  }

  private static fuzzyMatch(text: string, pattern: string, threshold: number = 0.8): boolean {
    // Simple Levenshtein distance-based fuzzy matching
    const distance = this.levenshteinDistance(text, pattern);
    const maxLength = Math.max(text.length, pattern.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static createParameterMap(): Record<string, string[]> {
    return {
      pH: ['ph', 'p.h', 'acidity', 'ph level', 'ph value', 'hydrogen', 'h+'],
      nitrogen: ['nitrogen', 'n', 'n%', 'total nitrogen', 'total n', 'n content', 'nitrate', 'ammonia'],
      phosphorus: ['phosphorus', 'p', 'p2o5', 'available phosphorus', 'phosphate', 'p content', 'soluble p'],
      potassium: ['potassium', 'k', 'k2o', 'available potassium', 'potash', 'k content', 'exchangeable k'],
      calcium: ['calcium', 'ca', 'cao', 'available calcium', 'ca content', 'exchangeable ca'],
      magnesium: ['magnesium', 'mg', 'mgo', 'available magnesium', 'mg content', 'exchangeable mg'],
      sulfur: ['sulfur', 's', 'sulphur', 'available sulfur', 's content', 'sulfate', 'so4'],
      iron: ['iron', 'fe', 'available iron', 'fe content', 'ferrous', 'ferric'],
      manganese: ['manganese', 'mn', 'available manganese', 'mn content'],
      zinc: ['zinc', 'zn', 'available zinc', 'zn content'],
      copper: ['copper', 'cu', 'available copper', 'cu content'],
      boron: ['boron', 'b', 'available boron', 'b content', 'boric acid'],
      organicMatter: ['organic matter', 'om', 'organic carbon', 'oc', 'humus'],
      electricalConductivity: ['electrical conductivity', 'ec', 'conductivity', 'salinity'],
      cationExchangeCapacity: ['cation exchange capacity', 'cec', 'exchange capacity'],
    };
  }

  private static findValueNearCell(worksheet: ExcelJS.Worksheet, rowNumber: number, colNumber: number): {
    value: number;
    address: string;
    confidence: number;
  } | null {
    // Define search patterns with different confidence levels
    const searchPatterns = [
      { rowOffset: 0, colOffset: 1, confidence: 90 }, // Right
      { rowOffset: 1, colOffset: 0, confidence: 85 }, // Below
      { rowOffset: 1, colOffset: 1, confidence: 80 }, // Below-right
      { rowOffset: 0, colOffset: 2, confidence: 75 }, // Two cells right
      { rowOffset: 2, colOffset: 0, confidence: 70 }, // Two rows below
      { rowOffset: -1, colOffset: 1, confidence: 65 }, // Above-right
      { rowOffset: 1, colOffset: -1, confidence: 60 }, // Below-left
    ];

    for (const pattern of searchPatterns) {
      const targetRow = rowNumber + pattern.rowOffset;
      const targetCol = colNumber + pattern.colOffset;
      
      if (targetRow < 1 || targetCol < 1) continue;
      
      const cell = worksheet.getCell(targetRow, targetCol);
      const value = this.extractNumberFromCell(cell);
      
      if (value !== null) {
        return {
          value,
          address: cell.address,
          confidence: pattern.confidence
        };
      }
    }
    
    return null;
  }

  private static extractNumberFromCell(cell: ExcelJS.Cell): number | null {
    const value = this.getCellDisplayValue(cell);
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Clean the string and extract number
      const cleaned = value
        .replace(/[%,\s$€£¥]/g, '') // Remove common symbols
        .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
        .trim();
      
      if (cleaned === '') return null;
      
      const parsed = parseFloat(cleaned);
      return !isNaN(parsed) ? parsed : null;
    }
    
    return null;
  }

  private static extractUsingPatterns(worksheet: ExcelJS.Worksheet): ParameterLocation[] {
    const locations: ParameterLocation[] = [];
    let allText = '';
    
    // Collect all text from the worksheet
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        const text = this.getCellDisplayValue(cell);
        if (typeof text === 'string') {
          allText += ' ' + text.toLowerCase();
        }
      });
    });
    
    // Pattern-based extraction as fallback
    const patterns = {
      pH: /ph\s*[:\-=]?\s*(\d+\.?\d*)/i,
      nitrogen: /(?:nitrogen|n)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      phosphorus: /(?:phosphorus|p2o5|p)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      potassium: /(?:potassium|k2o|k)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      calcium: /(?:calcium|ca)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      magnesium: /(?:magnesium|mg)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      organicMatter: /(?:organic\s*matter|om)\s*[:\-=]?\s*(\d+\.?\d*)/i,
      electricalConductivity: /(?:electrical\s*conductivity|ec)\s*[:\-=]?\s*(\d+\.?\d*)/i,
    };

    for (const [param, pattern] of Object.entries(patterns)) {
      const match = allText.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          locations.push({
            parameter: param,
            value,
            cellAddress: 'Pattern Match',
            confidence: 50
          });
        }
      }
    }
    
    return locations;
  }

  private static calculateConfidence(locations: ParameterLocation[]): number {
    if (locations.length === 0) return 0;
    
    let totalConfidence = 0;
    const baseConfidence = 30; // Base confidence for any successful parsing
    
    // Calculate average confidence from individual parameter extractions
    for (const location of locations) {
      totalConfidence += location.confidence;
    }
    
    const avgConfidence = totalConfidence / locations.length;
    
    // Bonus for number of parameters found
    const parameterBonus = Math.min(locations.length * 5, 30);
    
    // Bonus for structured data (high confidence values)
    const structureBonus = avgConfidence > 80 ? 15 : 0;
    
    const finalConfidence = baseConfidence + avgConfidence * 0.4 + parameterBonus + structureBonus;
    
    // Cap at 95%
    return Math.min(95, Math.round(finalConfidence));
  }

  // Enhanced method for handling CSV-like Excel files
  static async parseTableStructure(worksheet: ExcelJS.Worksheet): Promise<{
    headers: string[];
    data: Record<string, CellValue>[];
  }> {
    const headers: string[] = [];
    const data: Record<string, CellValue>[] = [];
    
    // Find the header row (usually first non-empty row)
    let headerRow: ExcelJS.Row | null = null;
    let headerRowNumber = 0;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (!headerRow) {
        headerRow = row;
        headerRowNumber = rowNumber;
        
        // Extract headers
        row.eachCell({ includeEmpty: false }, (cell) => {
          const value = this.getCellDisplayValue(cell);
          headers.push(typeof value === 'string' ? value : String(value || ''));
        });
      } else if (rowNumber > headerRowNumber) {
        // Extract data rows
        const rowData: Record<string, CellValue> = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= headers.length) {
            const header = headers[colNumber - 1];
            rowData[header] = this.getCellDisplayValue(cell);
          }
        });
        data.push(rowData);
      }
    });
    
    return { headers, data };
  }

  // Method to detect and parse different Excel layout types
  static async detectLayoutType(worksheet: ExcelJS.Worksheet): Promise<'key-value' | 'table' | 'mixed'> {
    let keyValuePairs = 0;
    let tableStructure = 0;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      let cellsInRow = 0;
      let hasText = false;
      let hasNumbers = false;
      
      row.eachCell({ includeEmpty: false }, (cell) => {
        cellsInRow++;
        
        const value = this.getCellDisplayValue(cell);
        if (typeof value === 'string') hasText = true;
        if (typeof value === 'number') hasNumbers = true;
      });
      
      // Heuristics for layout detection
      if (cellsInRow === 2 && hasText && hasNumbers) {
        keyValuePairs++;
      } else if (cellsInRow > 2 && rowNumber === 1) {
        tableStructure += 2; // First row with many columns suggests table headers
      } else if (cellsInRow > 2) {
        tableStructure++;
      }
    });
    
    const keyValueRatio = keyValuePairs / Math.max(worksheet.rowCount, 1);
    const tableRatio = tableStructure / Math.max(worksheet.rowCount, 1);
    
    if (keyValueRatio > 0.6) return 'key-value';
    if (tableRatio > 0.6) return 'table';
    return 'mixed';
  }
}
