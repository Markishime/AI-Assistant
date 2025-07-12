'use client';

import { AnalysisReport } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Download,
  Share2,
  Star,
  Calendar,
  MapPin,
  Beaker,
  Leaf,
  BarChart3,
  Target,
  DollarSign,
  Clock,
  Award,
  Cloud
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReportDisplayProps {
  report: AnalysisReport | null;
  scientificReferences?: ScientificReference[];
  ragContext?: RAGContext[];
}

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
}

interface RAGContext {
  id: string;
  source: string;
  content: string;
  relevanceScore: number;
  documentType: 'research_paper' | 'best_practice' | 'guideline' | 'case_study';
  keywords: string[];
}

// Predictive Insights Section
function PredictiveInsightsSection({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/predictive-insights?userId=${userId}`);
        const data = await res.json();
        setInsights(data.insights || []);
      } catch (e) {
        setInsights([]);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchInsights();
  }, [userId]);

  if (loading) return <div className="text-gray-500">Loading predictive insights...</div>;
  if (!insights.length) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800/50 mt-8">
      <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" /> Predictive Insights
      </h3>
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={insight.id} className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-orange-100 dark:border-orange-800/30">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${insight.impact === 'positive' ? 'text-green-600' : insight.impact === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>{insight.title}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 ml-2">{insight.type}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 ml-2">{insight.confidence}% confidence</span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 mb-2">{insight.description}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {insight.recommendations?.map((rec: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">{rec}</span>
              ))}
            </div>
            <div className="text-xs text-gray-500">Timeframe: {insight.timeframe} | Last updated: {new Date(insight.lastUpdated).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// User Feedback Section
function UserFeedbackSection({ reportId }: { reportId: string }) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    setLoading(true);
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, rating, comment })
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return <div className="text-green-600 font-semibold mt-4">Thank you for your feedback!</div>;

  return (
    <div className="mt-8 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800/50">
      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Your Feedback</h3>
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => setRating(star)} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            <Star className="w-6 h-6" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating ? `${rating} / 5` : 'Rate this analysis'}</span>
      </div>
      <textarea
        className="w-full p-2 border border-gray-200 rounded mb-2"
        rows={3}
        placeholder="Additional comments (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button
        onClick={submitFeedback}
        disabled={loading || !rating}
        className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}

function RealTimeDataInfoBox() {
  const [weather, setWeather] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const w = await fetch('/api/realtime/weather');
        const wData = await w.json();
        setWeather(wData.weather?.current_weather || null);
        const m = await fetch('/api/realtime/market');
        const mData = await m.json();
        setMarket(mData);
      } catch (e) {
        setWeather(null);
        setMarket(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="mb-6"><div className="bg-white rounded-xl p-4 shadow border text-gray-500">Loading real-time data...</div></div>;
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1"><Cloud className="w-5 h-5 text-blue-500" /><span className="font-semibold text-blue-800">Current Weather</span></div>
        {weather ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Temp: <b>{weather.temperature}°C</b></span>
            <span>Humidity: <b>{weather.relative_humidity_2m ?? '-'}%</b></span>
            <span>Rainfall: <b>{weather.precipitation ?? '-'} mm</b></span>
            <span>Wind: <b>{weather.windspeed ?? '-'} km/h</b></span>
          </div>
        ) : <span className="text-gray-500">No data</span>}
      </div>
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-5 h-5 text-yellow-600" /><span className="font-semibold text-yellow-800">Palm Oil Market</span></div>
        {market ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Price: <b>{market.price} {market.currency}/{market.unit}</b></span>
            <span>Trend: <b className={market.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{market.trend === 'up' ? '↑ Up' : '↓ Down'}</b></span>
            <span>Last Updated: <b>{new Date(market.lastUpdated).toLocaleTimeString()}</b></span>
          </div>
        ) : <span className="text-gray-500">No data</span>}
      </div>
    </div>
  );
}

export default function ReportDisplay({ report, scientificReferences = [], ragContext = [], userId }: ReportDisplayProps & { userId: string }) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'references' | 'methodology'>('analysis');
  const [expandedReference, setExpandedReference] = useState<string | null>(null);

  // Add predictive insights and feedback to export
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ rating: number; comment: string } | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      if (!userId) return;
      const res = await fetch(`/api/analytics/predictive-insights?userId=${userId}`);
      const data = await res.json();
      setPredictiveInsights(data.insights || []);
    }
    fetchInsights();
  }, [userId]);

  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await fetch('/api/admin/modules');
        const data = await res.json();
        setEnabledModules((data.modules || []).filter((m: any) => m.enabled).map((m: any) => m.name));
      } catch {
        setEnabledModules(['weather','market','rag','scientific','predictive','sustainability','cost','yield']);
      }
    }
    fetchModules();
  }, []);

  if (!report) return null;

  const exportReport = () => {
    const reportData = {
      ...report,
      scientificReferences,
      ragContext,
      predictiveInsights,
      feedback,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oil-palm-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Oil Palm Analysis Report',
          text: `Analysis Report - Risk Level: ${report.riskLevel}, Confidence: ${report.confidenceScore}%`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-none">
      {enabledModules.includes('weather') && <RealTimeDataInfoBox />}
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 rounded-2xl p-6 mb-8 border border-emerald-200 dark:border-emerald-800/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Analysis Report
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Generated: {new Date(report.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Malaysia Oil Palm Region</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                <span>{scientificReferences.length} Scientific References</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={shareReport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              report.riskLevel === 'Low' ? 'bg-green-100 text-green-600' :
              report.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
              report.riskLevel === 'High' ? 'bg-orange-100 text-orange-600' :
              'bg-red-100 text-red-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              report.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
              report.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              report.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {report.riskLevel} Risk
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {report.riskLevel}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Risk Assessment</div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              AI Confidence
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {report.confidenceScore}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Analysis Accuracy</div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Evidence-Based
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {scientificReferences.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Scientific Sources</div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-950/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
              Priority Actions
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {report.improvementPlan?.filter(p => p.priority === 'High').length || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">High Priority Items</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-8">
        {[
          { id: 'analysis', label: 'Analysis Results', icon: BarChart3 },
          { id: 'references', label: 'Scientific References', icon: BookOpen },
          { id: 'methodology', label: 'Methodology', icon: Beaker }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'analysis' | 'references' | 'methodology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' && (
        <div className="space-y-8">
          {/* Interpretation Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                Detailed Interpretation
              </h3>
            </div>
            <div className="prose prose-emerald dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.interpretation}</ReactMarkdown>
            </div>
          </div>

          {/* Issues Section */}
          {report.issues && report.issues.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                  Critical Issues Identified
                </h3>
              </div>
              <div className="grid gap-3">
                {report.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Improvement Plan */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Strategic Improvement Plan
              </h3>
            </div>
            
            <div className="grid gap-6">
              {report.improvementPlan.map((plan, index) => (
                <div key={index} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                            {plan.recommendation}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400">
                            {plan.reasoning}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          plan.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          plan.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                          {plan.priority} Priority
                        </span>
                        {plan.investmentLevel && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {plan.investmentLevel} Investment
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expected Impact</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{plan.estimatedImpact}</p>
                      </div>
                      
                      {plan.costBenefit && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cost-Benefit</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.costBenefit}</p>
                        </div>
                      )}

                      {plan.implementationSteps && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Implementation</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.implementationSteps}</p>
                        </div>
                      )}

                      {plan.sustainabilityBenefits && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sustainability</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.sustainabilityBenefits}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'references' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
              Evidence-Based Analysis
            </h3>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              This analysis is supported by {scientificReferences.length} peer-reviewed scientific publications and {ragContext.length} expert knowledge sources from Malaysian oil palm research institutions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scientificReferences.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Scientific Papers</div>
              </div>
              <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{ragContext.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Knowledge Sources</div>
              </div>
              <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(scientificReferences.reduce((acc, ref) => acc + ref.relevanceScore, 0) / scientificReferences.length) || 0}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Avg Relevance</div>
              </div>
            </div>
          </div>

          {/* Scientific References */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Scientific Publications</h4>
            {scientificReferences.map((ref) => (
              <div key={ref.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        {ref.title}
                      </h5>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                        <span className="font-medium">{ref.authors.slice(0, 3).join(', ')}{ref.authors.length > 3 ? ' et al.' : ''}</span>
                        <span>•</span>
                        <span className="italic">{ref.journal}</span>
                        <span>•</span>
                        <span>{ref.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold">{ref.relevanceScore}%</span>
                      </div>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{ref.summary}</p>
                  
                  <button
                    onClick={() => setExpandedReference(expandedReference === ref.id ? null : ref.id)}
                    className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
                  >
                    {expandedReference === ref.id ? 'Hide' : 'Show'} Key Findings
                  </button>
                  
                  {expandedReference === ref.id && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h6 className="font-semibold text-slate-800 dark:text-white mb-2">Key Findings:</h6>
                        <ul className="space-y-2">
                          {ref.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {ref.applicationToAnalysis && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                          <h6 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Application to Your Analysis:</h6>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">{ref.applicationToAnalysis}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full ${
                            ref.confidenceLevel === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                            ref.confidenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                          }`}>
                            {ref.confidenceLevel} Confidence
                          </span>
                        </div>
                        {ref.doi && (
                          <span className="font-mono">DOI: {ref.doi}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RAG Context Sources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Knowledge Base Sources</h4>
            <div className="grid gap-4">
              {ragContext.map((context) => (
                <div key={context.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h6 className="font-semibold text-slate-800 dark:text-white">{context.source}</h6>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className={`px-2 py-1 rounded text-xs ${
                          context.documentType === 'research_paper' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          context.documentType === 'best_practice' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          context.documentType === 'guideline' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}>
                          {context.documentType.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>{context.relevanceScore}% relevant</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{context.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {context.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/50">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">
              Analysis Methodology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Processing Pipeline</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    GPT-4o Vision for image analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Advanced OCR for data extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    RAG-enhanced context retrieval
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Malaysian-specific calibration
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Quality Assurance</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Cross-validated with peer-reviewed research
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    MPOB standard compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Regional benchmark comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Confidence scoring algorithm
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Technical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Model Architecture</div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• OpenAI GPT-4o</li>
                  <li>• Vector embeddings (1536d)</li>
                  <li>• pgvector similarity search</li>
                  <li>• Dynamic prompt engineering</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Data Sources</div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• MPOB research database</li>
                  <li>• International journals</li>
                  <li>• Field trial data</li>
                  <li>• Best practice guidelines</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Validation</div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Expert agronomist review</li>
                  <li>• Statistical validation</li>
                  <li>• Field result correlation</li>
                  <li>• Continuous learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Predictive Insights Section */}
      {enabledModules.includes('predictive') && <PredictiveInsightsSection userId={userId} />}
      {/* User Feedback Section */}
      <UserFeedbackSection reportId={report?.timestamp || 'unknown'} />
    </div>
  );
}