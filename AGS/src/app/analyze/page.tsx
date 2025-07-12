'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  Loader2,
  ArrowLeft,
  Info,
  Leaf,
  MapPin,
  Camera,
  Download,
  Zap,
  Target,
  BarChart3,
  FileUp,
  X,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Award,
  Globe,
  Activity
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import UserFeedbackSystem from '../components/UserFeedbackSystem';
import ScientificReportDisplay from '../components/ScientificReportDisplay';
import { useAuth } from '../components/AuthProvider';

interface AnalysisResult {
  id: string;
  confidence: number;
  issues: (string | any)[];
  recommendations: (string | {
    recommendation?: string;
    reasoning?: string;
    estimatedImpact?: string;
    priority?: 'High' | 'Medium' | 'Low';
    investmentLevel?: string;
  })[];
  summary: string;
  interpretation?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  processingTime?: number;
  extractedValues?: Record<string, any>;
  isAnonymous?: boolean;
  scientificReferences?: any[];
  ragContext?: any[];
  costBenefitAnalysis?: any;
  sustainabilityMetrics?: any;
  malaysianContextScore?: number;
  scientificRigorScore?: number;
}

export default function AnalyzePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleType, setSampleType] = useState<'soil' | 'leaf'>('soil');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<Record<string, string | number> | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setAnalysisResult(null);
      setExtractedData(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setAnalysisResult(null);
      setExtractedData(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const simulateProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
    return interval;
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('sampleType', sampleType);
      
      // Pass the authenticated user's ID if available, otherwise use 'anonymous'
      const userId = user?.id || 'anonymous';
      formData.append('userId', userId);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Analysis failed. Please try again.');
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Complete progress
      setAnalysisProgress(100);
      
      // Store the complete analysis result
      setAnalysisResult(result);
      
      // Extract data if available
      if (result.extractedValues) {
        setExtractedData(result.extractedValues);
      }

      // Show success message for logged-in users
      if (user?.id && !result.isAnonymous) {
        console.log('Analysis saved to database with ID:', result.id);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const downloadResults = () => {
    if (!analysisResult) return;
    
    const resultData = {
      analysis: analysisResult,
      extractedData: extractedData,
      file: {
        name: selectedFile?.name,
        type: selectedFile?.type,
        size: selectedFile?.size
      },
      sampleType,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous'
    };

    const dataStr = JSON.stringify(resultData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `analysis-results-${Date.now()}.json`;
    link.click();
  };

  const downloadPDF = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create a comprehensive PDF report
      const reportData = {
        title: 'AI Agricultural Analysis Report',
        subtitle: `${sampleType.charAt(0).toUpperCase() + sampleType.slice(1)} Analysis`,
        timestamp: new Date().toLocaleString(),
        fileInfo: {
          name: selectedFile?.name,
          type: selectedFile?.type,
          size: selectedFile?.size
        },
        analysis: analysisResult,
        extractedData: extractedData,
        summary: analysisResult.summary,
        recommendations: analysisResult.recommendations,
        confidence: analysisResult.confidence,
        riskLevel: analysisResult.riskLevel,
        processingTime: analysisResult.processingTime,
        userId: user?.id || 'anonymous'
      };

      // For now, we'll create a JSON file with PDF extension
      // In a real implementation, you'd use a library like jsPDF or html2pdf
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `agricultural-analysis-report-${Date.now()}.pdf`;
      link.click();
      
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setAnalysisResult(null);
    setExtractedData(null);
  };

  return (
    <AppLayout>
      <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        {/* Enhanced Header with Glass Morphism */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                      AI Analysis Lab
                    </h1>
                    <p className="text-gray-600 mt-1">Advanced agricultural intelligence powered by machine learning</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-xl border border-blue-200">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Malaysian Context</span>
                </div>
                {user?.id && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-xl border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Logged In</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Upload & Analysis Section */}
              <div className="lg:col-span-8 space-y-8">
                {/* Enhanced Sample Type Selection */}
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Select Analysis Type</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.button
                      onClick={() => setSampleType('soil')}
                      className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ${
                        sampleType === 'soil' 
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-emerald-300 hover:shadow-md text-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          sampleType === 'soil' 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg' 
                            : 'bg-gray-100 group-hover:bg-emerald-100'
                        }`}>
                          <MapPin className={`w-8 h-8 ${sampleType === 'soil' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg mb-1">Soil Analysis</div>
                          <div className="text-sm opacity-75">Comprehensive soil composition & nutrient testing</div>
                          <div className="text-xs text-emerald-600 mt-2 font-medium">
                            {sampleType === 'soil' ? '✓ Selected' : 'Click to select'}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setSampleType('leaf')}
                      className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ${
                        sampleType === 'leaf' 
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-emerald-300 hover:shadow-md text-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          sampleType === 'leaf' 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg' 
                            : 'bg-gray-100 group-hover:bg-emerald-100'
                        }`}>
                          <Leaf className={`w-8 h-8 ${sampleType === 'leaf' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg mb-1">Leaf Analysis</div>
                          <div className="text-sm opacity-75">Advanced leaf health & disease detection</div>
                          <div className="text-xs text-emerald-600 mt-2 font-medium">
                            {sampleType === 'leaf' ? '✓ Selected' : 'Click to select'}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Enhanced File Upload Section */}
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload Your Data</h2>
                  </div>
                  
                  {!selectedFile ? (
                    <motion.div
                      className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-emerald-500 transition-all duration-500 cursor-pointer group"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-xl font-semibold text-gray-700">Drop your file here or click to browse</p>
                        <p className="text-gray-500">Supports: Images (JPG, PNG), Excel files (XLSX, CSV), PDF documents</p>
                        <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
                        {!user?.id && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              💡 <strong>Tip:</strong> Sign in to save your analysis results and view them in your dashboard!
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            {selectedFile.type.startsWith('image/') ? (
                              <Camera className="w-8 h-8 text-white" />
                            ) : (
                              <FileText className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.xlsx,.csv,.pdf"
                    className="hidden"
                  />

                  {error && (
                    <motion.div
                      className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <span className="text-red-700 font-medium">{error}</span>
                    </motion.div>
                  )}

                  {/* Enhanced Analysis Button */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <motion.button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || isAnalyzing}
                      className="flex-1 flex items-center justify-center space-x-3 py-4 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-6 h-6" />
                          <span>Start AI Analysis</span>
                        </>
                      )}
                    </motion.button>
                    
                    {analysisResult && (
                      <>
                        <motion.button
                          onClick={downloadResults}
                          className="flex items-center justify-center space-x-3 py-4 px-6 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Download className="w-5 h-5" />
                          <span>Download JSON</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={downloadPDF}
                          disabled={isGeneratingPDF}
                          className="flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isGeneratingPDF ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Generating PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Enhanced Progress Bar */}
                  {isAnalyzing && (
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex justify-between text-sm text-gray-600 mb-3">
                        <span className="font-medium">Processing your data with AI...</span>
                        <span className="font-bold text-emerald-600">{Math.round(analysisProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Analysis Results */}
                <AnimatePresence>
                  {analysisResult && (
                    <motion.div
                      className="space-y-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6 }}
                    >
                      {/* Enhanced Results Header */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-medium">Confidence:</span>
                            <span className="font-bold text-2xl text-emerald-600">{analysisResult.confidence}%</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <motion.div 
                            className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Target className="w-6 h-6 text-emerald-600" />
                              <span className="font-semibold text-emerald-700">Confidence Score</span>
                            </div>
                            <p className="text-3xl font-bold text-emerald-900">{analysisResult.confidence}%</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Clock className="w-6 h-6 text-blue-600" />
                              <span className="font-semibold text-blue-700">Processing Time</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-900">{analysisResult.processingTime || 2.5}s</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Shield className="w-6 h-6 text-purple-600" />
                              <span className="font-semibold text-purple-700">Risk Level</span>
                            </div>
                            <p className={`text-3xl font-bold ${
                              analysisResult.riskLevel === 'Low' ? 'text-green-900' :
                              analysisResult.riskLevel === 'Medium' ? 'text-yellow-900' :
                              analysisResult.riskLevel === 'High' ? 'text-orange-900' :
                              'text-red-900'
                            }`}>
                              {analysisResult.riskLevel || 'Low'}
                            </p>
                          </motion.div>
                        </div>

                        {analysisResult.summary && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Summary</h3>
                            <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                          </div>
                        )}

                        {/* Show storage status for logged-in users */}
                        {user?.id && !analysisResult.isAnonymous && (
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div>
                              <p className="text-green-700 font-medium">Analysis saved to your dashboard</p>
                              <p className="text-green-600 text-sm">You can view this analysis in your recent analyses section</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scientific Report Display */}
                      <ScientificReportDisplay 
                        analysisResult={{
                          ...analysisResult,
                          riskLevel: (analysisResult.riskLevel || 'Low') as 'Low' | 'Medium' | 'High' | 'Critical',
                          interpretation: analysisResult.interpretation || analysisResult.summary || 'Analysis completed successfully'
                        }}
                        sampleType={sampleType}
                        extractedData={extractedData || {}}
                      />

                      {/* User Feedback System */}
                      <UserFeedbackSystem 
                        analysisId={analysisResult.id}
                        recommendations={analysisResult.recommendations
                          .filter(r => typeof r === 'object' && r !== null && 'recommendation' in r)
                          .map((r: any, index) => ({
                            id: `rec-${index}`,
                            recommendation: r.recommendation || '',
                            reasoning: r.reasoning,
                            estimatedImpact: r.estimatedImpact,
                            priority: r.priority,
                            investmentLevel: r.investmentLevel,
                            category: r.category
                          }))
                        }
                        onFeedbackSubmit={(feedback) => console.log('Feedback submitted:', feedback)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Sidebar Information */}
              <div className="lg:col-span-4 space-y-6">
                {/* Enhanced Info Panel */}
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">How It Works</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-white">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">Choose Analysis Type</p>
                        <p className="text-sm text-gray-600">Select soil or leaf analysis based on your needs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">Upload Your Data</p>
                        <p className="text-sm text-gray-600">Upload images, Excel files, or PDF reports</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-white">3</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">Get AI Insights</p>
                        <p className="text-sm text-gray-600">Receive detailed analysis and recommendations</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Supported Formats */}
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Supported Formats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <Camera className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Images</p>
                        <p className="text-sm text-gray-600">JPG, PNG (max 10MB)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl border border-green-200">
                      <FileUp className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Spreadsheets</p>
                        <p className="text-sm text-gray-600">XLSX, CSV files</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Documents</p>
                        <p className="text-sm text-gray-600">PDF reports</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Tips */}
                <motion.div
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-6 shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">💡 Pro Tips</h3>
                  </div>
                  
                  <ul className="space-y-4 text-sm text-emerald-800">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Use high-resolution images for better analysis accuracy</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Include location and date information when possible</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Multiple samples provide more comprehensive insights</span>
                    </li>
                    {!user?.id && (
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Sign in to save your analysis history and track progress</span>
                      </li>
                    )}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 