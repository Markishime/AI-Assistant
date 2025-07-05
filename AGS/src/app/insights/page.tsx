/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import DashboardLayout from '../components/DashboardLayout';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Progress,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider
} from '@heroui/react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Target,
  Zap,
  Leaf,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface InsightData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  trend: 'up' | 'down' | 'stable';
  category: 'yield' | 'health' | 'efficiency' | 'quality';
  timeframe: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface FieldPerformance {
  fieldName: string;
  yieldScore: number;
  healthScore: number;
  qualityScore: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export default function InsightsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const insights: InsightData[] = [
    {
      id: '1',
      title: 'Average Yield per Hectare',
      value: '18.2 tons',
      change: 12.5,
      changeType: 'increase',
      trend: 'up',
      category: 'yield',
      timeframe: 'Last 30 days',
      description: 'Yield has increased by 12.5% compared to the previous month, indicating improved field management practices.',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Overall Field Health Score',
      value: '87%',
      change: 5.3,
      changeType: 'increase',
      trend: 'up',
      category: 'health',
      timeframe: 'Last 7 days',
      description: 'Field health scores have improved across most locations, with better soil pH management.',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Analysis Accuracy',
      value: '94.7%',
      change: -2.1,
      changeType: 'decrease',
      trend: 'down',
      category: 'quality',
      timeframe: 'Last 14 days',
      description: 'Slight decrease in analysis accuracy. Consider recalibrating equipment or reviewing sample collection methods.',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Processing Efficiency',
      value: '98.1%',
      change: 0.8,
      changeType: 'increase',
      trend: 'stable',
      category: 'efficiency',
      timeframe: 'Last 30 days',
      description: 'Processing efficiency remains high with minimal delays in analysis turnaround time.',
      priority: 'low'
    },
    {
      id: '5',
      title: 'Critical Issues Detected',
      value: '3',
      change: -40,
      changeType: 'decrease',
      trend: 'up',
      category: 'health',
      timeframe: 'Last 7 days',
      description: 'Significant reduction in critical issues across all fields. Proactive management showing results.',
      priority: 'high'
    },
    {
      id: '6',
      title: 'Nutrient Optimization Rate',
      value: '91.2%',
      change: 8.7,
      changeType: 'increase',
      trend: 'up',
      category: 'quality',
      timeframe: 'Last 30 days',
      description: 'Improved nutrient management strategies are yielding better soil and leaf analysis results.',
      priority: 'medium'
    }
  ];

  const fieldPerformance: FieldPerformance[] = [
    {
      fieldName: 'North Block A',
      yieldScore: 92,
      healthScore: 88,
      qualityScore: 90,
      overallScore: 90,
      issues: ['Slight nitrogen deficiency in sector 3'],
      recommendations: ['Increase nitrogen fertilizer application', 'Monitor soil moisture levels']
    },
    {
      fieldName: 'South Block B',
      yieldScore: 96,
      healthScore: 94,
      qualityScore: 95,
      overallScore: 95,
      issues: [],
      recommendations: ['Continue current management practices', 'Consider expanding successful techniques to other blocks']
    },
    {
      fieldName: 'East Block C',
      yieldScore: 78,
      healthScore: 72,
      qualityScore: 75,
      overallScore: 75,
      issues: ['Low soil pH', 'Potassium deficiency', 'Irregular water distribution'],
      recommendations: ['Apply lime to increase soil pH', 'Implement potassium fertilization program', 'Review irrigation system']
    },
    {
      fieldName: 'West Block D',
      yieldScore: 65,
      healthScore: 58,
      qualityScore: 62,
      overallScore: 62,
      issues: ['High soil pH', 'Poor drainage', 'Pest pressure detected'],
      recommendations: ['Implement soil acidification program', 'Improve drainage infrastructure', 'Deploy integrated pest management']
    }
  ];

  const filteredInsights = insights.filter(insight => {
    if (selectedCategory === 'all') return true;
    return insight.category === selectedCategory;
  });

  const getTrendIcon = (trend: string, size: string = 'w-4 h-4') => {
    switch (trend) {
      case 'up': return <TrendingUp className={`${size} text-green-500`} />;
      case 'down': return <TrendingDown className={`${size} text-red-500`} />;
      case 'stable': return <Activity className={`${size} text-blue-500`} />;
      default: return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'yield': return <BarChart3 className="w-5 h-5" />;
      case 'health': return <Leaf className="w-5 h-5" />;
      case 'efficiency': return <Zap className="w-5 h-5" />;
      case 'quality': return <Target className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'primary';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Analytics & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered insights and performance analytics for your oil palm plantation
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                color="primary"
                variant="flat"
                startContent={<Download className="w-4 h-4" />}
              >
                Export Report
              </Button>
              <Button
                color="primary"
                startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                onPress={refreshData}
                isLoading={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Select
            placeholder="Select timeframe"
            selectedKeys={selectedTimeframe ? [selectedTimeframe] : []}
            onSelectionChange={(keys) => {
              const timeframe = Array.from(keys)[0] as string;
              setSelectedTimeframe(timeframe);
            }}
            className="w-48"
          >
            <SelectItem key="24h">Last 24 Hours</SelectItem>
            <SelectItem key="7d">Last 7 Days</SelectItem>
            <SelectItem key="30d">Last 30 Days</SelectItem>
            <SelectItem key="90d">Last 90 Days</SelectItem>
            <SelectItem key="1y">Last Year</SelectItem>
          </Select>
          <Select
            placeholder="Select category"
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            onSelectionChange={(keys) => {
              const category = Array.from(keys)[0] as string;
              setSelectedCategory(category);
            }}
            className="w-48"
          >
            <SelectItem key="all">All Categories</SelectItem>
            <SelectItem key="yield">Yield Performance</SelectItem>
            <SelectItem key="health">Field Health</SelectItem>
            <SelectItem key="efficiency">Efficiency</SelectItem>
            <SelectItem key="quality">Quality Metrics</SelectItem>
          </Select>
        </div>

        <Tabs aria-label="Insights tabs" className="mb-8">
          <Tab key="overview" title="Overview">
            {/* Key Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(insight.category)}
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                      </div>
                      <Chip
                        color={getPriorityColor(insight.priority) as any}
                        size="sm"
                        variant="flat"
                      >
                        {insight.priority}
                      </Chip>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary">{insight.value}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(insight.trend)}
                          <span className={`text-sm font-medium ${getChangeColor(insight.changeType)}`}>
                            {insight.change > 0 ? '+' : ''}{insight.change}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {insight.timeframe}
                      </div>
                      <Divider />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {insight.description}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>

          <Tab key="performance" title="Field Performance">
            {/* Field Performance Analysis */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fieldPerformance.map((field) => (
                  <Card key={field.fieldName}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">{field.fieldName}</h3>
                        <Chip
                          color={getScoreColor(field.overallScore) as any}
                          size="lg"
                          variant="flat"
                        >
                          {field.overallScore}%
                        </Chip>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {/* Performance Metrics */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Yield Performance</span>
                            <span className="text-sm">{field.yieldScore}%</span>
                          </div>
                          <Progress
                            value={field.yieldScore}
                            color={getScoreColor(field.yieldScore) as any}
                            className="max-w-full"
                          />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Health Score</span>
                            <span className="text-sm">{field.healthScore}%</span>
                          </div>
                          <Progress
                            value={field.healthScore}
                            color={getScoreColor(field.healthScore) as any}
                            className="max-w-full"
                          />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Quality Score</span>
                            <span className="text-sm">{field.qualityScore}%</span>
                          </div>
                          <Progress
                            value={field.qualityScore}
                            color={getScoreColor(field.qualityScore) as any}
                            className="max-w-full"
                          />
                        </div>

                        <Divider />

                        {/* Issues */}
                        {field.issues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Issues Detected
                            </h4>
                            <ul className="space-y-1">
                              {field.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        <div>
                          <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {field.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </Tab>

          <Tab key="trends" title="Trends & Predictions">
            {/* Trends and Predictions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Yield Trends</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Month</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">+12.5%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Predicted Next Month</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">+8.2%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Seasonal Forecast</span>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600 font-medium">Stable</span>
                      </div>
                    </div>
                    <Divider />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      AI predictions based on weather patterns, soil analysis, and historical data suggest continued positive yield trends with optimal management practices.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Risk Assessment</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weather Risk</span>
                      <Chip color="success" size="sm" variant="flat">Low</Chip>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pest & Disease Risk</span>
                      <Chip color="warning" size="sm" variant="flat">Medium</Chip>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Market Risk</span>
                      <Chip color="success" size="sm" variant="flat">Low</Chip>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Operational Risk</span>
                      <Chip color="success" size="sm" variant="flat">Low</Chip>
                    </div>
                    <Divider />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Overall risk assessment indicates favorable conditions. Monitor pest activity in Block C and maintain current management protocols.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
