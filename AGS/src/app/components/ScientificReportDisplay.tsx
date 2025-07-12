'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  BarChart3, 
  Microscope, 
  Globe, 
  Clock, 
  Users,
  Download,
  ExternalLink,
  BookOpen,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';

interface ScientificReference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  relevanceScore: number;
  summary: string;
  keyFindings: string[];
  applicationToAnalysis: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  malaysianContext?: boolean;
  peerReviewed?: boolean;
}

interface RAGContext {
  content: string;
  relevance: number;
  confidence: number;
  source: string;
  malaysianContextScore: number;
  scientificRigor: number;
}

interface CostBenefitAnalysis {
  totalInvestment: number;
  expectedReturns: number;
  paybackPeriod: string;
  riskFactors: string[];
  economicImpact: string;
}

interface SustainabilityMetrics {
  carbonFootprint: string;
  rspoCompliance: string;
  environmentalImpact: string;
  socialImpact: string;
  biodiversityScore: number;
}

interface AnalysisResult {
  id: string;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  interpretation: string;
  issues: (string | { description?: string; severity?: 'high' | 'medium' | 'low'; [key: string]: any })[];
  recommendations: any[];
  extractedValues?: Record<string, any>;
  scientificReferences?: ScientificReference[];
  ragContext?: RAGContext[];
  costBenefitAnalysis?: CostBenefitAnalysis;
  sustainabilityMetrics?: SustainabilityMetrics;
  processingTime?: number;
  malaysianContextScore?: number;
  scientificRigorScore?: number;
}

interface ScientificReportDisplayProps {
  analysisResult: AnalysisResult;
  sampleType: 'soil' | 'leaf';
  extractedData?: Record<string, any>;
  onExport?: () => void;
}

export default function ScientificReportDisplay({
  analysisResult,
  sampleType,
  extractedData,
  onExport
}: ScientificReportDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive']));
  const [selectedReference, setSelectedReference] = useState<ScientificReference | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-blue-600 bg-blue-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Scientific Analysis Report</h1>
              <p className="text-blue-100 text-lg">
                {sampleType === 'soil' ? 'Soil Analysis' : 'Leaf Analysis'} • 
                Malaysian Oil Palm Cultivation
              </p>
              <div className="flex items-center space-x-6 mt-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                  Confidence: {analysisResult.confidence}%
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysisResult.riskLevel)}`}>
                  Risk Level: {analysisResult.riskLevel}
                </div>
                {analysisResult.malaysianContextScore && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Malaysian Context: {Math.round(analysisResult.malaysianContextScore * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Executive Summary */}
      <ReportSection
        id="executive"
        title="Executive Summary"
        icon={Award}
        expanded={expandedSections.has('executive')}
        onToggle={() => toggleSection('executive')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                {analysisResult.interpretation}
              </p>
            </div>
            {analysisResult.processingTime && (
              <div className="mt-4 text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-2" />
                Analysis completed in {(analysisResult.processingTime / 1000).toFixed(1)} seconds
              </div>
            )}
          </div>
          <div className="space-y-4">
            <MetricCard
              title="Analysis Confidence"
              value={`${analysisResult.confidence}%`}
              color={getConfidenceColor(analysisResult.confidence)}
              icon={Target}
            />
            <MetricCard
              title="Risk Assessment"
              value={analysisResult.riskLevel}
              color={getRiskColor(analysisResult.riskLevel)}
              icon={Shield}
            />
            {analysisResult.scientificRigorScore && (
              <MetricCard
                title="Scientific Rigor"
                value={`${Math.round(analysisResult.scientificRigorScore * 100)}%`}
                color="text-purple-600 bg-purple-100"
                icon={Microscope}
              />
            )}
          </div>
        </div>
      </ReportSection>

      {/* Extracted Data */}
      {extractedData && Object.keys(extractedData).length > 0 && (
        <ReportSection
          id="data"
          title="Laboratory Data Analysis"
          icon={BarChart3}
          expanded={expandedSections.has('data')}
          onToggle={() => toggleSection('data')}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(extractedData).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
              >
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: typeof value === 'number' ? `${Math.min((value / 100) * 100, 100)}%` : '50%' 
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Issues & Findings */}
      {analysisResult.issues && analysisResult.issues.length > 0 && (
        <ReportSection
          id="issues"
          title="Key Findings & Issues"
          icon={AlertTriangle}
          expanded={expandedSections.has('issues')}
          onToggle={() => toggleSection('issues')}
          urgency="high"
        >
          <div className="space-y-4">
            {analysisResult.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-orange-50 border border-orange-200 rounded-xl"
              >
                <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    {typeof issue === 'string' ? issue : (issue as any).description || 'Issue identified'}
                  </p>
                  {typeof issue === 'object' && (issue as any).severity && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      (issue as any).severity === 'high' ? 'bg-red-100 text-red-800' :
                      (issue as any).severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {(issue as any).severity} severity
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Recommendations */}
      {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
        <ReportSection
          id="recommendations"
          title="Evidence-Based Recommendations"
          icon={Lightbulb}
          expanded={expandedSections.has('recommendations')}
          onToggle={() => toggleSection('recommendations')}
        >
          <div className="space-y-6">
            {analysisResult.recommendations.map((rec, index) => {
              const recommendation = typeof rec === 'string' ? { recommendation: rec, priority: 'Medium' } : rec;
              return (
                <RecommendationCard
                  key={index}
                  recommendation={recommendation}
                  index={index}
                />
              );
            })}
          </div>
        </ReportSection>
      )}

      {/* RAG Evidence */}
      {analysisResult.ragContext && analysisResult.ragContext.length > 0 && (
        <ReportSection
          id="evidence"
          title="Supporting Evidence & Knowledge Base"
          icon={BookOpen}
          expanded={expandedSections.has('evidence')}
          onToggle={() => toggleSection('evidence')}
        >
          <div className="space-y-4">
            {analysisResult.ragContext.map((context, index) => (
              <EvidenceCard
                key={index}
                context={context}
                index={index}
              />
            ))}
          </div>
        </ReportSection>
      )}

      {/* Scientific References */}
      {analysisResult.scientificReferences && analysisResult.scientificReferences.length > 0 && (
        <ReportSection
          id="references"
          title="Scientific References"
          icon={Microscope}
          expanded={expandedSections.has('references')}
          onToggle={() => toggleSection('references')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisResult.scientificReferences.map((ref, index) => (
              <ReferenceCard
                key={ref.id}
                reference={ref}
                onClick={() => setSelectedReference(ref)}
              />
            ))}
          </div>
        </ReportSection>
      )}

      {/* Cost-Benefit Analysis */}
      {analysisResult.costBenefitAnalysis && (
        <ReportSection
          id="cost-benefit"
          title="Economic Impact Analysis"
          icon={DollarSign}
          expanded={expandedSections.has('cost-benefit')}
          onToggle={() => toggleSection('cost-benefit')}
        >
          <CostBenefitDisplay analysis={analysisResult.costBenefitAnalysis} />
        </ReportSection>
      )}

      {/* Sustainability Metrics */}
      {analysisResult.sustainabilityMetrics && (
        <ReportSection
          id="sustainability"
          title="Sustainability Impact"
          icon={Leaf}
          expanded={expandedSections.has('sustainability')}
          onToggle={() => toggleSection('sustainability')}
        >
          <SustainabilityDisplay metrics={analysisResult.sustainabilityMetrics} />
        </ReportSection>
      )}

      {/* Reference Modal */}
      <AnimatePresence>
        {selectedReference && (
          <ReferenceModal
            reference={selectedReference}
            onClose={() => setSelectedReference(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
interface ReportSectionProps {
  id: string;
  title: string;
  icon: any;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  urgency?: 'low' | 'medium' | 'high';
}

function ReportSection({ id, title, icon: Icon, children, expanded, onToggle, urgency }: ReportSectionProps) {
  const urgencyColors = {
    low: 'border-green-200 bg-green-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-red-200 bg-red-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border shadow-lg ${
        urgency ? urgencyColors[urgency] : 'border-white/20'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        {expanded ? (
          <ChevronDown className="w-6 h-6 text-gray-600" />
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-600" />
        )}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricCard({ title, value, color, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {value}
        </span>
      </div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
    </div>
  );
}

function RecommendationCard({ recommendation, index }: any) {
  const priorityColors = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-bold text-lg text-gray-900 flex-1">
          {recommendation.recommendation}
        </h4>
        {recommendation.priority && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
            (priorityColors as any)[recommendation.priority] || priorityColors.Medium
          }`}>
            {recommendation.priority} Priority
          </span>
        )}
      </div>
      
      {recommendation.reasoning && (
        <div className="mb-4">
          <h5 className="font-semibold text-gray-800 mb-2">Scientific Rationale:</h5>
          <p className="text-gray-700">{recommendation.reasoning}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendation.estimatedImpact && (
          <div className="bg-white/50 rounded-lg p-3">
            <h6 className="font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Expected Impact:
            </h6>
            <p className="text-gray-700">{recommendation.estimatedImpact}</p>
          </div>
        )}
        {recommendation.investmentLevel && (
          <div className="bg-white/50 rounded-lg p-3">
            <h6 className="font-semibold text-gray-800 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Investment Level:
            </h6>
            <p className="text-gray-700">{recommendation.investmentLevel}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EvidenceCard({ context, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-blue-50 border border-blue-200 rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-semibold text-gray-900">
          {context.source}
        </h5>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Relevance: {Math.round(context.relevance * 100)}%
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Malaysian Context: {Math.round(context.malaysianContextScore * 100)}%
          </span>
        </div>
      </div>
      <p className="text-gray-700 text-sm">{context.content}</p>
    </motion.div>
  );
}

function ReferenceCard({ reference, onClick }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {reference.title}
        </h5>
        <div className="flex items-center space-x-1">
          {reference.malaysianContext && (
            <span className="w-2 h-2 bg-green-500 rounded-full" title="Malaysian Context" />
          )}
          {reference.peerReviewed && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Peer Reviewed" />
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2">
        {reference.authors.slice(0, 2).join(', ')}
        {reference.authors.length > 2 && ' et al.'} ({reference.year})
      </p>
      <p className="text-xs text-gray-700 mb-3 line-clamp-2">
        {reference.summary}
      </p>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs ${
          reference.confidenceLevel === 'High' ? 'bg-green-100 text-green-800' :
          reference.confidenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {reference.confidenceLevel} Confidence
        </span>
        <span className="text-xs text-gray-500">
          Relevance: {Math.round(reference.relevanceScore * 100)}%
        </span>
      </div>
    </motion.div>
  );
}

function ReferenceModal({ reference, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{reference.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Authors & Publication</h4>
            <p className="text-gray-700">
              {reference.authors.join(', ')} ({reference.year})
            </p>
            <p className="text-gray-600 italic">{reference.journal}</p>
            {reference.doi && (
              <p className="text-blue-600">DOI: {reference.doi}</p>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700">{reference.summary}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
            <ul className="space-y-1">
              {reference.keyFindings.map((finding: string, index: number) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Application to Analysis</h4>
            <p className="text-gray-700">{reference.applicationToAnalysis}</p>
          </div>
          
          {reference.url && (
            <div className="pt-4 border-t">
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Paper
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CostBenefitDisplay({ analysis }: { analysis: CostBenefitAnalysis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Total Investment</h4>
        <p className="text-2xl font-bold text-blue-600">
          RM {analysis.totalInvestment.toLocaleString()}
        </p>
      </div>
      <div className="bg-green-50 rounded-xl p-4">
        <h4 className="font-semibold text-green-900 mb-2">Expected Returns</h4>
        <p className="text-2xl font-bold text-green-600">
          RM {analysis.expectedReturns.toLocaleString()}
        </p>
      </div>
      <div className="bg-purple-50 rounded-xl p-4">
        <h4 className="font-semibold text-purple-900 mb-2">Payback Period</h4>
        <p className="text-2xl font-bold text-purple-600">
          {analysis.paybackPeriod}
        </p>
      </div>
      <div className="bg-orange-50 rounded-xl p-4">
        <h4 className="font-semibold text-orange-900 mb-2">ROI</h4>
        <p className="text-2xl font-bold text-orange-600">
          {Math.round(((analysis.expectedReturns - analysis.totalInvestment) / analysis.totalInvestment) * 100)}%
        </p>
      </div>
    </div>
  );
}

function SustainabilityDisplay({ metrics }: { metrics: SustainabilityMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
            <Leaf className="w-5 h-5 mr-2" />
            Environmental Impact
          </h4>
          <p className="text-green-700">{metrics.environmentalImpact}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Social Impact
          </h4>
          <p className="text-blue-700">{metrics.socialImpact}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <h5 className="font-semibold text-gray-900 mb-2">Carbon Footprint</h5>
          <p className="text-lg text-gray-700">{metrics.carbonFootprint}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <h5 className="font-semibold text-yellow-900 mb-2">RSPO Compliance</h5>
          <p className="text-lg text-yellow-700">{metrics.rspoCompliance}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <h5 className="font-semibold text-green-900 mb-2">Biodiversity Score</h5>
          <p className="text-lg text-green-700">{metrics.biodiversityScore}/100</p>
        </div>
      </div>
    </div>
  );
} 