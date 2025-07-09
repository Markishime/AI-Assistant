'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye,
  Database,
  RefreshCw,
  Upload,
  BarChart3,
  BookOpen,
  ExternalLink,
  Activity,
  TrendingUp
} from 'lucide-react';

interface Document {
  name: string;
  size: number;
  lastModified: string;
}

interface DocumentAnalytics {
  totalDocuments: number;
  totalEmbeddings: number;
  averageChunksPerDocument: number;
  documentTypes: Record<string, number>;
  recentlyAdded: Array<{
    id: string;
    title: string;
    description?: string;
    document_type?: string;
    created_at: string;
  }>;
}

interface EnhancedRAGContext {
  content: string;
  metadata: Record<string, string | number | boolean>;
  similarity: number;
  document_title?: string;
  document_source?: string;
  chunk_index: number;
  document_url?: string;
  document_metadata?: Record<string, string | number | boolean>;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [searchResults, setSearchResults] = useState<EnhancedRAGContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'search' | 'analytics'>('overview');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadDocumentData();
  }, []);

  const loadDocumentData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents/enhanced');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setAnalytics(data.analytics || null);
      }
    } catch (error) {
      console.error('Error loading document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/reference-documents/enhanced?action=search&query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setActiveTab('search');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = async (filename: string) => {
    try {
      const response = await fetch(`/api/reference-documents/enhanced?action=download-url&filename=${encodeURIComponent(filename)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
    }
  };

  const uploadToStorage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload-to-storage' })
      });
      if (response.ok) {
        await loadDocumentData();
      }
    } catch (error) {
      console.error('Error uploading to storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const rebuildEmbeddings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rebuild' })
      });
      if (response.ok) {
        await loadDocumentData();
      }
    } catch (error) {
      console.error('Error rebuilding embeddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAllDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process-all-documents' })
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Document processing completed:', result);
        await loadDocumentData();
      }
    } catch (error) {
      console.error('Error processing documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeEmbeddings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize-embeddings' })
      });
      if (response.ok) {
        await loadDocumentData();
      }
    } catch (error) {
      console.error('Error initializing embeddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterType === 'all') return true;
    const ext = doc.name.split('.').pop()?.toLowerCase();
    return filterType === ext;
  });

  const documentTypes = Array.from(new Set(documents.map(doc => doc.name.split('.').pop()?.toLowerCase()).filter(Boolean) as string[]));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Knowledge Base</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage reference documents and RAG insights</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={uploadToStorage}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload to Storage
          </button>
          <button
            onClick={processAllDocuments}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Process Documents
          </button>
          <button
            onClick={initializeEmbeddings}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Generate Embeddings
          </button>
          <button
            onClick={rebuildEmbeddings}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rebuild
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'search', label: 'RAG Search', icon: Search },
          { id: 'analytics', label: 'Analytics', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'documents' | 'search' | 'analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {analytics?.totalDocuments || documents.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Documents</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {analytics?.totalEmbeddings || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Embeddings</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {analytics?.averageChunksPerDocument || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Avg Chunks</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {Object.keys(analytics?.documentTypes || {}).length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Doc Types</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex gap-3 items-center">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type?.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Document List */}
            <div className="grid gap-4">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => getDocumentUrl(doc.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => console.log('View document:', doc.name)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search knowledge base..."
                  className="w-full px-4 py-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        {result.document_title || 'Unknown Document'}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                          {Math.round(result.similarity * 100)}% match
                        </span>
                        {result.document_url && (
                          <button
                            onClick={() => window.open(result.document_url, '_blank')}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-3">
                      {result.content.substring(0, 400)}...
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                        Source: {result.document_source || 'Unknown'}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                        Chunk: {result.chunk_index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Document Types Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Document Types Distribution
              </h3>
              <div className="grid gap-3">
                {Object.entries(analytics.documentTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 capitalize">{type.replace('_', ' ')}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / analytics.totalDocuments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            {analytics.recentlyAdded.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Recently Added Documents
                </h3>
                <div className="space-y-3">
                  {analytics.recentlyAdded.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">{doc.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{doc.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {doc.document_type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
