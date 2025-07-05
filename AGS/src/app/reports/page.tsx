'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import { StaggerContainer, StaggerItem, FadeInUp } from '../components/MotionWrapper';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Select,
  SelectItem,
  DatePicker,
  Checkbox,
  Progress,
  Badge
} from '@heroui/react';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'monthly',
      title: 'Monthly Summary',
      description: 'Comprehensive monthly analysis summary with trends and recommendations',
      icon: '📊',
      color: 'primary' as const,
      duration: 'This Month',
      estimatedSize: '2.4 MB'
    },
    {
      id: 'quarterly',
      title: 'Quarterly Report',
      description: 'Detailed quarterly performance analysis and strategic insights',
      icon: '📈',
      color: 'success' as const,
      duration: 'Q4 2024',
      estimatedSize: '4.8 MB'
    },
    {
      id: 'annual',
      title: 'Annual Review',
      description: 'Complete yearly overview with year-over-year comparisons',
      icon: '📋',
      color: 'secondary' as const,
      duration: '2024',
      estimatedSize: '7.2 MB'
    },
    {
      id: 'custom',
      title: 'Custom Report',
      description: 'Create a custom report with specific date ranges and parameters',
      icon: '⚙️',
      color: 'warning' as const,
      duration: 'Custom Range',
      estimatedSize: 'Variable'
    }
  ];

  const recentReports = [
    {
      title: 'November 2024 Summary',
      type: 'Monthly',
      date: '2024-12-01',
      size: '2.1 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      title: 'Q3 2024 Analysis',
      type: 'Quarterly',
      date: '2024-10-01',
      size: '4.8 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      title: 'October Risk Assessment',
      type: 'Custom',
      date: '2024-11-01',
      size: '1.3 MB',
      status: 'processing',
      downloadUrl: '#'
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <TrendingUp className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      subtitle="Generate comprehensive reports and insights"
    >
      {/* Quick Stats */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StaggerItem>
          <StatsCard
            title="Reports Generated"
            value={24}
            icon="📊"
            color="blue"
            trend={{ value: 15, isPositive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Data Points"
            value="1.2K"
            icon="📈"
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Avg. Score"
            value="87%"
            icon="🎯"
            color="purple"
            trend={{ value: 3, isPositive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Export Rate"
            value="92%"
            icon="📤"
            color="yellow"
            trend={{ value: 5, isPositive: true }}
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Types */}
        <FadeInUp delay={0.2} className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-semibold">Available Reports</h2>
                  <p className="text-indigo-100 text-sm">Choose from predefined reports or create your own</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => (
                  <Card
                    key={report.id}
                    isPressable
                    isHoverable
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedReport === report.id
                        ? 'border-2 border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onPress={() => setSelectedReport(report.id)}
                  >
                    <CardBody className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                          <span className="text-lg">{report.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                            {selectedReport === report.id && (
                              <Chip color="primary" size="sm" variant="flat">Selected</Chip>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                          <div className="flex items-center justify-between">
                            <Chip color={report.color} variant="flat" size="sm">
                              {report.duration}
                            </Chip>
                            <span className="text-xs text-gray-500">{report.estimatedSize}</span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Generate Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  color="primary"
                  size="lg"
                  onPress={handleGenerateReport}
                  isLoading={isGenerating}
                  startContent={!isGenerating && <FileText className="w-5 h-5" />}
                  className="px-8 py-3 font-medium"
                >
                  {isGenerating ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </FadeInUp>

        {/* Report Preview & Recent Reports */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Preview */}
          <FadeInUp delay={0.4}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
              </CardHeader>
              <CardBody>
                {selectedReport && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {reportTypes.find(r => r.id === selectedReport)?.icon}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {reportTypes.find(r => r.id === selectedReport)?.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {reportTypes.find(r => r.id === selectedReport)?.duration}
                        </p>
                      </div>
                    </div>
                    
                    <Card className="bg-blue-50 border-blue-200">
                      <CardBody className="p-4">
                        <p className="text-sm text-gray-600 mb-3">This report will include:</p>
                        <div className="space-y-2">
                          {['Analysis summary', 'Key metrics & trends', 'Risk assessments', 'Recommendations', 'Visual charts'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Estimated size:</span>
                          <span className="font-medium">{reportTypes.find(r => r.id === selectedReport)?.estimatedSize}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Format:</span>
                          <Chip color="secondary" size="sm" variant="flat">PDF</Chip>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </CardBody>
            </Card>
          </FadeInUp>

          {/* Recent Reports */}
          <FadeInUp delay={0.6}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-200">
                  {recentReports.map((report, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{report.title}</h4>
                            <Badge 
                              color={getStatusColor(report.status)}
                              content={getStatusIcon(report.status)}
                              size="sm"
                            >
                              <Chip color={getStatusColor(report.status)} size="sm" variant="flat">
                                {report.status}
                              </Chip>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                            <span>•</span>
                            <span>{new Date(report.date).toLocaleDateString()}</span>
                          </div>
                          {report.status === 'processing' && (
                            <Progress
                              size="sm"
                              value={65}
                              color="warning"
                              className="mt-2"
                              showValueLabel={true}
                            />
                          )}
                        </div>
                        {report.status === 'completed' && (
                          <Button
                            isIconOnly
                            variant="light"
                            color="primary"
                            size="sm"
                            className="ml-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </FadeInUp>
        </div>
      </div>

      {/* Custom Report Configuration */}
      {selectedReport === 'custom' && (
        <FadeInUp delay={0.8} className="mt-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Custom Report Configuration</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
                  <div className="space-y-3">
                    <DatePicker 
                      label="Start Date"
                      variant="bordered"
                      className="w-full"
                    />
                    <DatePicker 
                      label="End Date"
                      variant="bordered"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Include Sections</h4>
                  <div className="space-y-3">
                    {['Executive Summary', 'Risk Analysis', 'Trends & Patterns', 'Recommendations', 'Raw Data'].map((section) => (
                      <Checkbox key={section} defaultSelected size="sm">
                        <span className="text-sm text-gray-700">{section}</span>
                      </Checkbox>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Export Options</h4>
                  <Select 
                    label="Format"
                    variant="bordered"
                    defaultSelectedKeys={["pdf"]}
                    className="mb-4"
                  >
                    <SelectItem key="pdf">PDF Report</SelectItem>
                    <SelectItem key="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem key="csv">CSV Data</SelectItem>
                    <SelectItem key="ppt">PowerPoint Slides</SelectItem>
                  </Select>
                  
                  <Checkbox size="sm">
                    <span className="text-sm text-gray-700">Email when ready</span>
                  </Checkbox>
                </div>
              </div>
            </CardBody>
          </Card>
        </FadeInUp>
      )}
    </DashboardLayout>
  );
}
