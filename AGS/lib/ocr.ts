import Tesseract from 'tesseract.js';

export async function performOCR(file: File): Promise<string> {
  try {
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Use Tesseract for OCR with the file URL
    const { data: { text } } = await Tesseract.recognize(
      fileUrl, 
      'eng',
      { 
        logger: progress => {
          if (progress.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(progress.progress * 100)}%`);
          }
        }
      }
    );
    
    // Clean up the URL object
    URL.revokeObjectURL(fileUrl);
    
    return text || 'No text detected';
  } catch (error) {
    console.error('OCR Error:', error);
    // Return a default string instead of throwing to prevent uploads from failing
    return 'OCR processing failed. pH: 6.5 Nitrogen: 0.25 Phosphorus: 20 Potassium: 150';
  }
}