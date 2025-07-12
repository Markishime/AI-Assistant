'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';
import { 
  History,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Leaf,
  TestTube,
  Eye,
  Download,
  Star,
  Activity,
  Award,
  Gauge,
  Loader2,
  AlertCircle,
  FileText,
  Database,
  Zap,
  Shield,
  Globe,
  Users,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import { getSupabaseClient } from '../components/AuthProvider';

interface AnalysisReport {
  id: string;
  user_id: string;
  sample_type: 'soil' | 'leaf';
  file_names: string[];
  file_sizes: number[];
  input_data: any;
  analysis_result: {
    interpretation: string;
    issues: string[];
    improvementPlan: Array<{
      recommendation: string;
      reasoning: string;
      estimatedImpact: string;
      priority: 'High' | 'Medium' | 'Low';
      investmentLevel?: 'High' | 'Medium' | 'Low';
      implementationSteps?: string;
      sustainabilityBenefits?: string;
      costBenefit?: string;
      potentialImprovement?: string;
    }>;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    confidenceScore: number;
    nutrientBalance?: {
      ratios: Record<string, number>;
      imbalances: string[];
      criticalDeficiencies: string[];
      antagonisms: string[];
    };
    yieldForecast?: {
      highInvestment: number[];
      mediumInvestment: number[];
      lowInvestment: number[];
      baseline: number[];
      benchmarkComparison: {
        malaysiaAverage: number;
        regionalAverage: number;
        potentialImprovement: string;
      };
    };
    regionalBenchmarking?: {
      currentYieldVsBenchmark: string;
      potentialImprovement: string;
      rankingPercentile: number;
    };
    sustainabilityMetrics?: {
      carbonSequestrationPotential: string;
      rspoCompliance: string;
      environmentalImpact: string;
    };
    ragContext?: Array<{
      source: string;
      content: string;
      relevance: number;
    }>;
    scientificReferences?: Array<{
      title: string;
      authors: string[];
      journal?: string;
      year?: number;
      doi?: string;
      summary: string;
    }>;
    metadata?: Record<string, unknown>;
  };
  user_preferences: any;
  confidence_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  processing_method: string;
  processing_time_ms: number;
  created_at: string;
  land_size?: number;
  historical_yield?: number[];
}

// Enhanced skeleton component
const HistorySkeleton = React.memo(() => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="w-16 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
));

// Enhanced timeline item component
const TimelineItem = React.memo(({
  report,
  isLast,
  onView,
  onDownload
}: {
  report: AnalysisReport;
  isLast: boolean;
  onView: (report: AnalysisReport) => void;
  onDownload: (report: AnalysisReport) => void;
}) => {
  const getRiskColor = useCallback((risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-orange-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case 'soil': return TestTube;
      case 'leaf': return Leaf;
      default: return Activity;
    }
  }, []);

  const TypeIcon = getTypeIcon(report.sample_type);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const processingTimeSeconds = Math.round((report.processing_time_ms || 0) / 1000);
  const improvementCount = report.analysis_result.improvementPlan?.length || 0;
  const issueCount = report.analysis_result.issues?.length || 0;
  const ragSourceCount = report.analysis_result.ragContext?.length || 0;
  const scientificRefCount = report.analysis_result.scientificReferences?.length || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
      )}
      
      {/* Timeline Node */}
      <div className="flex items-start space-x-6">
        <div className={`w-12 h-12 rounded-full ${getRiskColor(report.risk_level)} flex items-center justify-center text-white shadow-lg`}>
          <TypeIcon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.sample_type.charAt(0).toUpperCase() + report.sample_type.slice(1)} Analysis
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(report.risk_level)}`}>
                  {report.risk_level} Risk
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {report.processing_method || 'Standard'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  <span className={getConfidenceColor(report.confidence_score)}>
                    {report.confidence_score}% confidence
                  </span>
                </span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  {processingTimeSeconds}s processing
                </span>
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {report.file_names.length} file{report.file_names.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Enhanced Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-700">{improvementCount}</div>
                  <div className="text-xs text-green-600 font-medium">Recommendations</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-700">{issueCount}</div>
                  <div className="text-xs text-red-600 font-medium">Issues Identified</div>
                </div>
                {ragSourceCount > 0 && (
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-700">{ragSourceCount}</div>
                    <div className="text-xs text-blue-600 font-medium">RAG Sources</div>
                  </div>
                )}
                {scientificRefCount > 0 && (
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="text-lg font-bold text-purple-700">{scientificRefCount}</div>
                    <div className="text-xs text-purple-600 font-medium">Scientific Refs</div>
                  </div>
                )}
              </div>

              {/* File Information */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Uploaded Files</span>
                </div>
                <div className="space-y-1">
                  {report.file_names.map((fileName, index) => (
                    <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate flex-1">{fileName}</span>
                      <span className="ml-2 text-gray-500">{formatFileSize(report.file_sizes[index] || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Summary */}
              {report.analysis_result.interpretation && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-800 mb-1">Analysis Summary</div>
                      <div className="text-sm text-blue-700 line-clamp-2">
                        {report.analysis_result.interpretation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onView(report)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Report</span>
                </button>
                <button
                  onClick={() => onDownload(report)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                {report.land_size && (
                  <div className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg">
                    <Globe className="w-4 h-4" />
                    <span>{report.land_size} ha</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasInitialized = useRef(false);
  
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch analysis reports from database - only once on mount
  const fetchReports = useCallback(async () => {
    if (!user || hasInitialized.current) return;
    
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('analysis_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analysis reports:', error);
        return;
      }

      setReports(data || []);
      hasInitialized.current = true;
    } catch (error) {
      console.error('Error fetching analysis reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load reports only once on component mount
  useEffect(() => {
    if (!loading && user && !hasInitialized.current) {
      fetchReports();
    }
  }, [loading, user, fetchReports]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = report.sample_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.analysis_result.interpretation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.file_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || report.sample_type === selectedType;
      const matchesRisk = selectedRisk === 'all' || report.risk_level === selectedRisk;
      
      return matchesSearch && matchesType && matchesRisk;
    });

    // Sort reports
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'confidence':
        filtered.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
        break;
      case 'risk':
        const riskOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        filtered.sort((a, b) => (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0));
        break;
      case 'processing_time':
        filtered.sort((a, b) => (b.processing_time_ms || 0) - (a.processing_time_ms || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [reports, searchTerm, selectedType, selectedRisk, sortBy]);

  const handleView = (report: AnalysisReport) => {
    router.push(`/results/${report.id}`);
  };

  const handleDownload = (report: AnalysisReport) => {
    // Create and download analysis report as JSON
    const reportData = {
      id: report.id,
      sample_type: report.sample_type,
      created_at: report.created_at,
      confidence_score: report.confidence_score,
      risk_level: report.risk_level,
      processing_time_ms: report.processing_time_ms,
      file_names: report.file_names,
      analysis_result: report.analysis_result,
      user_preferences: report.user_preferences
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.sample_type}_analysis_${report.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    hasInitialized.current = false;
    fetchReports();
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const soilAnalyses = reports.filter(r => r.sample_type === 'soil').length;
    const leafAnalyses = reports.filter(r => r.sample_type === 'leaf').length;
    const avgConfidence = total > 0 
      ? Math.round(reports.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / total)
      : 0;
    const avgProcessingTime = total > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / total / 1000)
      : 0;
    const criticalRisk = reports.filter(r => r.risk_level === 'Critical').length;
    const highRisk = reports.filter(r => r.risk_level === 'High').length;
    const totalRisk = criticalRisk + highRisk;

    return {
      total,
      soilAnalyses,
      leafAnalyses,
      avgConfidence,
      avgProcessingTime,
      totalRisk,
      criticalRisk,
      highRisk
    };
  }, [reports]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <HistorySkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Reports</h1>
                <p className="text-gray-600">Comprehensive view of your agricultural analysis history</p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <History className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgConfidence}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}s</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRisk}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TestTube className="w-6 h-6 text-blue-500" />
                    <span className="ml-2 text-sm font-medium text-gray-700">Soil Analyses</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{stats.soilAnalyses}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Leaf className="w-6 h-6 text-green-500" />
                    <span className="ml-2 text-sm font-medium text-gray-700">Leaf Analyses</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.leafAnalyses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reports, files, or analysis content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="soil">Soil Analysis</option>
                  <option value="leaf">Leaf Analysis</option>
                </select>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Critical">Critical Risk</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="confidence">Highest Confidence</option>
                  <option value="risk">Risk Level</option>
                  <option value="processing_time">Processing Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <HistorySkeleton key={i} />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis reports found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedType !== 'all' || selectedRisk !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start your first analysis to see reports here'}
              </p>
              {!searchTerm && selectedType === 'all' && selectedRisk === 'all' && (
                <button
                  onClick={() => router.push('/analyze')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mx-auto"
                >
                  <Activity className="w-4 h-4" />
                  Start Analysis
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredReports.map((report, index) => (
                  <TimelineItem
                    key={report.id}
                    report={report}
                    isLast={index === filteredReports.length - 1}
                    onView={handleView}
                    onDownload={handleDownload}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
