'use client';

import { useState } from 'react';
import { AnalysisData } from '@/types';
import { AnalysisResult } from '@/lib/langchain-analyzer';

interface FileUploadProps {
  onUpload: (data: AnalysisData, analysis: AnalysisResult) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sampleType, setSampleType] = useState<'soil' | 'leaf'>('soil');
  const [useEnhancedProcessor, setUseEnhancedProcessor] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (selectedFile) {
      // Auto-detect sample type from filename if possible
      if (selectedFile.name.toLowerCase().includes('soil')) {
        setSampleType('soil');
      } else if (selectedFile.name.toLowerCase().includes('leaf')) {
        setSampleType('leaf');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Check if file type is accepted
      const fileType = droppedFile.type.toLowerCase();
      const fileName = droppedFile.name.toLowerCase();
      
      const isStandardFile = fileType.includes('excel') || fileType.includes('spreadsheet') || 
          fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ||
          fileType.includes('image') || fileName.endsWith('.jpg') || 
          fileName.endsWith('.jpeg') || fileName.endsWith('.png') ||
          fileType.includes('pdf') || fileName.endsWith('.pdf');
          
      const isEnhancedFile = useEnhancedProcessor && (
          fileName.endsWith('.docx') || fileName.endsWith('.doc') ||
          fileName.endsWith('.csv') || fileType.includes('csv') ||
          fileType.includes('word') || fileType.includes('document')
      );
      
      if (isStandardFile || isEnhancedFile) {
        handleFileSelect(droppedFile);
      } else {
        const acceptedTypes = useEnhancedProcessor 
          ? 'Excel (.xlsx, .xls), PDF, Word (.docx), CSV, or Images (.jpg, .png)'
          : 'Excel (.xlsx, .xls), Images (.jpg, .png, .pdf)';
        alert(`Please select a valid file type: ${acceptedTypes}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sampleType', sampleType);
    formData.append('useEnhanced', useEnhancedProcessor.toString());

    try {
      const endpoint = useEnhancedProcessor ? '/api/upload-enhanced' : '/api/upload';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      
      if (result.success) {
        // Pass both the data and analysis to the parent
        onUpload(result.data, result.analysis);
      } else {
        console.error('Upload failed:', result.error);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sample Type</label>
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value as 'soil' | 'leaf')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="soil">Soil</option>
            <option value="leaf">Leaf</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="enhanced-processor"
            checked={useEnhancedProcessor}
            onChange={(e) => setUseEnhancedProcessor(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enhanced-processor" className="text-sm font-medium text-gray-700">
            Use Enhanced Document Processor
          </label>
          <div className="group relative">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full cursor-help">
              ?
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-48 z-10">
              Uses advanced LangChain AI for better extraction from PDF, Word, CSV, and Excel files with structured data recognition.
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload File</label>
          <div 
            className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-white transition-colors cursor-pointer ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-12 w-12 mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className={`text-sm mb-1 ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
              {dragActive ? 'Drop your file here' : 'Click to browse files or drag & drop'}
            </p>
            <p className="text-xs text-gray-500">
              {useEnhancedProcessor 
                ? 'Excel (.xlsx, .xls), PDF, Word (.docx), CSV, or Images (.jpg, .png)'
                : 'Excel (.xlsx, .xls) or Images (.jpg, .png, .pdf)'
              }
            </p>
          </div>
          <input
            id="file-input"
            type="file"
            accept={useEnhancedProcessor 
              ? ".xlsx,.xls,.jpg,.jpeg,.png,.pdf,.docx,.doc,.csv" 
              : ".xlsx,.xls,.jpg,.jpeg,.png,.pdf"
            }
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              if (selectedFile) {
                handleFileSelect(selectedFile);
              }
            }}
            className="hidden"
          />
          {file && (
            <div className="flex items-center mt-2 p-2 bg-blue-50 rounded-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-blue-500 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }} 
                className="ml-auto text-gray-500 hover:text-red-500"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <input
            id="enhanced-processor"
            type="checkbox"
            checked={useEnhancedProcessor}
            onChange={(e) => setUseEnhancedProcessor(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enhanced-processor" className="ml-2 block text-sm text-gray-700">
            Use Enhanced Document Processing
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading & Processing...
            </>
          ) : 'Upload and Analyze'}
        </button>
      </form>
    </div>
  );
}