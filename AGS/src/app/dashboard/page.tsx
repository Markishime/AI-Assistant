'use client';

import { useState } from 'react';
import FileUpload from '@/src/app/components/FileUpload';
import ReportDisplay from '@/src/app/components/ReportDisplay';
import DashboardLayout from '@/src/app/components/DashboardLayout';
import { StaggerContainer, StaggerItem, FadeInUp } from '@/src/app/components/MotionWrapper';
import { Providers } from '@/src/app/components/Providers';
import { AnalysisData, AnalysisReport } from '@/types';
import { AnalysisResult } from '@/lib/langchain-analyzer';
import { 
  BarChart3,
  FileText,
  AlertTriangle,
  TrendingUp,
  Beaker,
  ClipboardList,
  FileImage,
  File,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisReport[]>([]);

  const handleUpload = async (data: AnalysisData, analysis: AnalysisResult) => {
    try {
      // Convert AnalysisResult to AnalysisReport format
      const report: AnalysisReport = {
        interpretation: analysis.interpretation,
        improvementPlan: analysis.improvementPlan,
        timestamp: new Date().toISOString(),
        issues: analysis.issues,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
      };
      
      setReport(report);
      setRecentAnalyses(prev => [report, ...prev.slice(0, 4)]); // Keep last 5 analyses
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  return (
    <Providers>
      <DashboardLayout 
        title="Oil Palm AI Assistant"
        subtitle="Advanced soil and leaf analysis for optimal crop management"
      >
        {/* Hero Section with Gradient Background */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-cyan-950/50 border border-emerald-100 dark:border-emerald-900/50">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-300/20 via-emerald-300/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-300/20 via-emerald-300/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative px-8 py-12 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                    AI-Powered Analysis
                  </h1>
                </div>
                <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl">
                  Transform your agricultural data into actionable insights with our advanced machine learning algorithms. Get real-time analysis and personalized recommendations for optimal crop management.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Smart Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-teal-200 dark:border-teal-800">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Results</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-cyan-200 dark:border-cyan-800">
                    <TrendingUp className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Growth Insights</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500"></div>
                  <div className="absolute inset-4 bg-white/95 dark:bg-slate-800/95 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="w-24 h-24 lg:w-32 lg:h-32 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          <StaggerItem>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                      {recentAnalyses.length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Analyses</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+12% this month</span>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-100 dark:border-emerald-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                      {`${Math.round(recentAnalyses.reduce((acc, r) => acc + (r.confidenceScore || 0), 0) / (recentAnalyses.length || 1))}%`}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Avg Confidence</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+5% accuracy</span>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                      {recentAnalyses.reduce((acc, r) => acc + (r.improvementPlan?.filter(p => p.priority === 'High').length || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Priority Issues</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Needs attention</span>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-100 dark:border-purple-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">15</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">This Month</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+20% growth</span>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          {/* Upload Section - Enhanced */}
          <FadeInUp delay={0.2} className="xl:col-span-1">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 shadow-xl border border-emerald-100 dark:border-emerald-900/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-300/20 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Beaker className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white">
                      New Analysis
                    </h2>
                    <p className="text-emerald-100 text-sm lg:text-base font-medium">
                      Upload sample data for AI-powered insights
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 lg:p-8">
                <FileUpload onUpload={handleUpload} />
              </div>
            </div>

            {/* Enhanced Recent Analyses Quick View */}
            {recentAnalyses.length > 0 && (
              <FadeInUp delay={0.4} className="mt-8">
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 shadow-xl border border-slate-200 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative px-6 lg:px-8 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                        <ClipboardList className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white">
                        Recent Analyses
                      </h3>
                    </div>
                  </div>

                  <div className="relative divide-y divide-slate-200/60 dark:divide-slate-700/60">
                    {recentAnalyses.slice(0, 3).map((analysis, index) => (
                      <div key={index} className="group/item p-6 lg:p-8 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent dark:hover:from-slate-700/30 dark:hover:to-transparent cursor-pointer transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className={`w-4 h-4 rounded-full shadow-lg ${
                                analysis.riskLevel === 'Low' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                analysis.riskLevel === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                analysis.riskLevel === 'High' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-red-500 to-red-600'
                              }`} />
                              <div className={`absolute inset-0 w-4 h-4 rounded-full animate-ping ${
                                analysis.riskLevel === 'Low' ? 'bg-green-400' :
                                analysis.riskLevel === 'Medium' ? 'bg-yellow-400' :
                                analysis.riskLevel === 'High' ? 'bg-orange-500' : 'bg-red-500'
                              } opacity-20`} />
                            </div>
                            <div>
                              <p className="text-sm lg:text-base font-semibold text-slate-800 dark:text-white">
                                Analysis #{index + 1}
                              </p>
                              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {new Date(analysis.timestamp).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm lg:text-base font-bold text-slate-700 dark:text-slate-300">
                                {analysis.confidenceScore}%
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}
          </FadeInUp>

          {/* Enhanced Results Section */}
          <FadeInUp delay={0.6} className="xl:col-span-2">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-950/20 shadow-xl border border-blue-100 dark:border-blue-900/50 hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-300/20 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white">
                      Analysis Results
                    </h2>
                    <p className="text-blue-100 text-sm lg:text-base font-medium">
                      Detailed insights and recommendations
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 lg:p-8">
                {report ? (
                  <ReportDisplay report={report} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-center">
                    <div className="relative mb-8">
                      <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
                        <FileText className="w-16 h-16 lg:w-20 lg:h-20 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4">
                      Ready for Analysis
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 lg:mb-12 max-w-md lg:max-w-lg text-base lg:text-lg leading-relaxed">
                      Upload a sample file to get started with AI-powered analysis and personalized recommendations for your oil palm plantation.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 w-full max-w-2xl">
                      <div className="group/file flex flex-col items-center p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-3 group-hover/file:scale-110 transition-transform duration-300">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300">Excel Files</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">.xlsx, .xls</span>
                      </div>

                      <div className="group/file flex flex-col items-center p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 mb-3 group-hover/file:scale-110 transition-transform duration-300">
                          <FileImage className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300">Images</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">.jpg, .png</span>
                      </div>

                      <div className="group/file flex flex-col items-center p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 mb-3 group-hover/file:scale-110 transition-transform duration-300">
                          <File className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300">Documents</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">.pdf, .doc</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeInUp>
        </div>
      </DashboardLayout>
    </Providers>
  );
}