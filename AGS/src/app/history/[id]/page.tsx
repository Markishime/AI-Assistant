'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../components/AuthProvider';
import AppLayout from '../../components/AppLayout';
import { 
  ArrowLeft,
  Calendar,
  Target,
  Gauge,
  MapPin,
  Clock,
  Download,
  Share2,
  TestTube,
  Leaf,
  BarChart3,
  Activity,
  Award,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Database,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  AlertCircle,
  ExternalLink,
  Star
} from 'lucide-react';

interface AnalysisDetail {
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

interface ProcessedAnalysis {
  id: string;
  title: string;
  type: string;
  confidence: number;
  riskLevel: string;
  date: string;
  processingTime: number;
  inputData: any;
  analysisResult: any;
  recommendations: string[];
  insights: string[];
  summary: string;
  methodology: string;
  scientificReferences: string[];
  ragSources: any[];
  qualityMetrics: any;
  improvements: string[];
}

export default function AnalysisDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<ProcessedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analysis details
  const fetchAnalysisDetail = useCallback(async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analyses/${id}?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis');
      }

      // Process the raw analysis data
      const processedAnalysis: ProcessedAnalysis = {
        id: data.id,
        title: data.analysis_result?.title || `${data.sample_type} Analysis`,
        type: data.sample_type || 'unknown',
        confidence: data.confidence_score || 0,
        riskLevel: data.risk_level || 'Medium',
        date: new Date(data.created_at).toLocaleDateString(),
        processingTime: Math.round((data.processing_time_ms || 0) / 1000),
        inputData: data.input_data || {},
        analysisResult: data.analysis_result || {},
        recommendations: data.analysis_result?.recommendations || [],
        insights: data.analysis_result?.insights || [],
        summary: data.analysis_result?.summary || 'No summary available',
        methodology: data.analysis_result?.methodology || 'Standard analysis protocol',
        scientificReferences: data.analysis_result?.scientificReferences || [],
        ragSources: data.analysis_result?.ragSources || [],
        qualityMetrics: data.analysis_result?.qualityMetrics || {},
        improvements: data.analysis_result?.improvements || []
      };

      setAnalysis(processedAnalysis);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  const handleDownload = useCallback(() => {
    if (!analysis) return;
    
    const report = {
      ...analysis,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email || 'Unknown'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id}-${analysis.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysis, user]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Analysis link copied to clipboard!');
    });
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'soil': return TestTube;
      case 'nutrient': return Leaf;
      case 'yield': return TrendingUp;
      case 'disease': return AlertTriangle;
      case 'sustainability': return Award;
      case 'comprehensive': return BarChart3;
      default: return Activity;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle },
    { id: 'methodology', label: 'Methodology', icon: Database },
    { id: 'references', label: 'References', icon: FileText }
  ];

  useEffect(() => {
    if (user) {
      fetchAnalysisDetail();
    }
  }, [user, fetchAnalysisDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analysis</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/history')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to History
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading analysis details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!analysis) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">The requested analysis could not be found.</p>
            <button
              onClick={() => router.push('/history')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to History
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const TypeIcon = getTypeIcon(analysis.type);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/history')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl ${getRiskColor(analysis.riskLevel)} flex items-center justify-center`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{analysis.title}</h1>
                    <p className="text-gray-600">{analysis.type} analysis • {analysis.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel} Risk
                </span>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/70 rounded-lg p-4 text-center border border-gray-200">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{analysis.confidence}%</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border border-gray-200">
                <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{analysis.processingTime}s</div>
                <div className="text-xs text-gray-600">Processing Time</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border border-gray-200">
                <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{analysis.recommendations.length}</div>
                <div className="text-xs text-gray-600">Recommendations</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border border-gray-200">
                <Database className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{analysis.ragSources.length}</div>
                <div className="text-xs text-gray-600">RAG Sources</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border border-gray-200">
                <FileText className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{analysis.scientificReferences.length}</div>
                <div className="text-xs text-gray-600">References</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Key Insights */}
                {analysis.insights.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h2>
                    <div className="grid gap-4">
                      {analysis.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Data */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Data</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 overflow-auto">
                      {JSON.stringify(analysis.inputData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 overflow-auto">
                      {JSON.stringify(analysis.analysisResult, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Quality Metrics */}
                {Object.keys(analysis.qualityMetrics).length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analysis.qualityMetrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                          <p className="text-2xl font-bold text-blue-600">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Actionable Recommendations</h2>
                  {analysis.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800">{recommendation}</p>
                          </div>
                          <button className="text-green-600 hover:text-green-700">
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specific recommendations available for this analysis.</p>
                  )}
                </div>

                {/* Improvements */}
                {analysis.improvements.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Potential Improvements</h2>
                    <div className="space-y-3">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <p className="text-gray-700">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'methodology' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Methodology</h2>
                  <p className="text-gray-700 leading-relaxed">{analysis.methodology}</p>
                </div>

                {/* RAG Sources */}
                {analysis.ragSources.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Sources</h2>
                    <div className="space-y-3">
                      {analysis.ragSources.map((source, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                          <Database className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800">{String(source)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'references' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Scientific References</h2>
                  {analysis.scientificReferences.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.scientificReferences.map((reference, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800">{reference}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No scientific references available for this analysis.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
} 