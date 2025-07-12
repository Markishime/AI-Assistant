'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';
import { 
  HelpCircle,
  Search,
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
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Play,
  Download,
  Star,
  Clock,
  Users,
  Award,
  Lightbulb,
  ArrowRight,
  PlayCircle,
  Phone,
  Eye
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  views: number;
}

interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  articles: number;
  popular: boolean;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Memoized FAQ item component
const FAQItem = React.memo(({ 
  faq, 
  isOpen, 
  onToggle,
  onHelpful
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  onHelpful: (id: string, helpful: boolean) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{faq.question}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {faq.views} views
            </span>
            <span className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {faq.helpful} helpful
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {faq.category}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                {faq.answer}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Was this helpful?</span>
                  <button
                    onClick={() => onHelpful(faq.id, true)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => onHelpful(faq.id, false)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span>No</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {faq.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Memoized help section card
const HelpSectionCard = React.memo(({ 
  section, 
  onSelect 
}: {
  section: HelpSection;
  onSelect: (section: HelpSection) => void;
}) => {
  const IconComponent = section.icon;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(section)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
          <IconComponent className="w-6 h-6" />
        </div>
        {section.popular && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            Popular
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {section.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{section.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{section.articles} articles</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
});

// Memoized guide step component
const GuideStepCard = React.memo(({ 
  step, 
  index 
}: {
  step: GuideStep;
  index: number;
}) => {
  const IconComponent = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">{step.description}</p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {step.duration}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              step.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
              step.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {step.difficulty}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function HelpPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'faq' | 'guides' | 'contact'>('overview');

  // Static data - optimized for performance
  const helpSections: HelpSection[] = useMemo(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using the Oil Palm AI Assistant platform',
      icon: Play,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      articles: 8,
      popular: true
    },
    {
      id: 'data-upload',
      title: 'Data Upload & Analysis',
      description: 'Upload your agricultural data and understand the analysis process',
      icon: Upload,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      articles: 12,
      popular: true
    },
    {
      id: 'reports',
      title: 'Reports & Insights',
      description: 'Understand your reports and implement recommendations',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      articles: 15,
      popular: false
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions for platform usage',
      icon: Settings,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      articles: 10,
      popular: false
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      description: 'Tips and strategies for optimal plantation management',
      icon: Award,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      articles: 20,
      popular: true
    },
    {
      id: 'api-integration',
      title: 'API & Integration',
      description: 'Integrate with external systems and automate workflows',
      icon: Zap,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      articles: 6,
      popular: false
    }
  ], []);

  const faqs: FAQ[] = useMemo(() => [
    {
      id: '1',
      question: 'What file formats are supported for upload?',
      answer: 'We support Excel files (.xlsx, .xls), images (.jpg, .png, .bmp), and PDF documents. The maximum file size is 10MB per file. For best results, ensure your data is well-organized with clear headers and consistent formatting.',
      category: 'File Upload',
      tags: ['files', 'formats', 'upload', 'excel', 'images'],
      helpful: 245,
      views: 1832
    },
    {
      id: '2',
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI models are trained on extensive agricultural datasets from Malaysian plantations and provide analysis with typically 85-95% accuracy, depending on data quality and completeness. The system continuously learns from new data to improve accuracy over time.',
      category: 'AI Analysis',
      tags: ['accuracy', 'AI', 'machine learning', 'confidence'],
      helpful: 189,
      views: 2156
    },
    {
      id: '3',
      question: 'Can I export my reports in different formats?',
      answer: 'Yes, you can export reports in PDF, Excel, and CSV formats. Reports can also be scheduled for automatic generation and email delivery. Premium users get additional export options including PowerPoint presentations and custom templates.',
      category: 'Reports',
      tags: ['export', 'PDF', 'excel', 'reports', 'download'],
      helpful: 167,
      views: 1645
    },
    {
      id: '4',
      question: 'Is my plantation data secure and private?',
      answer: 'Absolutely. We use enterprise-grade encryption (AES-256), secure data centers, and follow strict data protection protocols including GDPR compliance. Your data is never shared with third parties without explicit consent, and you maintain full ownership of your information.',
      category: 'Security',
      tags: ['security', 'privacy', 'encryption', 'GDPR', 'data protection'],
      helpful: 298,
      views: 3421
    },
    {
      id: '5',
      question: 'How often should I upload new data for optimal results?',
      answer: 'For optimal results, we recommend uploading new data monthly or after significant changes in your plantation management practices. Regular uploads help the AI track trends and provide more accurate predictions and recommendations.',
      category: 'Best Practices',
      tags: ['frequency', 'data upload', 'optimization', 'recommendations'],
      helpful: 134,
      views: 987
    },
    {
      id: '6',
      question: 'What makes this different from other agricultural platforms?',
      answer: 'Our platform is specifically designed for Malaysian oil palm cultivation with local expertise, climate considerations, and MPOB guidelines integration. We combine advanced AI with deep agricultural knowledge from local experts and research institutions.',
      category: 'Platform',
      tags: ['features', 'Malaysia', 'oil palm', 'MPOB', 'local expertise'],
      helpful: 223,
      views: 1789
    }
  ], []);

  const quickStartSteps: GuideStep[] = useMemo(() => [
    {
      id: '1',
      title: 'Create Your Account',
      description: 'Sign up with your email and complete your plantation profile for personalized recommendations.',
      icon: Users,
      duration: '2 minutes',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      title: 'Upload Your Data',
      description: 'Upload Excel files, images, or PDF documents containing your agricultural data.',
      icon: Upload,
      duration: '5 minutes',
      difficulty: 'Beginner'
    },
    {
      id: '3',
      title: 'Review AI Analysis',
      description: 'Our advanced AI analyzes your data and provides comprehensive insights within minutes.',
      icon: BarChart3,
      duration: '2 minutes',
      difficulty: 'Beginner'
    },
    {
      id: '4',
      title: 'Implement Recommendations',
      description: 'Follow detailed recommendations and track improvements in your plantation health.',
      icon: CheckCircle,
      duration: 'Ongoing',
      difficulty: 'Intermediate'
    }
  ], []);

  // Optimized filtering
  const filteredFAQs = useMemo(() => {
    let filtered = [...faqs];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => b.helpful - a.helpful);
  }, [faqs, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => 
    Array.from(new Set(faqs.map(faq => faq.category))).sort()
  , [faqs]);

  // Optimized handlers
  const handleSectionSelect = useCallback((section: HelpSection) => {
    console.log('Selected section:', section.title);
    // Navigate to section details
  }, []);

  const handleFAQToggle = useCallback((faqId: string) => {
    setOpenFAQ(prev => prev === faqId ? null : faqId);
  }, []);

  const handleHelpful = useCallback((faqId: string, helpful: boolean) => {
    console.log(`FAQ ${faqId} marked as ${helpful ? 'helpful' : 'not helpful'}`);
    // Update helpfulness in backend
  }, []);

  const handleEmailSupport = useCallback(() => {
    const subject = encodeURIComponent("Oil Palm AGS - Support Request");
    const body = encodeURIComponent(`Hello Oil Palm AGS Support Team,

I need assistance with the following:

Issue Description:
[Please describe your issue here]

Steps I've tried:
[Please list what you've already attempted]

Page: Help & Support
User: ${user?.email || 'Guest'}
Date: ${new Date().toLocaleDateString()}

Thank you for your assistance.

Best regards,
[Your Name]`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=support@oilpalmags.com&su=${subject}&body=${body}`, '_blank');
  }, [user]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white mb-6"
              >
                <HelpCircle className="w-8 h-8" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Help & Support Center
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to know about using the Malaysian Oil Palm AI Assistant platform
              </p>
              </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BookOpen },
                  { id: 'faq', label: 'FAQ', icon: HelpCircle },
                  { id: 'guides', label: 'Guides', icon: Lightbulb },
                  { id: 'contact', label: 'Contact', icon: MessageCircle }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Quick Start Guide */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
                  <div className="grid gap-6">
                    {quickStartSteps.map((step, index) => (
                      <GuideStepCard key={step.id} step={step} index={index} />
                    ))}
                  </div>
                </section>

                {/* Help Sections */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Help Topics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {helpSections.map(section => (
                      <HelpSectionCard
                        key={section.id}
                        section={section}
                        onSelect={handleSectionSelect}
                      />
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.map(faq => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      isOpen={openFAQ === faq.id}
                      onToggle={() => handleFAQToggle(faq.id)}
                      onHelpful={handleHelpful}
                    />
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQs found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or category filter</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'guides' && (
              <motion.div
                key="guides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Guides</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Step-by-step video tutorials and interactive guides are coming soon. 
                  In the meantime, check out our FAQ section or contact support for assistance.
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Contact Options */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
                  
                  <div className="grid gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEmailSupport}
                      className="flex items-center space-x-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Email Support</h3>
                        <p className="text-gray-600 text-sm">Get help via email - we respond within 24 hours</p>
                      </div>
                    </motion.button>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-4 p-6 bg-white border border-gray-200 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Phone Support</h3>
                        <p className="text-gray-600 text-sm">+60 3-1234-5678 (Mon-Fri, 9AM-6PM MYT)</p>
                          </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-4 p-6 bg-white border border-gray-200 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Live Chat</h3>
                        <p className="text-gray-600 text-sm">Chat with our support team in real-time</p>
                    </div>
                    </motion.div>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Support Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Business Hours</div>
                        <div className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 6:00 PM (MYT)</div>
                      </div>
            </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Response Time</div>
                        <div className="text-gray-600 text-sm">Email: Within 24 hours | Chat: Immediate</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    <div>
                        <div className="font-medium text-gray-900">Expert Support</div>
                        <div className="text-gray-600 text-sm">Agricultural specialists and technical experts</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Before Contacting Support</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check our FAQ section for quick answers</li>
                      <li>• Have your account information ready</li>
                      <li>• Describe the issue with specific details</li>
                      <li>• Include screenshots if applicable</li>
                    </ul>
              </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
