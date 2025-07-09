'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Download
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
  report_id: string;
  feedback_type: string;
  rating: number;
  comments: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState('prompts');

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
      
      // Load prompts
      const promptsResponse = await fetch('/api/admin/prompts');
      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json();
        setPrompts(promptsData.prompts || []);
      }

      // Load reports
      const reportsResponse = await fetch('/api/admin/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }

      // Load feedback
      const feedbackResponse = await fetch('/api/admin/feedback');
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData.feedback || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      showNotification('error', 'Failed to load admin data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-md ${notification.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="border-b">
        <nav className="flex space-x-8">
          {['prompts', 'reports', 'feedback', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} 
              {tab === 'prompts' && ` (${prompts.length})`}
              {tab === 'reports' && ` (${reports.length})`}
              {tab === 'feedback' && ` (${feedback.length})`}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prompt Management</h2>
            <button 
              onClick={() => openEditDialog()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus className="h-4 w-4" />
              New Prompt
            </button>
          </div>

          <div className="grid gap-4">
            {prompts.map(prompt => (
              <div key={prompt.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {prompt.title}
                      <span className={`px-2 py-1 text-xs rounded ${
                        prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prompt.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {prompt.sample_type}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePromptActive(prompt.id, prompt.is_active)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      {prompt.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditDialog(prompt)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Language:</strong> {prompt.language} | 
                    <strong> Focus:</strong> {prompt.user_focus || 'None'}
                  </p>
                  <p className="text-sm">
                    <strong>Version:</strong> {prompt.version} | 
                    <strong> Updated:</strong> {new Date(prompt.updated_at).toLocaleDateString()}
                  </p>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">View Template</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {prompt.template.substring(0, 500)}
                      {prompt.template.length > 500 && '...'}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis Reports</h2>
          <div className="grid gap-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Report {report.id.substring(0, 8)}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {report.sample_type}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>User:</strong> {report.user_id}</p>
                  <p><strong>Confidence:</strong> {report.confidence_score}%</p>
                  <p><strong>Created:</strong> {new Date(report.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Feedback</h2>
          <div className="grid gap-4">
            {feedback.map(item => (
              <div key={item.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Feedback {item.id.substring(0, 8)}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {item.feedback_type}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Rating:</strong> {item.rating}/5</p>
                  <p><strong>Report:</strong> {item.report_id.substring(0, 8)}</p>
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

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Total Prompts</h3>
              <p className="text-3xl font-bold">{prompts.length}</p>
              <p className="text-sm text-gray-600">
                {prompts.filter(p => p.is_active).length} active
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Analysis Reports</h3>
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-sm text-gray-600">
                Avg confidence: {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.confidence_score, 0) / reports.length) : 0}%
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">User Feedback</h3>
              <p className="text-3xl font-bold">{feedback.length}</p>
              <p className="text-sm text-gray-600">
                Avg rating: {feedback.length > 0 ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1) : 0}/5
              </p>
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
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sample Type</label>
                  <select
                    value={editForm.sample_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sample_type: e.target.value as 'soil' | 'leaf' }))}
                    className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <textarea
                  value={editForm.template}
                  onChange={(e) => setEditForm(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Prompt template content"
                  rows={10}
                  className="w-full p-2 border rounded-md font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={editForm.language}
                    onChange={(e) => setEditForm(prev => ({ ...prev, language: e.target.value as 'en' | 'ms' }))}
                    className="w-full p-2 border rounded-md"
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
                    className="w-full p-2 border rounded-md"
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
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={savePrompt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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