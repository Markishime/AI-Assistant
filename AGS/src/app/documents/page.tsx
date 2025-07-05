'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { StaggerContainer, StaggerItem, FloatingCard } from '../components/MotionWrapper';

interface DocumentStats {
  documentCount: number;
  hasVectorStore: boolean;
}

interface SearchResult {
  content: string;
  source: string;
  score: number;
}

export default function ReferenceDocuments() {
  const [stats, setStats] = useState<DocumentStats>({ documentCount: 0, hasVectorStore: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reference-documents');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setMessage(data.message);
      } else {
        setMessage('Failed to initialize reference document system');
      }
    } catch (error) {
      console.error('Error initializing system:', error);
      setMessage('Error initializing reference document system');
    } finally {
      setLoading(false);
    }
  };

  const rebuildVectorStore = async () => {
    setLoading(true);
    setMessage('Rebuilding vector store...');
    
    try {
      const response = await fetch('/api/reference-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rebuild' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setMessage('Vector store rebuilt successfully');
      } else {
        setMessage('Failed to rebuild vector store');
      }
    } catch (error) {
      console.error('Error rebuilding vector store:', error);
      setMessage('Error rebuilding vector store');
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch('/api/reference-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
      } else {
        setMessage('Search failed');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      setMessage('Error searching documents');
    } finally {
      setSearchLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await fetch('/api/reference-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Reference Document Management"
      subtitle="Manage AI knowledge base and document storage"
    >
      <StaggerContainer className="space-y-8">
        {/* System Status */}
        <StaggerItem>
          <FloatingCard className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-3">📚</span>
                System Status
              </h2>
              <button
                onClick={refreshStats}
                className="px-4 py-2 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.documentCount}
                </div>
                <div className="text-sm text-gray-600">Document Chunks</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {stats.hasVectorStore ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Vector Store</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <div className="text-sm text-gray-600">RAG Enabled</div>
              </div>
            </div>
            
            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">{message}</p>
              </div>
            )}
          </FloatingCard>
        </StaggerItem>

        {/* Document Search */}
        <StaggerItem>
          <FloatingCard className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🔍</span>
              Search Knowledge Base
            </h2>
            
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for agricultural information..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
              />
              <button
                onClick={searchDocuments}
                disabled={searchLoading || !searchQuery.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Search Results:</h3>
                {searchResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-green-600">
                        {result.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        Relevance: {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {result.content.substring(0, 300)}
                      {result.content.length > 300 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </FloatingCard>
        </StaggerItem>

        {/* Management Actions */}
        <StaggerItem>
          <FloatingCard className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">⚙️</span>
              Management Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Rebuild Vector Store</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Rebuild the vector store from all reference documents. This will re-index all documents and may take several minutes.
                </p>
                <button
                  onClick={rebuildVectorStore}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Rebuilding...' : 'Rebuild Vector Store'}
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Document Location</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Reference documents are stored in the <code className="bg-gray-100 px-2 py-1 rounded">reference_documents</code> folder. Add new documents there and rebuild the vector store.
                </p>
                <button
                  onClick={() => window.open('file:///c:/Users/markc/AI-Assistant/AGS/reference_documents', '_blank')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Open Documents Folder
                </button>
              </div>
            </div>
          </FloatingCard>
        </StaggerItem>

        {/* Available Documents */}
        <StaggerItem>
          <FloatingCard className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📄</span>
              Available Reference Categories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🌱</div>
                <h3 className="font-medium text-gray-900">Best Practices</h3>
                <p className="text-sm text-gray-600 mt-1">Cultivation guidelines</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🦠</div>
                <h3 className="font-medium text-gray-900">Disease Guides</h3>
                <p className="text-sm text-gray-600 mt-1">Disease identification</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium text-gray-900">Research Papers</h3>
                <p className="text-sm text-gray-600 mt-1">Academic research</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-medium text-gray-900">Case Studies</h3>
                <p className="text-sm text-gray-600 mt-1">Real-world examples</p>
              </div>
            </div>
          </FloatingCard>
        </StaggerItem>
      </StaggerContainer>
    </DashboardLayout>
  );
}
