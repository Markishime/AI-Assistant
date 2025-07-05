'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import { AnalysisReport } from '@/types';

// Mock data for demonstration
const mockHistoryData: AnalysisReport[] = [
  {
    interpretation: "Soil analysis shows balanced nutrient levels with slight nitrogen deficiency.",
    improvementPlan: [
      {
        recommendation: "Apply nitrogen fertilizer",
        reasoning: "Low nitrogen levels detected",
        estimatedImpact: "10-15% yield increase",
        priority: "High"
      }
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    issues: ["Nitrogen deficiency"],
    riskLevel: "Medium",
    confidenceScore: 92
  },
  {
    interpretation: "Leaf analysis indicates healthy plant status with optimal nutrient uptake.",
    improvementPlan: [
      {
        recommendation: "Continue current fertilization program",
        reasoning: "Optimal nutrient levels maintained",
        estimatedImpact: "Sustained productivity",
        priority: "Low"
      }
    ],
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    issues: [],
    riskLevel: "Low",
    confidenceScore: 96
  },
  // Add more mock data...
];

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<AnalysisReport[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // In a real app, fetch from API
    setHistoryData(mockHistoryData);
  }, []);

  const filterData = () => {
    let filtered = [...historyData];
    
    // Filter by time range
    const days = parseInt(selectedTimeRange);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);
    
    // Filter by risk level
    if (selectedRiskFilter !== 'All') {
      filtered = filtered.filter(item => item.riskLevel === selectedRiskFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'confidence':
          return (b.confidenceScore || 0) - (a.confidenceScore || 0);
        case 'risk':
          const riskOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0) - 
                 (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredData = filterData();

  const getAverageConfidence = () => {
    if (filteredData.length === 0) return 0;
    return Math.round(filteredData.reduce((acc, r) => acc + (r.confidenceScore || 0), 0) / filteredData.length);
  };

  const getRiskDistribution = () => {
    const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    filteredData.forEach(item => {
      if (item.riskLevel && distribution.hasOwnProperty(item.riskLevel)) {
        distribution[item.riskLevel as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const getTrendData = () => {
    // Calculate trend compared to previous period
    const currentPeriod = filteredData.length;
    const previousPeriodData = historyData.filter(item => {
      const itemDate = new Date(item.timestamp);
      const days = parseInt(selectedTimeRange);
      const currentStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const previousStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);
      return itemDate >= previousStart && itemDate < currentStart;
    });
    
    const trend = currentPeriod - previousPeriodData.length;
    return { value: Math.abs(trend), isPositive: trend >= 0 };
  };

  const riskDistribution = getRiskDistribution();
  const trend = getTrendData();

  return (
    <DashboardLayout 
      title="Analysis History" 
      subtitle="Track your plantation&apos;s health over time"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Analyses"
          value={filteredData.length}
          icon="📊"
          color="blue"
          trend={trend}
        />
        <StatsCard
          title="Avg. Confidence"
          value={`${getAverageConfidence()}%`}
          icon="🎯"
          color="green"
        />
        <StatsCard
          title="High Risk Count"
          value={riskDistribution.High + riskDistribution.Critical}
          icon="⚠️"
          color="red"
        />
        <StatsCard
          title="Success Rate"
          value={`${Math.round((riskDistribution.Low / (filteredData.length || 1)) * 100)}%`}
          icon="✅"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            {/* Time Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date (Newest First)</option>
                <option value="confidence">Confidence Score</option>
                <option value="risk">Risk Level</option>
              </select>
            </div>

            {/* Risk Distribution */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h4>
              <div className="space-y-2">
                {Object.entries(riskDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        level === 'Low' ? 'bg-green-400' :
                        level === 'Medium' ? 'bg-yellow-400' :
                        level === 'High' ? 'bg-orange-400' : 'bg-red-400'
                      }`} />
                      <span className="text-sm text-gray-600">{level}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-500">
              <h2 className="text-xl font-semibold text-white">Analysis Timeline</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 lg:max-h-full overflow-y-auto">
              {filteredData.length > 0 ? (
                filteredData.map((analysis, index) => (
                  <div key={analysis.timestamp} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full ${
                            analysis.riskLevel === 'Low' ? 'bg-green-400' :
                            analysis.riskLevel === 'Medium' ? 'bg-yellow-400' :
                            analysis.riskLevel === 'High' ? 'bg-orange-400' : 'bg-red-400'
                          }`} />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Analysis #{filteredData.length - index}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            analysis.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                            analysis.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            analysis.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {analysis.riskLevel} Risk
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {analysis.interpretation}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {analysis.issues?.slice(0, 3).map((issue, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                              {issue}
                            </span>
                          ))}
                          {(analysis.issues?.length || 0) > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{(analysis.issues?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{analysis.improvementPlan?.length || 0} recommendations</span>
                          <span>•</span>
                          <span>{analysis.confidenceScore}% confidence</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No analyses match your current filters. Try adjusting the time range or risk level filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
