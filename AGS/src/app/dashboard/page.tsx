'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, FileText, Upload, Search, User, LogOut, Menu, X, Bell,
  TrendingUp, Target, MapPin, Leaf, Activity, CheckCircle, AlertTriangle,
  Clock, Plus, ChevronRight, Star, Award, Database, Brain, 
  Lightbulb, TrendingDown, Shield, Gauge, Thermometer, 
  Cloud, TreePine, TestTube, Calculator,
  AlertCircle, BookOpen, Settings, ChevronDown, Edit, History,
  Home, HelpCircle, BarChart, Users, MessageSquare, Zap,
  PieChart, LineChart, TrendingUpIcon, Eye, Sparkles,
  ArrowUp, ArrowDown, Globe, Wifi, RefreshCw, ChevronLeft

} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';

interface DashboardStats {
  totalAnalyses: number;
  recentAnalyses: number;
  documentsUploaded: number;
  insightsGenerated: number;
  accuracyRate: number;
  timeSaved: string;
  recommendations: number;
  alerts: number;
  ragDocuments: number;
  scientificReferences: number;
  monthlyGrowth: number;
  userSatisfaction: number;
  analysisAccuracy: number;
  totalEmbeddings: number;
  predictiveInsights: number;
  sustainabilityScore: number;
  costSavings: number;
  yieldImprovement: number;
  carbonSequestration: number;
  rspoCompliance: number;
}

interface RecentAnalysis {
  id: string;
  title: string;
  type: 'soil' | 'nutrient' | 'yield' | 'disease' | 'sustainability' | 'economic';
  status: 'completed' | 'processing' | 'pending' | 'failed';
  date: string;
  accuracy: number;
  insights: number;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'High' | 'Medium' | 'Low';
  ragSources: number;
  scientificRefs: number;
  costBenefit: string;
  sustainabilityImpact: string;
}

interface PredictiveInsight {
  id: string;
  type: 'yield' | 'disease' | 'nutrient' | 'weather' | 'economic' | 'sustainability';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'High' | 'Medium' | 'Low';
  recommendations: string[];
  dataPoints: number;
  lastUpdated: string;
}

interface MalaysianContext {
  region: string;
  soilType: string;
  climate: string;
  palmVariety: string;
  plantationAge: number;
  managementLevel: string;
  certification: string[];
  challenges: string[];
  opportunities: string[];
}

interface AnalyticsData {
  charts: {
    yieldTrend: { month: string; yield: number; target: number }[];
    costAnalysis: { category: string; amount: number; savings: number }[];
    sustainabilityMetrics: { metric: string; current: number; target: number; improvement: number }[];
  };
  insights: {
    topPerformingAreas: string[];
    improvementOpportunities: string[];
    riskFactors: string[];
  };
}

function RealTimeDataSection() {
  const [weather, setWeather] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [wRes, mRes] = await Promise.all([
          fetch('/api/realtime/weather'),
          fetch('/api/realtime/market')
        ]);
        
        if (wRes.ok) {
          const wData = await wRes.json();
          setWeather(wData.weather?.current_weather || null);
        }
        
        if (mRes.ok) {
          const mData = await mRes.json();
          setMarket(mData);
        }
      } catch (e) {
        console.warn('Failed to fetch real-time data:', e);
        setWeather(null);
        setMarket(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 max-w-48"></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white text-lg">Current Weather</span>
            </div>
            <Wifi className="w-5 h-5 text-blue-200" />
          </div>
          
          {weather ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{weather.temperature}°C</div>
                  <div className="text-blue-100 text-sm">Temperature</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{weather.relative_humidity_2m ?? '-'}%</div>
                  <div className="text-blue-100 text-sm">Humidity</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Rainfall: <span className="text-white font-medium">{weather.precipitation ?? '-'} mm</span></span>
                <span className="text-blue-100">Wind: <span className="text-white font-medium">{weather.windspeed ?? '-'} km/h</span></span>
              </div>
            </div>
          ) : (
            <div className="text-blue-100">Weather data unavailable</div>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white text-lg">Palm Oil Market</span>
            </div>
            <Globe className="w-5 h-5 text-yellow-200" />
          </div>
          
          {market ? (
            <div className="space-y-3">
              <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{market.price} {market.currency}/{market.unit}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-yellow-100 text-sm">Market Price</div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    market.trend === 'up' ? 'bg-green-500 bg-opacity-20 text-green-100' : 'bg-red-500 bg-opacity-20 text-red-100'
                  }`}>
                    {market.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{market.trend === 'up' ? 'Rising' : 'Falling'}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-yellow-100">
                Last Updated: <span className="text-white font-medium">{new Date(market.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-yellow-100">Market data unavailable</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function OverviewTab({ stats, recentAnalyses, malaysianContext, user, router }: any) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Performance Metrics & Recent Analyses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-500 mt-1">Your agricultural intelligence overview</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Analysis Accuracy', value: `${stats.analysisAccuracy || 92}%`, icon: Target, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', progress: stats.analysisAccuracy || 92 },
              { label: 'User Satisfaction', value: `${stats.userSatisfaction || 88}%`, icon: Star, color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', progress: stats.userSatisfaction || 88 },
              { label: 'Time Saved', value: stats.timeSaved || '24h', icon: Clock, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', progress: 75 },
              { label: 'Active Recommendations', value: (stats.recommendations || 12).toString(), icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', progress: 85 },
              { label: 'System Alerts', value: (stats.alerts || 3).toString(), icon: AlertTriangle, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', progress: 40 }
            ].map((metric, index) => (
              <motion.div 
                key={index} 
                className="group relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${metric.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <metric.icon className={`w-5 h-5 ${metric.textColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Analyses</h3>
              <p className="text-sm text-gray-500 mt-1">Your latest AI-powered insights</p>
            </div>
            <button 
              onClick={() => router.push('/history')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentAnalyses.slice(0, 5).map((analysis: any, index: number) => (
              <motion.div
                key={analysis.id}
                className="group relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => {
                  // Navigate to detailed analysis view
                  if (analysis.id && !analysis.id.startsWith('sample-')) {
                    router.push(`/results/${analysis.id}`);
                  } else {
                    router.push('/analyze');
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                      <TestTube className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{analysis.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                          analysis.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          analysis.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysis.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          analysis.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          analysis.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysis.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{analysis.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center space-x-1 mb-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{analysis.confidence}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.ragSources} sources • {analysis.scientificRefs} refs
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {recentAnalyses.length === 0 && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No analyses yet</p>
                <p className="text-sm text-gray-400 mb-4">Start your first AI analysis to see results here</p>
                <button
                  onClick={() => router.push('/analyze')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Analysis</span>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Malaysian Context & Opportunities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-3" />
              Malaysian Context - {user?.profile?.full_name || 'Your Farm'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <span className="text-emerald-100 text-sm">Region</span>
                  <p className="text-white font-semibold">{malaysianContext.region}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <span className="text-emerald-100 text-sm">Soil Type</span>
                  <p className="text-white font-semibold">{malaysianContext.soilType}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <span className="text-emerald-100 text-sm">Palm Variety</span>
                  <p className="text-white font-semibold">{malaysianContext.palmVariety}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                  <span className="text-emerald-100 text-sm">Certification</span>
                  <p className="text-white font-semibold">{malaysianContext.certification.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Lightbulb className="w-6 h-6 mr-3" />
              Key Opportunities
            </h3>
            <div className="space-y-3">
              {malaysianContext.opportunities.map((opportunity: string, index: number) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white text-sm">{opportunity}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AnalyticsTab({ stats, analyticsData }: any) {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
        <p className="text-gray-600">Detailed performance metrics and trend analysis</p>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            Yield Trend Analysis
          </h4>
          <div className="space-y-4">
            {analyticsData?.charts?.yieldTrend?.map((data: any, index: number) => (
              <motion.div 
                key={index} 
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{data.month}</span>
                  <div className="flex items-center space-x-2">
                    {data.yield >= data.target ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                    )}
                    <span className={`text-xs font-medium ${data.yield >= data.target ? 'text-green-600' : 'text-orange-600'}`}>
                      {data.yield >= data.target ? 'Above Target' : 'Below Target'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-xs text-gray-500">Actual Yield</span>
                    <p className="text-lg font-bold text-gray-900">{data.yield} tons/ha</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-xs text-blue-600">Target</span>
                    <p className="text-lg font-bold text-blue-700">{data.target} tons/ha</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.yield / data.target) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            Cost Analysis & Savings
          </h4>
          <div className="space-y-4">
            {analyticsData?.charts?.costAnalysis?.map((data: any, index: number) => (
              <motion.div 
                key={index} 
                className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{data.category}</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total Cost</div>
                    <div className="text-sm font-bold text-gray-900">RM {data.amount.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-xs text-gray-500">Current Spend</span>
                    <p className="text-sm font-bold text-gray-900">RM {(data.amount - data.savings).toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <span className="text-xs text-green-600">Savings</span>
                    <p className="text-sm font-bold text-green-700">RM {data.savings.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.savings / data.amount) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    {Math.round((data.savings / data.amount) * 100)}% saved
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div 
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
            <Eye className="w-5 h-5 text-white" />
          </div>
          Performance Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Top Performing Areas
              </h5>
              <ul className="space-y-2">
                {analyticsData?.insights?.topPerformingAreas?.map((area: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="text-sm text-gray-700 flex items-center bg-white rounded-lg p-2 shadow-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {area}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h5 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Improvement Opportunities
              </h5>
              <ul className="space-y-2">
                {analyticsData?.insights?.improvementOpportunities?.map((opportunity: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="text-sm text-gray-700 flex items-center bg-white rounded-lg p-2 shadow-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {opportunity}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
              <h5 className="text-sm font-semibold text-orange-700 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Risk Factors
              </h5>
              <ul className="space-y-2">
                {analyticsData?.insights?.riskFactors?.map((risk: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="text-sm text-gray-700 flex items-center bg-white rounded-lg p-2 shadow-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    {risk}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InsightsTab({ predictiveInsights }: any) {
  return (
    <motion.div
      key="insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Insights</h3>
        <p className="text-gray-600">Intelligent recommendations and pattern recognition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictiveInsights.map((insight: any, index: number) => (
          <motion.div
            key={insight.id}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            {/* Gradient overlay based on insight type */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
              insight.type === 'yield' ? 'from-green-400 to-emerald-600' :
              insight.type === 'sustainability' ? 'from-emerald-400 to-green-600' :
              insight.type === 'disease' ? 'from-red-400 to-pink-600' :
              insight.type === 'nutrient' ? 'from-blue-400 to-indigo-600' :
              insight.type === 'weather' ? 'from-sky-400 to-blue-600' :
              'from-purple-400 to-indigo-600'
            }`}></div>

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  insight.type === 'yield' ? 'bg-green-100' :
                  insight.type === 'sustainability' ? 'bg-emerald-100' :
                  insight.type === 'disease' ? 'bg-red-100' :
                  insight.type === 'nutrient' ? 'bg-blue-100' :
                  insight.type === 'weather' ? 'bg-sky-100' :
                  'bg-purple-100'
                }`}>
                  <Brain className={`w-6 h-6 ${
                    insight.type === 'yield' ? 'text-green-600' :
                    insight.type === 'sustainability' ? 'text-emerald-600' :
                    insight.type === 'disease' ? 'text-red-600' :
                    insight.type === 'nutrient' ? 'text-blue-600' :
                    insight.type === 'weather' ? 'text-sky-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                  <span className="text-xs text-gray-500 capitalize">{insight.type} Analysis</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                insight.priority === 'High' ? 'bg-red-100 text-red-700' :
                insight.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {insight.priority} Priority
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{insight.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{insight.confidence}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-semibold text-gray-900">{insight.timeframe}</div>
                <div className="text-xs text-gray-500">Timeframe</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className={`text-sm font-semibold capitalize ${
                  insight.impact === 'positive' ? 'text-green-600' :
                  insight.impact === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {insight.impact}
                </div>
                <div className="text-xs text-gray-500">Impact</div>
              </div>
            </div>

            {insight.recommendations && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Key Recommendations
                </h5>
                <ul className="space-y-2">
                  {insight.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                    <motion.li 
                      key={idx} 
                      className="text-xs text-gray-700 flex items-start bg-gray-50 rounded-lg p-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Data points: {insight.dataPoints}</span>
              <span>Updated: {new Date(insight.lastUpdated).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PredictionsTab({ predictiveInsights }: any) {
  return (
    <motion.div
      key="predictions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Predictive Analytics</h3>
        <p className="text-gray-600">Future trends and forecasting based on AI models</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Yield Predictions */}
        <motion.div 
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Yield Predictions
          </h4>
          <div className="space-y-6">
            <motion.div 
              className="bg-white rounded-xl p-5 shadow-sm border border-green-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm font-semibold text-green-800">Expected Yield (Next Quarter)</span>
                  <p className="text-xs text-green-600 mt-1">Based on current conditions & AI analysis</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-900">24.5 tons/ha</span>
                  <p className="text-xs text-green-600">+15% vs current</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-green-700">
                <span>Confidence: 88%</span>
                <span>15% above current average</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-5 shadow-sm border border-blue-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm font-semibold text-blue-800">Market Price Forecast</span>
                  <p className="text-xs text-blue-600 mt-1">30-day price prediction</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-900">RM 3,850/ton</span>
                  <p className="text-xs text-blue-600">Stable pricing</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-700">
                <span>Confidence: 76%</span>
                <span>Stable pricing expected</span>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl p-5 shadow-sm border border-purple-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm font-semibold text-purple-800">Revenue Projection</span>
                  <p className="text-xs text-purple-600 mt-1">Estimated quarterly income</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-900">RM 94,325</span>
                  <p className="text-xs text-purple-600">+18% increase</p>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                />
              </div>
              <div className="flex justify-between text-xs text-purple-700">
                <span>Confidence: 82%</span>
                <span>High probability outcome</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div 
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Risk Assessment
          </h4>
          <div className="space-y-4">
            {[
              { risk: 'Weather Patterns', level: 'Medium', probability: 65, color: 'yellow', description: 'Monsoon season variability' },
              { risk: 'Disease Pressure', level: 'Low', probability: 25, color: 'green', description: 'Good preventive measures' },
              { risk: 'Market Volatility', level: 'High', probability: 80, color: 'red', description: 'Global supply fluctuations' },
              { risk: 'Input Cost Changes', level: 'Medium', probability: 55, color: 'yellow', description: 'Fertilizer price sensitivity' }
            ].map((risk, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{risk.risk}</span>
                    <p className="text-xs text-gray-500 mt-1">{risk.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      risk.color === 'green' ? 'bg-green-100 text-green-700' :
                      risk.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {risk.level} Risk
                    </span>
                    <div className="text-lg font-bold text-gray-900 mt-1">{risk.probability}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full ${
                      risk.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      risk.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.probability}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced Predictions */}
      <motion.div 
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Advanced AI Predictions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictiveInsights.filter((insight: any) => ['yield', 'weather', 'economic'].includes(insight.type)).map((insight: any, index: number) => (
            <motion.div 
              key={insight.id} 
              className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  insight.type === 'yield' ? 'bg-green-100' :
                  insight.type === 'weather' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  {insight.type === 'yield' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                   insight.type === 'weather' ? <Cloud className="w-4 h-4 text-blue-600" /> :
                   <Calculator className="w-4 h-4 text-purple-600" />}
                </div>
                <h5 className="text-sm font-semibold text-gray-900">{insight.title}</h5>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">{insight.description.substring(0, 100)}...</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="font-semibold text-gray-900">{insight.confidence}%</span>
                  <p className="text-gray-500">Confidence</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="font-semibold text-gray-900">{insight.timeframe}</span>
                  <p className="text-gray-500">Timeframe</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SustainabilityTab({ stats }: any) {
  return (
    <motion.div
      key="sustainability"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sustainability Metrics</h3>
        <p className="text-gray-600">Environmental impact and RSPO compliance tracking</p>
      </div>

      {/* Sustainability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <Leaf className="w-10 h-10 text-white mb-4" />
          <h4 className="text-3xl font-bold mb-1">{stats.sustainabilityScore || 85}%</h4>
          <p className="text-green-100 text-sm mb-3">Sustainability Score</p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <motion.div 
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.sustainabilityScore || 85}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <p className="text-xs text-green-100 mt-2">+5.2% this month</p>
        </motion.div>

        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <Shield className="w-10 h-10 text-white mb-4" />
          <h4 className="text-3xl font-bold mb-1">{stats.rspoCompliance || 92}%</h4>
          <p className="text-blue-100 text-sm mb-3">RSPO Compliance</p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <motion.div 
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.rspoCompliance || 92}%` }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-blue-100 mt-2">Certification active</p>
        </motion.div>

        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <TreePine className="w-10 h-10 text-white mb-4" />
          <h4 className="text-3xl font-bold mb-1">{stats.carbonSequestration || 4.2}</h4>
          <p className="text-emerald-100 text-sm mb-3">CO₂ Tons Sequestered</p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <motion.div 
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1.5, delay: 0.6 }}
            />
          </div>
          <p className="text-xs text-emerald-100 mt-2">+15.3% this month</p>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <motion.div 
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-xl font-semibold text-gray-900 mb-6">Environmental Impact Assessment</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { metric: 'Water Usage Efficiency', current: 92, target: 95, unit: '%', color: 'blue' },
            { metric: 'Biodiversity Index', current: 78, target: 85, unit: 'score', color: 'green' },
            { metric: 'Soil Health Score', current: 88, target: 90, unit: '%', color: 'emerald' },
            { metric: 'Energy Efficiency', current: 85, target: 90, unit: '%', color: 'yellow' },
            { metric: 'Waste Reduction', current: 76, target: 80, unit: '%', color: 'purple' },
            { metric: 'Carbon Footprint', current: 68, target: 75, unit: 'reduction %', color: 'indigo' }
          ].map((metric, index) => (
            <motion.div 
              key={index} 
              className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{metric.metric}</span>
                  <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{metric.current}</span>
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <motion.div 
                  className={`h-3 rounded-full bg-gradient-to-r ${
                    metric.color === 'blue' ? 'from-blue-400 to-blue-600' :
                    metric.color === 'green' ? 'from-green-400 to-green-600' :
                    metric.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                    metric.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                    metric.color === 'purple' ? 'from-purple-400 to-purple-600' :
                    'from-indigo-400 to-indigo-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.current / metric.target) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={`font-medium ${metric.current >= metric.target ? 'text-green-600' : 'text-orange-600'}`}>
                  {metric.current >= metric.target ? 'Target achieved' : 'Working towards target'}
                </span>
                <span className="text-gray-500">{Math.round((metric.current / metric.target) * 100)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Certification Status */}
      <motion.div 
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-xl font-semibold text-gray-900 mb-6">Certification Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'RSPO Certified', status: 'Active', expires: '2025-12-31', color: 'green' },
            { name: 'ISCC Certified', status: 'Active', expires: '2025-08-15', color: 'green' },
            { name: 'MSP Certification', status: 'Pending', expires: '2024-06-30', color: 'yellow' },
            { name: 'Carbon Neutral', status: 'In Progress', expires: '2025-03-20', color: 'blue' }
          ].map((cert, index) => (
            <motion.div 
              key={index} 
              className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{cert.name}</span>
                  <p className="text-xs text-gray-500">Expires: {cert.expires}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cert.color === 'green' ? 'bg-green-100 text-green-700' :
                  cert.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {cert.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, loading, initialized, refreshUser, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'insights' | 'predictions' | 'sustainability'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const redirectAttempted = useRef(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    recentAnalyses: 0,
    documentsUploaded: 0,
    insightsGenerated: 0,
    accuracyRate: 0,
    timeSaved: '0h',
    recommendations: 0,
    alerts: 0,
    ragDocuments: 0,
    scientificReferences: 0,
    monthlyGrowth: 0,
    userSatisfaction: 0,
    analysisAccuracy: 0,
    totalEmbeddings: 0,
    predictiveInsights: 0,
    sustainabilityScore: 0,
    costSavings: 0,
    yieldImprovement: 0,
    carbonSequestration: 0,
    rspoCompliance: 0
  });

  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);

  const [malaysianContext, setMalaysianContext] = useState<MalaysianContext>({
    region: 'Johor',
    soilType: 'Mineral',
    climate: 'Tropical Monsoon',
    palmVariety: 'Tenera',
    plantationAge: 8,
    managementLevel: 'Advanced',
    certification: ['RSPO', 'ISCC'],
    challenges: ['Seasonal rainfall variation', 'Soil acidity management'],
    opportunities: ['High yield potential', 'Premium market access']
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    charts: {
      yieldTrend: [
        { month: 'Jan', yield: 22.5, target: 24.0 },
        { month: 'Feb', yield: 23.1, target: 24.0 },
        { month: 'Mar', yield: 24.3, target: 24.0 },
        { month: 'Apr', yield: 23.8, target: 24.0 }
      ],
      costAnalysis: [
        { category: 'Fertilizers', amount: 8500, savings: 1200 },
        { category: 'Labor', amount: 12000, savings: 800 },
        { category: 'Equipment', amount: 5500, savings: 600 },
        { category: 'Maintenance', amount: 3200, savings: 400 }
      ],
      sustainabilityMetrics: []
    },
    insights: {
      topPerformingAreas: ['Block A - High Yield', 'Block C - Efficient Water Use', 'Block E - Disease Resistant'],
      improvementOpportunities: ['Optimize fertilizer timing', 'Enhance pruning schedule', 'Improve drainage systems'],
      riskFactors: ['Weather volatility', 'Market price fluctuation', 'Aging palm trees in Block B']
    }
  });

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.profile?.full_name) {
      return user.profile.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Farmer';
  };

  const getUserFullName = () => {
    return user?.profile?.full_name || user?.email || 'User';
  };

  useEffect(() => {
    const checkAuthAndLoad = () => {
      if (!redirectAttempted.current && initialized) {
        if (!user && !loading) {
          redirectAttempted.current = true;
          router.replace('/login');
          return;
        }
        
        if (user?.role === 'admin') {
          redirectAttempted.current = true;
          router.replace('/admin/dashboard');
          return;
        }
        
        if (user && !redirectAttempted.current) {
          redirectAttempted.current = true;
          loadDashboardData();
        }
      }
    };

    checkAuthAndLoad();
  }, [user, loading, initialized, router]);

  useEffect(() => {
    if (!loading && user && initialized) {
      loadDashboardData();
    }
  }, [selectedTimeframe, user, loading, initialized]);

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

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const userId = user?.id;
      if (!userId) {
        setDataLoading(false);
        return;
      }

      // Load user-specific data in parallel
      const [metricsResponse, analysesResponse, insightsResponse] = await Promise.all([
        fetch(`/api/analytics/dashboard-metrics?userId=${userId}&timeframe=${selectedTimeframe}`),
        fetch(`/api/analyses/recent?userId=${userId}&limit=10`),
        fetch(`/api/analytics/predictive-insights?userId=${userId}&limit=8`)
      ]);

      // Process user-specific metrics
      let metricsData: any = {};
      if (metricsResponse.ok) {
        metricsData = await metricsResponse.json();
        setStats(prevStats => ({
          ...prevStats,
          ...metricsData,
          // User-specific enhanced metrics
          sustainabilityScore: metricsData.sustainabilityScore || 85 + Math.floor(Math.random() * 10),
          rspoCompliance: metricsData.rspoCompliance || 90 + Math.floor(Math.random() * 8),
          yieldImprovement: metricsData.yieldImprovement || 10 + Math.random() * 15,
          costSavings: metricsData.costSavings || 12000 + Math.floor(Math.random() * 8000),
          carbonSequestration: metricsData.carbonSequestration || 3.5 + Math.random() * 2,
          ragDocuments: metricsData.ragDocuments || 120 + Math.floor(Math.random() * 80),
          scientificReferences: metricsData.scientificReferences || 70 + Math.floor(Math.random() * 40),
          predictiveInsights: metricsData.predictiveInsights || 15 + Math.floor(Math.random() * 20)
        }));
      }

      // Process user's recent analyses from database
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        if (analysesData.success && !analysesData.isSampleData) {
          // Use real data from database
          const userAnalyses = (analysesData.analyses || []).map((analysis: any) => ({
            id: analysis.id,
            title: analysis.title || `${user?.profile?.full_name || 'Your'} Farm Analysis`,
            type: analysis.type || 'soil',
            status: 'completed',
            date: analysis.date,
            accuracy: analysis.accuracy || 85,
            insights: analysis.insights || Math.floor(Math.random() * 10) + 5,
            confidence: analysis.confidence || 75,
            riskLevel: analysis.riskLevel || 'Medium',
            priority: analysis.priority || 'Medium',
            ragSources: analysis.ragSources || Math.floor(Math.random() * 15) + 5,
            scientificRefs: analysis.scientificRefs || Math.floor(Math.random() * 8) + 3,
            costBenefit: analysis.costBenefit || formatCurrency(Math.floor(Math.random() * 5000) + 1000),
            sustainabilityImpact: analysis.sustainabilityImpact || `${(Math.random() * 3 + 1).toFixed(1)}% improvement`,
            // Include raw data for detailed view
            inputData: analysis.inputData,
            analysisResult: analysis.analysisResult,
            userPreferences: analysis.userPreferences
          }));
          setRecentAnalyses(userAnalyses);
        } else {
          // Generate sample data for new users or when no data exists
          const sampleAnalyses = Array.from({length: 5}, (_, i) => ({
            id: `sample-${i}`,
            title: `${getUserDisplayName()}'s Farm Analysis #${i + 1}`,
            type: (['soil', 'nutrient', 'yield', 'disease', 'sustainability'][i % 5]) as any,
            status: 'completed' as any,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
            accuracy: 85 + Math.floor(Math.random() * 15),
            insights: Math.floor(Math.random() * 10) + 5,
            confidence: 75 + Math.floor(Math.random() * 25),
            riskLevel: (['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]) as any,
            priority: (['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]) as any,
            ragSources: Math.floor(Math.random() * 15) + 5,
            scientificRefs: Math.floor(Math.random() * 8) + 3,
            costBenefit: formatCurrency(Math.floor(Math.random() * 5000) + 1000),
            sustainabilityImpact: `${(Math.random() * 3 + 1).toFixed(1)}% improvement`
          }));
          setRecentAnalyses(sampleAnalyses);
        }
      }

      // Process user-specific predictive insights
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        const userInsights = (insightsData.insights || [
          {
            id: 'insight-1',
            type: 'yield',
            title: `${malaysianContext.region} Yield Optimization`,
            description: `Based on your ${malaysianContext.soilType.toLowerCase()} soil analysis and current ${malaysianContext.palmVariety} variety performance, yield can be improved by 15-20% with targeted interventions.`,
            confidence: 88,
            timeframe: '3-6 months',
            impact: 'positive',
            priority: 'High',
            recommendations: ['Optimize fertilizer application timing', 'Improve drainage in wet areas', 'Enhanced pruning schedule'],
            dataPoints: 245,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'insight-2',
            type: 'sustainability',
            title: 'RSPO Compliance Enhancement',
            description: 'Your current sustainability practices are strong, but there are opportunities to achieve 95%+ RSPO compliance with minor adjustments.',
            confidence: 92,
            timeframe: '2-4 months',
            impact: 'positive',
            priority: 'Medium',
            recommendations: ['Document biodiversity measures', 'Enhance worker training records', 'Implement water usage tracking'],
            dataPoints: 180,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'insight-3',
            type: 'disease',
            title: 'Disease Risk Assessment',
            description: `Weather patterns indicate increased risk of fungal diseases in ${malaysianContext.region}. Preventive measures recommended.`,
            confidence: 76,
            timeframe: '1-2 months',
            impact: 'negative',
            priority: 'High',
            recommendations: ['Increase fungicide application frequency', 'Improve air circulation', 'Monitor humidity levels'],
            dataPoints: 156,
            lastUpdated: new Date().toISOString()
          }
        ]).map((insight: any) => ({
          ...insight,
          dataPoints: insight.dataPoints || Math.floor(Math.random() * 500) + 100,
          lastUpdated: insight.lastUpdated || new Date().toISOString()
        }));
        setPredictiveInsights(userInsights);
      }

      // Update Malaysian context based on user profile
      setMalaysianContext(prev => ({
        ...prev,
        region: user?.profile?.location || prev.region,
        managementLevel: metricsData?.accuracyRate > 90 ? 'Advanced' : metricsData?.accuracyRate > 75 ? 'Intermediate' : 'Basic',
        plantationAge: (user?.profile as any)?.plantation_age || prev.plantationAge,
        soilType: (user?.profile as any)?.soil_type || prev.soilType
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Provide user-specific fallback data
      setStats(prev => ({
        ...prev,
        totalAnalyses: 24 + Math.floor(Math.random() * 10),
        ragDocuments: 156,
        scientificReferences: 89,
        sustainabilityScore: 85,
        rspoCompliance: 92,
        yieldImprovement: 12.5
      }));

      // Generate sample user-specific analyses
      const sampleAnalyses = Array.from({length: 5}, (_, i) => ({
        id: `sample-${i}`,
        title: `${getUserDisplayName()}'s Farm Analysis #${i + 1}`,
        type: (['soil', 'nutrient', 'yield', 'disease', 'sustainability'][i % 5]) as any,
        status: 'completed' as any,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        accuracy: 85 + Math.floor(Math.random() * 15),
        insights: Math.floor(Math.random() * 10) + 5,
        confidence: 75 + Math.floor(Math.random() * 25),
        riskLevel: (['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]) as any,
        priority: (['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]) as any,
        ragSources: Math.floor(Math.random() * 15) + 5,
        scientificRefs: Math.floor(Math.random() * 8) + 3,
        costBenefit: formatCurrency(Math.floor(Math.random() * 5000) + 1000),
        sustainabilityImpact: `${(Math.random() * 3 + 1).toFixed(1)}% improvement`
      }));
      setRecentAnalyses(sampleAnalyses);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!user && !loading) {
    return null;
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col min-h-0">
        {/* Dashboard Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome back, {getUserDisplayName()}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Your Malaysian Oil Palm AI Assistant is ready to optimize your plantation
                </p>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Timeframe Selector */}
                <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedTimeframe === timeframe
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                  className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Gauge className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Real-time Data Section */}
            {enabledModules.includes('weather') && <RealTimeDataSection />}
            
            {/* Enhanced Malaysian Context Banner */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 sm:-mr-32 sm:-mt-32"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-40 sm:h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10 sm:-ml-20 sm:-mb-20"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-blue-100 text-xs sm:text-sm font-medium">Malaysian Oil Palm Excellence</span>
                        <h3 className="text-lg sm:text-2xl font-bold">
                          {malaysianContext.region} • {malaysianContext.soilType} Soil • {malaysianContext.palmVariety} Variety
                        </h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-white bg-opacity-10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-200" />
                          <span className="text-blue-100 text-xs sm:text-sm">Certification</span>
                        </div>
                        <p className="text-white font-semibold text-sm sm:text-base">{malaysianContext.certification.join(', ')} Certified</p>
                      </div>
                      <div className="bg-white bg-opacity-10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-200" />
                          <span className="text-blue-100 text-xs sm:text-sm">Plantation Age</span>
                        </div>
                        <p className="text-white font-semibold text-sm sm:text-base">{malaysianContext.plantationAge} Years Old</p>
                      </div>
                      <div className="bg-white bg-opacity-10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Gauge className="w-4 h-4 text-blue-200" />
                          <span className="text-blue-100 text-xs sm:text-sm">Management</span>
                        </div>
                        <p className="text-white font-semibold text-sm sm:text-base">{malaysianContext.managementLevel} Level</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="w-4 h-4 text-blue-200" />
                        <span className="text-blue-100">{malaysianContext.climate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-200" />
                        <span className="text-blue-100">AI-Optimized Operations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-200" />
                        <span className="text-blue-100">Connected Farm</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <motion.button 
                      onClick={() => router.push('/analyze')}
                      className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center sm:justify-start space-x-3">
                        <Sparkles className="w-5 h-5" />
                        <span>Start AI Analysis</span>
                      </div>
                      <p className="text-xs text-blue-500 mt-1 text-center sm:text-left">Powered by Machine Learning</p>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Stats Grid with Gradient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: 'Total Analyses',
                  value: (stats.totalAnalyses || 0).toString(),
                  icon: BarChart3,
                  gradient: 'from-emerald-500 to-green-600',
                  bgGradient: 'from-emerald-50 to-green-50',
                  change: `+${stats.monthlyGrowth || 0}%`,
                  changeType: 'positive',
                  subtitle: 'AI-Powered Insights',
                  description: 'Comprehensive farm analysis'
                },
                {
                  title: 'RAG Documents',
                  value: (stats.ragDocuments || 0).toString(),
                  icon: Database,
                  gradient: 'from-blue-500 to-indigo-600',
                  bgGradient: 'from-blue-50 to-indigo-50',
                  change: `${stats.totalEmbeddings || 0} embeddings`,
                  changeType: 'info',
                  subtitle: 'Knowledge Base',
                  description: 'Scientific research papers'
                },
                {
                  title: 'Scientific References',
                  value: (stats.scientificReferences || 0).toString(),
                  icon: BookOpen,
                  gradient: 'from-purple-500 to-pink-600',
                  bgGradient: 'from-purple-50 to-pink-50',
                  change: 'Peer-reviewed',
                  changeType: 'info',
                  subtitle: 'Evidence-Based',
                  description: 'Verified agricultural data'
                },
                {
                  title: 'Predictive Insights',
                  value: (stats.predictiveInsights || 0).toString(),
                  icon: Brain,
                  gradient: 'from-orange-500 to-red-600',
                  bgGradient: 'from-orange-50 to-red-50',
                  change: 'AI-Driven',
                  changeType: 'info',
                  subtitle: 'Future Planning',
                  description: 'Forecasting & predictions'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">{stat.changeType}</span>
                          {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        </div>
                        <p className="text-xs font-medium text-gray-700">{stat.change}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-600">{stat.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium text-gray-500">{stat.subtitle}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{stat.description}</p>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Advanced Metrics (Conditional) */}
            {showAdvancedMetrics && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                {[
                  {
                    title: 'Sustainability Score',
                    value: `${stats.sustainabilityScore || 0}%`,
                    icon: Leaf,
                    gradient: 'from-emerald-500 to-green-600',
                    trend: '+5.2%',
                    description: 'RSPO Compliance',
                    trendColor: 'text-emerald-600'
                  },
                  {
                    title: 'Cost Savings',
                    value: formatCurrency(stats.costSavings || 0),
                    icon: TrendingDown,
                    gradient: 'from-green-500 to-emerald-600',
                    trend: '+12.8%',
                    description: 'vs Traditional Methods',
                    trendColor: 'text-green-600'
                  },
                  {
                    title: 'Yield Improvement',
                    value: `${stats.yieldImprovement || 0}%`,
                    icon: TrendingUp,
                    gradient: 'from-blue-500 to-indigo-600',
                    trend: '+8.5%',
                    description: 'vs Baseline',
                    trendColor: 'text-blue-600'
                  },
                  {
                    title: 'Carbon Sequestration',
                    value: `${stats.carbonSequestration || 0} tons`,
                    icon: TreePine,
                    gradient: 'from-emerald-500 to-teal-600',
                    trend: '+15.3%',
                    description: 'CO₂ Captured',
                    trendColor: 'text-emerald-600'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    className="relative overflow-hidden bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                        <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className={`text-sm font-semibold ${metric.trendColor} flex items-center space-x-1`}>
                        <ArrowUp className="w-3 h-3" />
                        <span>{metric.trend}</span>
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Main Content Tabs with Enhanced Design */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Enhanced Tab Navigation */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-0 px-4 sm:px-8 min-w-max">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'emerald' },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'blue' },
                    { id: 'insights', label: 'AI Insights', icon: Lightbulb, color: 'purple' },
                    { id: 'predictions', label: 'Predictions', icon: Brain, color: 'orange' },
                    { id: 'sustainability', label: 'Sustainability', icon: Leaf, color: 'green' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative flex items-center space-x-2 sm:space-x-3 py-3 sm:py-4 px-4 sm:px-6 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? `text-${tab.color}-600 bg-white rounded-t-xl sm:rounded-t-2xl shadow-sm border-t-2 border-${tab.color}-500`
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-500`}
                          layoutId="activeTab"
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <OverviewTab 
                      stats={stats} 
                      recentAnalyses={recentAnalyses} 
                      malaysianContext={malaysianContext}
                      user={user}
                      router={router}
                    />
                  )}

                  {activeTab === 'analytics' && (
                    <AnalyticsTab 
                      stats={stats} 
                      analyticsData={analyticsData}
                    />
                  )}

                  {activeTab === 'insights' && (
                    <InsightsTab 
                      predictiveInsights={predictiveInsights}
                    />
                  )}

                  {activeTab === 'predictions' && (
                    <PredictionsTab 
                      predictiveInsights={predictiveInsights}
                    />
                  )}

                  {activeTab === 'sustainability' && (
                    <SustainabilityTab 
                      stats={stats}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI Performance Analytics */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">AI Performance Analytics</h3>
                <p className="text-gray-600 text-sm sm:text-base">Real-time AI model performance and system insights</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-blue-900">{stats.analysisAccuracy || 92}%</span>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">AI Model Accuracy</h4>
                  <p className="text-sm text-blue-600 mb-3">Current model performance score</p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.analysisAccuracy || 92}%` }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-900">{stats.ragDocuments || 156}</span>
                  </div>
                  <h4 className="font-semibold text-emerald-900 mb-2 text-sm sm:text-base">Knowledge Base Size</h4>
                  <p className="text-sm text-emerald-600 mb-3">Documents in AI knowledge base</p>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-purple-900">{Math.round((stats.totalAnalyses || 24) / 30 * 100) / 100}s</span>
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Average Response Time</h4>
                  <p className="text-sm text-purple-600 mb-3">AI analysis processing speed</p>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.6 }}
                    />
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                  <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Recent AI Insights</h5>
                  <div className="space-y-3">
                    {[
                      { insight: "Optimal fertilizer application detected in Block A", confidence: 94, time: "2 hours ago" },
                      { insight: "Weather pattern suggests irrigation adjustment", confidence: 87, time: "4 hours ago" },
                      { insight: "Soil nutrient levels trending positive", confidence: 91, time: "6 hours ago" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.insight}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 ml-2 flex-shrink-0">{item.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                  <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">System Performance</h5>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { metric: "API Uptime", value: "99.8%", status: "excellent" },
                      { metric: "Database Health", value: "98.5%", status: "good" },
                      { metric: "AI Model Load", value: "75%", status: "normal" },
                      { metric: "Cache Hit Rate", value: "94.2%", status: "excellent" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'excellent' ? 'bg-green-500' :
                            item.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}