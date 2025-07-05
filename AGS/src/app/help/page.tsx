'use client';

import DashboardLayout from '../components/DashboardLayout';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Accordion, 
  AccordionItem, 
  Link
} from '@heroui/react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  BarChart3, 
  Settings, 
  MessageCircle, 
  Mail,
  ExternalLink,
  CheckCircle,
  Info,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function HelpPage() {
  const quickStartSteps = [
    {
      icon: Upload,
      title: "Upload Your Data",
      description: "Upload Excel files, images, or PDF documents containing your agricultural data.",
      details: ["Supported formats: .xlsx, .xls, .jpg, .png, .pdf", "Maximum file size: 10MB", "Multiple files can be uploaded at once"]
    },
    {
      icon: BarChart3,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your data and provides comprehensive insights.",
      details: ["Soil composition analysis", "Nutrient deficiency detection", "Yield optimization recommendations"]
    },
    {
      icon: FileText,
      title: "Review Reports",
      description: "Access detailed reports with actionable recommendations for your plantation.",
      details: ["Performance metrics and trends", "Risk assessments", "Improvement action plans"]
    },
    {
      icon: Settings,
      title: "Track Progress",
      description: "Monitor your plantation's health and track improvements over time.",
      details: ["Historical data comparison", "Progress tracking", "Automated alerts"]
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your agricultural data to provide precise insights and recommendations.",
      color: "primary" as const
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your data is protected with enterprise-grade security measures and encrypted storage.",
      color: "success" as const
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor key metrics and track improvements in your plantation's health and productivity over time.",
      color: "secondary" as const
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate comprehensive reports with actionable insights and export them in multiple formats.",
      color: "warning" as const
    }
  ];

  const faqs = [
    {
      question: "What file formats are supported?",
      answer: "We support Excel files (.xlsx, .xls), images (.jpg, .png), and PDF documents. The maximum file size is 10MB per file."
    },
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI models are trained on extensive agricultural datasets and provide analysis with typically 85-95% accuracy, depending on data quality and completeness."
    },
    {
      question: "Can I export my reports?",
      answer: "Yes, you can export reports in PDF, Excel, and CSV formats. Reports can also be scheduled for automatic generation and email delivery."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, secure data centers, and follow strict data protection protocols. Your data is never shared with third parties."
    },
    {
      question: "How often should I upload new data?",
      answer: "For optimal results, we recommend uploading new data monthly or after significant changes in your plantation management practices."
    }
  ];

  return (
    <DashboardLayout 
      title="Help & Support" 
      subtitle="Get started with Oil Palm AI Assistant and find answers to common questions"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Start Guide</h2>
                <p className="text-gray-600">Get up and running in 4 simple steps</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      <div className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-500">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
            <p className="text-gray-600">Discover what makes Oil Palm AI Assistant powerful</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className={`p-3 rounded-lg bg-${feature.color}-100`}>
                      <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                      <Button 
                        variant="light" 
                        color={feature.color}
                        size="sm" 
                        className="mt-2"
                        endContent={<ExternalLink className="w-3 h-3" />}
                      >
                        Learn more
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find answers to common questions about the platform</p>
          </CardHeader>
          <CardBody>
            <Accordion variant="splitted">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  aria-label={faq.question}
                  title={faq.question}
                  startContent={<Info className="w-4 h-4 text-blue-500" />}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Live Chat Support</h3>
                  <p className="text-sm text-gray-600">Get instant help from our team</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-4">
                Available Monday-Friday, 9 AM - 6 PM PST
              </p>
              <Button color="success" className="w-full">
                Start Chat
              </Button>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-600">Send us a detailed message</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-4">
                We typically respond within 24 hours
              </p>
              <Button color="secondary" className="w-full">
                Send Email
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Additional Resources</h2>
            <p className="text-gray-600">Explore more ways to get the most out of the platform</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/docs" 
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <BookOpen className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">Documentation</p>
                  <p className="text-sm text-gray-500">Detailed guides and API reference</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link 
                href="/tutorials" 
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <FileText className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-green-600">Video Tutorials</p>
                  <p className="text-sm text-gray-500">Step-by-step video guides</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link 
                href="/community" 
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-purple-600">Community Forum</p>
                  <p className="text-sm text-gray-500">Connect with other users</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
