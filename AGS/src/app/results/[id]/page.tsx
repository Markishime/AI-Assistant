'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Target, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Leaf,
  MapPin,
  Brain,
  Award
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import ScientificReportDisplay from '../../components/ScientificReportDisplay';
import { useAuth } from '../../components/AuthProvider';

interface AnalysisData {
  id: string;
  sample_type: string;
  input_data: any;
  analysis_result: any;
  confidence_score: number;
  risk_level: string;
  processing_time_ms: number;
  created_at: string;
  user_preferences: any;
}

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const analysisId = params.id as string;

  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    if (analysisId) {
      fetchAnalysisData();
    }
  }, [analysisId, user?.id]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyses/${analysisId}?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!analysisData) return;
    
    const resultData = {
      analysis: analysisData,
      timestamp: new Date().toISOString(),
      userId: user?.id
    };

    const dataStr = JSON.stringify(resultData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `analysis-${analysisId}-${Date.now()}.json`;
    link.click();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analysis results...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !analysisData) {
    return (
      <AppLayout>
        <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested analysis could not be found.'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const analysisResult = analysisData.analysis_result || {};
  const inputData = analysisData.input_data || {};

  return (
    <AppLayout>
      <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
                  <p className="text-gray-600">Detailed analysis report</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Analysis Overview */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Overview</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Analysis ID</p>
                    <p className="font-mono text-sm text-gray-900">{analysisId}</p>
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
                    <p className="text-3xl font-bold text-emerald-900">{analysisData.confidence_score}%</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-700">Processing Time</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{Math.round(analysisData.processing_time_ms / 1000)}s</p>
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
                      analysisData.risk_level === 'Low' ? 'text-green-900' :
                      analysisData.risk_level === 'Medium' ? 'text-yellow-900' :
                      analysisData.risk_level === 'High' ? 'text-orange-900' :
                      'text-red-900'
                    }`}>
                      {analysisData.risk_level}
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Sample Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Type:</span>
                        <span className="font-medium text-gray-900 capitalize">{analysisData.sample_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(analysisData.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {inputData.filename && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">File:</span>
                          <span className="font-medium text-gray-900">{inputData.filename}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Analysis Summary
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysisResult.summary || analysisResult.interpretation || 'Analysis completed successfully.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Scientific Report Display */}
              <ScientificReportDisplay 
                analysisResult={{
                  ...analysisResult,
                  riskLevel: (analysisData.risk_level || 'Low') as 'Low' | 'Medium' | 'High' | 'Critical',
                  interpretation: analysisResult.interpretation || analysisResult.summary || 'Analysis completed successfully'
                }}
                sampleType={analysisData.sample_type as 'soil' | 'leaf'}
                extractedData={inputData.extractedValues || {}}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 