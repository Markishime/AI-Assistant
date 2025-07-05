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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spacer,
  Divider
} from '@heroui/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  PieChart,
  LineChart,
  BarChart,
  Users,
  MapPin,
  Leaf,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface AnalyticsData {
  id: string;
  date: string;
  fieldName: string;
  analysisType: 'soil' | 'leaf';
  samples: number;
  avgYield: number;
  healthScore: number;
  issues: number;
  recommendations: number;
  processingTime: number; // minutes
  accuracy: number; // percentage
}

interface MetricSummary {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: 'success' | 'danger' | 'warning' | 'primary';
}

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Sample analytics data
  const analyticsData: AnalyticsData[] = [
    {
      id: '1',
      date: '2024-01-20',
      fieldName: 'North Block A',
      analysisType: 'soil',
      samples: 25,
      avgYield: 18.5,
      healthScore: 88,
      issues: 2,
      recommendations: 5,
      processingTime: 12,
      accuracy: 94.2
    },
    {
      id: '2',
      date: '2024-01-20',
      fieldName: 'North Block A',
      analysisType: 'leaf',
      samples: 30,
      avgYield: 18.5,
      healthScore: 90,
      issues: 1,
      recommendations: 3,
      processingTime: 8,
      accuracy: 96.1
    },
    {
      id: '3',
      date: '2024-01-19',
      fieldName: 'South Block B',
      analysisType: 'soil',
      samples: 35,
      avgYield: 22.1,
      healthScore: 94,
      issues: 0,
      recommendations: 2,
      processingTime: 15,
      accuracy: 97.8
    },
    {
      id: '4',
      date: '2024-01-19',
      fieldName: 'East Block C',
      analysisType: 'leaf',
      samples: 20,
      avgYield: 14.2,
      healthScore: 72,
      issues: 4,
      recommendations: 8,
      processingTime: 18,
      accuracy: 89.3
    },
    {
      id: '5',
      date: '2024-01-18',
      fieldName: 'West Block D',
      analysisType: 'soil',
      samples: 28,
      avgYield: 12.8,
      healthScore: 58,
      issues: 6,
      recommendations: 12,
      processingTime: 22,
      accuracy: 91.7
    }
  ];

  const filteredData = useMemo(() => {
    return analyticsData.filter(item => {
      const fieldMatch = selectedField === 'all' || item.fieldName === selectedField;
      const typeMatch = selectedAnalysisType === 'all' || item.analysisType === selectedAnalysisType;
      return fieldMatch && typeMatch;
    });
  }, [selectedField, selectedAnalysisType]);

  const metrics: MetricSummary[] = [
    {
      label: 'Total Samples Analyzed',
      value: filteredData.reduce((sum, item) => sum + item.samples, 0),
      change: 15.3,
      trend: 'up',
      color: 'primary'
    },
    {
      label: 'Average Processing Time',
      value: `${(filteredData.reduce((sum, item) => sum + item.processingTime, 0) / filteredData.length).toFixed(1)}m`,
      change: -8.2,
      trend: 'up',
      color: 'success'
    },
    {
      label: 'Average Accuracy',
      value: `${(filteredData.reduce((sum, item) => sum + item.accuracy, 0) / filteredData.length).toFixed(1)}%`,
      change: 2.1,
      trend: 'up',
      color: 'success'
    },
    {
      label: 'Total Issues Detected',
      value: filteredData.reduce((sum, item) => sum + item.issues, 0),
      change: -25.0,
      trend: 'up',
      color: 'success'
    },
    {
      label: 'Recommendations Generated',
      value: filteredData.reduce((sum, item) => sum + item.recommendations, 0),
      change: 12.8,
      trend: 'up',
      color: 'warning'
    },
    {
      label: 'Average Health Score',
      value: `${(filteredData.reduce((sum, item) => sum + item.healthScore, 0) / filteredData.length).toFixed(1)}%`,
      change: 5.7,
      trend: 'up',
      color: 'success'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-blue-600';
  };

  const getHealthScoreColor = (score: number) => {
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

  const uniqueFields = Array.from(new Set(analyticsData.map(item => item.fieldName)));

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Advanced Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed analysis metrics and performance data
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                color="primary"
                variant="flat"
                startContent={<Download className="w-4 h-4" />}
              >
                Export Data
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
            startContent={<Calendar className="w-4 h-4" />}
          >
            <SelectItem key="24h">Last 24 Hours</SelectItem>
            <SelectItem key="7d">Last 7 Days</SelectItem>
            <SelectItem key="30d">Last 30 Days</SelectItem>
            <SelectItem key="90d">Last 90 Days</SelectItem>
            <SelectItem key="1y">Last Year</SelectItem>
          </Select>
          
          <Select
            placeholder="Select field"
            selectedKeys={selectedField ? [selectedField] : []}
            onSelectionChange={(keys) => {
              const field = Array.from(keys)[0] as string;
              setSelectedField(field);
            }}
            className="w-48"
            startContent={<MapPin className="w-4 h-4" />}
          >
            <SelectItem key="all">All Fields</SelectItem>
            <SelectItem key="North Block A">North Block A</SelectItem>
            <SelectItem key="South Block B">South Block B</SelectItem>
            <SelectItem key="East Block C">East Block C</SelectItem>
            <SelectItem key="West Block D">West Block D</SelectItem>
          </Select>

          <Select
            placeholder="Analysis type"
            selectedKeys={selectedAnalysisType ? [selectedAnalysisType] : []}
            onSelectionChange={(keys) => {
              const type = Array.from(keys)[0] as string;
              setSelectedAnalysisType(type);
            }}
            className="w-48"
            startContent={<Filter className="w-4 h-4" />}
          >
            <SelectItem key="all">All Types</SelectItem>
            <SelectItem key="soil">Soil Analysis</SelectItem>
            <SelectItem key="leaf">Leaf Analysis</SelectItem>
          </Select>
        </div>

        <Tabs aria-label="Analytics tabs" className="mb-8">
          <Tab key="overview" title="Overview">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {metric.label}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {metric.value}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Analysis Volume Trends</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization will be implemented here</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Analysis Type Distribution</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization will be implemented here</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="detailed" title="Detailed Data">
            {/* Detailed Analytics Table */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Analysis Details</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Analytics table">
                  <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Field</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn>Samples</TableColumn>
                    <TableColumn>Health Score</TableColumn>
                    <TableColumn>Issues</TableColumn>
                    <TableColumn>Processing Time</TableColumn>
                    <TableColumn>Accuracy</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {item.fieldName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={item.analysisType === 'soil' ? 'warning' : 'success'}
                            size="sm"
                            variant="flat"
                            startContent={item.analysisType === 'soil' ? <Target className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                          >
                            {item.analysisType}
                          </Chip>
                        </TableCell>
                        <TableCell>{item.samples}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={item.healthScore}
                              color={getHealthScoreColor(item.healthScore) as any}
                              className="max-w-16"
                              size="sm"
                            />
                            <span className="text-sm">{item.healthScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.issues > 0 ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span>{item.issues}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.processingTime}m</TableCell>
                        <TableCell>
                          <Chip
                            color={item.accuracy >= 95 ? 'success' : item.accuracy >= 90 ? 'primary' : 'warning'}
                            size="sm"
                            variant="flat"
                          >
                            {item.accuracy}%
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="performance" title="Performance">
            {/* Performance Metrics */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Processing Performance</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Processing Time</span>
                        <span className="font-medium">
                          {(filteredData.reduce((sum, item) => sum + item.processingTime, 0) / filteredData.length).toFixed(1)}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fastest Analysis</span>
                        <span className="font-medium text-green-600">
                          {Math.min(...filteredData.map(item => item.processingTime))}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Slowest Analysis</span>
                        <span className="font-medium text-red-600">
                          {Math.max(...filteredData.map(item => item.processingTime))}m
                        </span>
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Samples Processed</span>
                        <span className="font-medium">
                          {filteredData.reduce((sum, item) => sum + item.samples, 0)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Quality Metrics</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Accuracy</span>
                        <span className="font-medium">
                          {(filteredData.reduce((sum, item) => sum + item.accuracy, 0) / filteredData.length).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Highest Accuracy</span>
                        <span className="font-medium text-green-600">
                          {Math.max(...filteredData.map(item => item.accuracy)).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Lowest Accuracy</span>
                        <span className="font-medium text-red-600">
                          {Math.min(...filteredData.map(item => item.accuracy)).toFixed(1)}%
                        </span>
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-medium text-green-600">
                          {((filteredData.filter(item => item.accuracy >= 90).length / filteredData.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Field Comparison */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Field Performance Comparison</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {uniqueFields.map(field => {
                      const fieldData = filteredData.filter(item => item.fieldName === field);
                      const avgHealth = fieldData.reduce((sum, item) => sum + item.healthScore, 0) / fieldData.length;
                      const totalIssues = fieldData.reduce((sum, item) => sum + item.issues, 0);
                      
                      return (
                        <div key={field} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">{field}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {fieldData.length} analysis sessions
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Health</div>
                              <div className="font-medium">{avgHealth.toFixed(1)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Issues</div>
                              <div className="font-medium">{totalIssues}</div>
                            </div>
                            <Progress
                              value={avgHealth}
                              color={getHealthScoreColor(avgHealth) as any}
                              className="max-w-24"
                            />
                          </div>
                        </div>
                      );
                    })}
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
