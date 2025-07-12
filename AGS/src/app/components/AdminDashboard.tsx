'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Users,
  FileText,
  Star,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string | null;
  template: string;
  sample_type: 'soil' | 'leaf';
  language: 'en' | 'ms';
  user_focus: 'sustainability' | 'cost' | 'yield' | 'balanced' | null;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

interface AnalysisReport {
  id: string;
  user_id: string;
  sample_type: string;
  analysis_data: Record<string, unknown>;
  confidence_score: number;
  created_at: string;
}

interface FeedbackEntry {
  id: string;
  report_id: string | null;
  feedback_type: string;
  rating: number;
  comments: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  totalFeedback: number;
  avgRating: number;
  avgConfidence: number;
  activePrompts: number;
  recentActivity: number;
}

export default function AdminDashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalReports: 0,
    totalFeedback: 0,
    avgRating: 0,
    avgConfidence: 0,
    activePrompts: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    template: string;
    sample_type: 'soil' | 'leaf';
    language: 'en' | 'ms';
    user_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
    is_active: boolean;
  }>({
    title: '',
    description: '',
    template: '',
    sample_type: 'soil',
    language: 'en',
    user_focus: 'balanced',
    is_active: true
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      
      // Load all data in parallel
      const [promptsResponse, reportsResponse, feedbackResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/prompts'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/feedback'),
        fetch('/api/admin/dashboard-stats')
      ]);

      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json();
        setPrompts(promptsData.prompts || []);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData.feedback || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        setStats(usersData.stats || {
          totalUsers: usersData.users?.length || 0,
          totalReports: reports.length,
          totalFeedback: feedback.length,
          avgRating: 0,
          avgConfidence: 0,
          activePrompts: prompts.filter(p => p.is_active).length,
          recentActivity: 0
        });
      }

      // Calculate stats
      const avgRating = feedback.length > 0 ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length : 0;
      const avgConfidence = reports.length > 0 ? reports.reduce((acc, r) => acc + r.confidence_score, 0) / reports.length : 0;
      const activePrompts = prompts.filter(p => p.is_active).length;
      const recentActivity = reports.filter(r => {
        const reportDate = new Date(r.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return reportDate > weekAgo;
      }).length;

      setStats(prev => ({
        ...prev,
        avgRating,
        avgConfidence,
        activePrompts,
        recentActivity
      }));

    } catch (error) {
      console.error('Error loading admin data:', error);
      showNotification('error', 'Failed to load admin data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const openEditDialog = (prompt?: Prompt) => {
    if (prompt) {
      setEditForm({
        title: prompt.title,
        description: prompt.description || '',
        template: prompt.template,
        sample_type: prompt.sample_type,
        language: prompt.language,
        user_focus: prompt.user_focus || 'balanced',
        is_active: prompt.is_active
      });
      setSelectedPrompt(prompt);
    } else {
      setEditForm({
        title: '',
        description: '',
        template: '',
        sample_type: 'soil',
        language: 'en',
        user_focus: 'balanced',
        is_active: true
      });
      setSelectedPrompt(null);
    }
    setIsEditDialogOpen(true);
  };

  const savePrompt = async () => {
    try {
      const url = selectedPrompt 
        ? `/api/admin/prompts?id=${selectedPrompt.id}`
        : '/api/admin/prompts';
      
      const method = selectedPrompt ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        showNotification('success', selectedPrompt ? 'Prompt updated successfully' : 'Prompt created successfully');
        setIsEditDialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      showNotification('error', 'Failed to save prompt');
    }
  };

  const deletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/admin/prompts?id=${promptId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('success', 'Prompt deleted successfully');
        loadData();
      } else {
        showNotification('error', 'Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showNotification('error', 'Failed to delete prompt');
    }
  };

  const togglePromptActive = async (promptId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/prompts?id=${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        showNotification('success', `Prompt ${!isActive ? 'activated' : 'deactivated'} successfully`);
        loadData();
      } else {
        showNotification('error', 'Failed to update prompt status');
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      showNotification('error', 'Failed to update prompt status');
    }
  };

  const exportData = async () => {
    try {
      const data = {
        prompts,
        reports: reports.map(r => ({ ...r, analysis_data: JSON.stringify(r.analysis_data) })),
        feedback,
        users,
        stats,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ags-admin-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('success', 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('error', 'Failed to export data');
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && prompt.is_active) ||
                         (filterType === 'inactive' && !prompt.is_active) ||
                         (filterType === prompt.sample_type) ||
                         (filterType === prompt.language);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'soil': return 'bg-orange-100 text-orange-800';
      case 'leaf': return 'bg-blue-100 text-blue-800';
      case 'en': return 'bg-purple-100 text-purple-800';
      case 'ms': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your agricultural analysis system</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-md ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {notification.message}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'prompts', label: 'Prompts', icon: FileText },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
            { id: 'feedback', label: 'Feedback', icon: Star },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Analysis Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Prompts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activePrompts}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}/5</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New analysis report</p>
                      <p className="text-sm text-gray-600">
                        {report.sample_type} analysis • {report.confidence_score}% confidence
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prompt Management</h2>
            <button
              onClick={() => openEditDialog()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Prompt
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prompts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="soil">Soil</option>
              <option value="leaf">Leaf</option>
              <option value="en">English</option>
              <option value="ms">Malay</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{prompt.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(prompt.is_active ? 'active' : 'inactive')}`}>
                      {prompt.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(prompt.sample_type)}`}>
                      {prompt.sample_type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(prompt.language)}`}>
                      {prompt.language.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePromptActive(prompt.id, prompt.is_active)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        prompt.is_active 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {prompt.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditDialog(prompt)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {prompt.description && (
                  <p className="text-gray-600 mb-3">{prompt.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Version: {prompt.version}</span>
                  <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis Reports</h2>
          <div className="grid gap-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Report {report.id.substring(0, 8)}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {report.sample_type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.confidence_score >= 80 ? 'bg-green-100 text-green-800' :
                      report.confidence_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.confidence_score}% confidence
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>User:</strong> {report.user_id.substring(0, 8)}...</p>
                  <p><strong>Created:</strong> {new Date(report.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Feedback</h2>
          <div className="grid gap-4">
            {feedback.map(item => (
              <div key={item.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Feedback {item.id.substring(0, 8)}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {item.feedback_type}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Rating:</strong> {item.rating}/5</p>
                  <p><strong>Report:</strong> {item.report_id ? item.report_id.substring(0, 8) : 'N/A'}</p>
                  <p><strong>Created:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  {item.comments && (
                    <p><strong>Comments:</strong> {item.comments}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <div className="grid gap-4">
            {users.map(user => (
              <div key={user.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user.full_name || 'Unnamed User'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">System Analytics</h2>
          
          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Prompts</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{prompts.length}</p>
              <p className="text-sm text-gray-600">
                {prompts.filter(p => p.is_active).length} active • {prompts.filter(p => !p.is_active).length} inactive
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Analysis Reports</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{reports.length}</p>
              <p className="text-sm text-gray-600">
                Avg confidence: {stats.avgConfidence.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">User Feedback</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{feedback.length}</p>
              <p className="text-sm text-gray-600">
                Avg rating: {stats.avgRating.toFixed(1)}/5
              </p>
            </div>
          </div>

          {/* Sample Type Distribution */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sample Type Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {reports.filter(r => r.sample_type === 'soil').length}
                </p>
                <p className="text-sm text-orange-700">Soil Analysis</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.sample_type === 'leaf').length}
                </p>
                <p className="text-sm text-blue-700">Leaf Analysis</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {reports.slice(0, 10).map((report, index) => (
                <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New {report.sample_type} analysis</p>
                    <p className="text-xs text-gray-600">
                      {report.confidence_score}% confidence • {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Prompt Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPrompt ? 'Modify the prompt details below.' : 'Create a new prompt for the analysis system.'}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Prompt title"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sample Type</label>
                  <select
                    value={editForm.sample_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sample_type: e.target.value as 'soil' | 'leaf' }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="soil">Soil</option>
                    <option value="leaf">Leaf</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the prompt"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <textarea
                  value={editForm.template}
                  onChange={(e) => setEditForm(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Prompt template content"
                  rows={10}
                  className="w-full p-2 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={editForm.language}
                    onChange={(e) => setEditForm(prev => ({ ...prev, language: e.target.value as 'en' | 'ms' }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="ms">Malay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Focus</label>
                  <select
                    value={editForm.user_focus}
                    onChange={(e) => setEditForm(prev => ({ ...prev, user_focus: e.target.value as 'sustainability' | 'cost' | 'yield' | 'balanced' }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="cost">Cost</option>
                    <option value="yield">Yield</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePrompt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Save className="h-4 w-4" />
                {selectedPrompt ? 'Update' : 'Create'} Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}