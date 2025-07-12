'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';
import { 
  BookOpen, 
  Search, 
  Filter,
  Download,
  Eye,
  FileText,
  ExternalLink,
  Clock,
  Star,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Upload,
  Plus,
  Trash2,
  Edit,
  Database,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { getSupabaseClient } from '../components/AuthProvider';

interface Document {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Enhanced fields for display
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  type?: 'research' | 'guide' | 'reference' | 'case_study';
  featured?: boolean;
  rating?: number;
  downloads?: number;
  views?: number;
}

// Skeleton loader component for performance
const DocumentSkeleton = React.memo(() => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
));

// Memoized document card component
const DocumentCard = React.memo(({ 
  document, 
  viewMode, 
  onView, 
  onDownload,
  onEdit,
  onDelete,
  isOwner
}: {
  document: Document;
  viewMode: 'grid' | 'list';
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  isOwner?: boolean;
}) => {
  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('csv') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📁';
  }, []);

  const getFileTypeColor = useCallback((fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('csv') || fileType.includes('excel')) return 'bg-green-100 text-green-800';
    if (fileType.includes('image')) return 'bg-purple-100 text-purple-800';
    if (fileType.includes('word')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTitle = () => {
    return document.title || document.original_name || document.filename || 'Untitled Document';
  };

  const getDocumentDescription = () => {
    if (document.description) return document.description;
    if (document.metadata?.description) return document.metadata.description;
    return `Uploaded ${new Date(document.created_at).toLocaleDateString()}`;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
              {getFileIcon(document.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{getDocumentTitle()}</h3>
                {document.featured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {isOwner && (
                  <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">Your Document</span>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{getDocumentDescription()}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(document.file_type)}`}>
                  {document.file_type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.upload_status)}`}>
                  {document.upload_status}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatFileSize(document.file_size)}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(document)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onDownload(document)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            {isOwner && onEdit && (
              <button
                onClick={() => onEdit(document)}
                className="px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(document)}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
          {getFileIcon(document.file_type)}
        </div>
        <div className="flex items-center gap-2">
          {document.featured && (
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          )}
          {isOwner && (
            <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">Your Document</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {getDocumentTitle()}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">{getDocumentDescription()}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(document.file_type)}`}>
          {document.file_type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.upload_status)}`}>
          {document.upload_status}
        </span>
        {document.category && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {document.category}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{formatFileSize(document.file_size)}</div>
          <div className="text-xs">Size</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{new Date(document.created_at).toLocaleDateString()}</div>
          <div className="text-xs">Uploaded</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onView(document)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        <button
          onClick={() => onDownload(document)}
          className="flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        {isOwner && onEdit && (
          <button
            onClick={() => onEdit(document)}
            className="flex items-center justify-center py-2 px-4 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(document)}
            className="flex items-center justify-center py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasInitialized = useRef(false);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch documents from database - only once on mount
  const fetchDocuments = useCallback(async () => {
    if (!user || hasInitialized.current) return;
    
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      // Transform database data to match Document interface
      const transformedDocs: Document[] = data.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        original_name: doc.original_name,
        file_size: doc.file_size,
        file_type: doc.file_type,
        file_path: doc.file_path,
        upload_status: doc.upload_status,
        metadata: doc.metadata,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        user_id: doc.user_id,
        // Enhanced fields for display
        title: doc.metadata?.title || doc.original_name,
        description: doc.metadata?.description || `Uploaded ${new Date(doc.created_at).toLocaleDateString()}`,
        category: doc.metadata?.category || 'general',
        tags: doc.metadata?.tags || [],
        type: doc.metadata?.type || 'reference',
        featured: doc.metadata?.featured || false,
        rating: doc.metadata?.rating || 0,
        downloads: doc.metadata?.downloads || 0,
        views: doc.metadata?.views || 0
      }));

      setDocuments(transformedDocs);
      hasInitialized.current = true;
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load documents only once on component mount
  useEffect(() => {
    if (!loading && user && !hasInitialized.current) {
      fetchDocuments();
    }
  }, [loading, user, fetchDocuments]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType = selectedType === 'all' || doc.file_type.includes(selectedType);
      
      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort documents
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'size':
        filtered.sort((a, b) => b.file_size - a.file_size);
        break;
      case 'name':
        filtered.sort((a, b) => (a.original_name || a.filename).localeCompare(b.original_name || b.filename));
        break;
      default:
        break;
    }

    return filtered;
  }, [documents, searchTerm, selectedCategory, selectedType, sortBy]);

  const handleView = (doc: Document) => {
    // For now, just show file info. In a real app, you might want to preview the file
    alert(`Viewing: ${doc.original_name || doc.filename}\nType: ${doc.file_type}\nSize: ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`);
  };

  const handleDownload = (doc: Document) => {
    // Create download link for the file
    const link = document.createElement('a');
    link.href = doc.file_path;
    link.download = doc.original_name || doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (doc: Document) => {
    // Navigate to edit page or open edit modal
    router.push(`/documents/edit/${doc.id}`);
  };

  const handleDelete = async (doc: Document) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id);

        if (error) {
          console.error('Error deleting document:', error);
          return;
        }

        // Remove from local state
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  const handleRefresh = () => {
    hasInitialized.current = false;
    fetchDocuments();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <DocumentSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Documents</h1>
                <p className="text-gray-600">Manage and access your uploaded agricultural documents</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(documents.reduce((sum, doc) => sum + doc.file_size, 0) / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.filter(doc => doc.upload_status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">File Types</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(documents.map(doc => doc.file_type.split('/')[0])).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents by name, type, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="research">Research</option>
                  <option value="guide">Guide</option>
                  <option value="reference">Reference</option>
                  <option value="case_study">Case Study</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="image">Image</option>
                  <option value="word">Word</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="featured">Featured</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'} rounded-l-lg transition-colors`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'} rounded-r-lg transition-colors`}
                  >
                    <div className="w-4 h-4 flex flex-col gap-0.5">
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <DocumentSkeleton key={i} />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedType === 'all' && (
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  viewMode={viewMode}
                  onView={handleView}
                  onDownload={handleDownload}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isOwner={doc.user_id === user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
